import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { io } from '../server';

/**
 * Send a direct message
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { content, replyToId } = req.body;

    // Validation
    if (!conversationId || !content || !content.trim()) {
      res.status(400).json({ message: 'Conversation ID and content are required' });
      return;
    }

    if (content.length > 5000) {
      res.status(400).json({ message: 'Message is too long (max 5000 characters)' });
      return;
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Verify sender is in conversation
    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Get recipient ID
    const recipientId = conversation.userId1 === userId ? conversation.userId2 : conversation.userId1;

    // Create message in database
    const message = await prisma.directMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
        type: 'TEXT',
        replyToId: replyToId || undefined,
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
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Emit WebSocket event to recipient
    io.to(`user-${recipientId}`).emit('message:new', {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: message.sender,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
    });

    res.status(201).json({
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        sender: message.sender,
        content: message.content,
        type: message.type,
        isRead: message.isRead,
        createdAt: message.createdAt,
        replyToId: message.replyToId,
        replyTo: message.replyTo,
      },
    });
  } catch (error) {
    console.error('[sendMessage] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get messages in a conversation
 */
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Verify user is in conversation
    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Get messages
    const messages = await prisma.directMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: Number(limit),
      skip: Number(offset),
    });

    // Mark messages as read for current user
    await prisma.directMessage.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit read receipt
    const otherUserId = conversation.userId1 === userId ? conversation.userId2 : conversation.userId1;
    io.to(`user-${otherUserId}`).emit('messages:read', { conversationId });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Verify user is in conversation
    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Mark all messages from other user as read
    const otherUserId = conversation.userId1 === userId ? conversation.userId2 : conversation.userId1;

    await prisma.directMessage.updateMany({
      where: {
        conversationId,
        senderId: otherUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit read receipt
    io.to(`user-${otherUserId}`).emit('messages:read', { conversationId });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Edit a message
 */
export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    if (content.length > 5000) {
      res.status(400).json({ message: 'Message is too long (max 5000 characters)' });
      return;
    }

    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Verify sender
    if (message.senderId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Edit message
    const updated = await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
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

    // Emit update event
    const otherUserId =
      message.conversation.userId1 === userId
        ? message.conversation.userId2
        : message.conversation.userId1;

    io.to(`user-${otherUserId}`).emit('message:edited', {
      id: updated.id,
      content: updated.content,
      updatedAt: updated.updatedAt,
    });

    res.json({ message: updated });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;

    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Verify sender
    if (message.senderId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Delete message
    await prisma.directMessage.delete({
      where: { id: messageId },
    });

    // Emit delete event
    const otherUserId =
      message.conversation.userId1 === userId
        ? message.conversation.userId2
        : message.conversation.userId1;

    io.to(`user-${otherUserId}`).emit('message:deleted', { messageId });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a message for everyone (same as deleteMessage for now)
 * This is called when user chooses "delete for everyone"
 */
export const deleteMessageForEveryone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;

    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Verify sender
    if (message.senderId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Delete message
    await prisma.directMessage.delete({
      where: { id: messageId },
    });

    // Emit delete event to everyone
    const otherUserId =
      message.conversation.userId1 === userId
        ? message.conversation.userId2
        : message.conversation.userId1;

    io.to(`user-${otherUserId}`).emit('message:deleted-everyone', { 
      messageId,
      conversationId: message.conversationId 
    });

    res.json({ message: 'Message deleted for everyone' });
  } catch (error) {
    console.error('Delete message for everyone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Search messages in a conversation
 */
export const searchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    // Verify user is in conversation
    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Search messages
    const messages = await prisma.directMessage.findMany({
      where: {
        conversationId,
        content: {
          contains: query,
          mode: 'insensitive',
        },
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
