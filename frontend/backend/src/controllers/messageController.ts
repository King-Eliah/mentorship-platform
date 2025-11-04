import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { io } from '../server';

// Send message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { receiverId, groupId, content } = req.body;

    if (!receiverId && !groupId) {
      res.status(400).json({ message: 'Either receiverId or groupId required' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user!.id,
        receiverId,
        groupId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for direct message
    if (receiverId) {
      try {
        const sender = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { firstName: true, lastName: true },
        });
        
        const notification = await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'MESSAGE',
            title: `New message from ${sender?.firstName} ${sender?.lastName}`,
            message: `"${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          },
        });
        console.log(`✓ Notification created for user ${receiverId}:`, notification.id);
      } catch (notifError) {
        console.error('Error creating notification for direct message:', notifError);
      }
    } else if (groupId) {
      // Create notification for group members
      try {
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          select: { name: true },
        });
        
        const sender = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { firstName: true, lastName: true },
        });

        if (group) {
          // Get actual group member user IDs
          const groupMembers = await prisma.groupMember.findMany({
            where: { groupId: groupId },
            select: { userId: true },
          });
          
          const memberIds = groupMembers.map(m => m.userId).filter(id => id !== req.user!.id);
          for (const memberId of memberIds) {
            await prisma.notification.create({
              data: {
                userId: memberId,
                type: 'GROUP',
                title: `New message in ${group.name}`,
                message: `${sender?.firstName} ${sender?.lastName}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
              },
            });
          }
          console.log(`✓ Group notifications created for ${memberIds.length} members`);
        }
      } catch (notifError) {
        console.error('Error creating group notifications:', notifError);
      }
    }

    // Emit socket event
    if (receiverId) {
      io.to(`user-${receiverId}`).emit('new-message', message);
    } else if (groupId) {
      io.to(`group-${groupId}`).emit('new-message', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversations
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user!.id },
          { receiverId: req.user!.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Group by conversation partner
    const conversations = new Map();
    
    messages.forEach((msg) => {
      const partnerId = msg.senderId === req.user!.id ? msg.receiverId : msg.senderId;
      if (partnerId && !conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner: msg.senderId === req.user!.id ? msg.receiver : msg.sender,
          lastMessage: msg,
        });
      }
    });

    res.json({ conversations: Array.from(conversations.values()) });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages with specific user
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, groupId } = req.query;

    const where: any = {};

    if (userId) {
      where.OR = [
        { senderId: req.user!.id, receiverId: userId },
        { senderId: userId, receiverId: req.user!.id },
      ];
    } else if (groupId) {
      where.groupId = groupId;
    } else {
      res.status(400).json({ message: 'userId or groupId required' });
      return;
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    // Mark messages as read
    if (userId) {
      await prisma.message.updateMany({
        where: {
          senderId: userId as string,
          receiverId: req.user!.id,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
