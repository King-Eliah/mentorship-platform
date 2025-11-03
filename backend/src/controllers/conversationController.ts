import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

/**
 * Get all conversations for the current user
 */
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userId1: userId }, { userId2: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeenOnline: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeenOnline: true,
          },
        },
        directMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform to include other user and unread count
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.userId1 === userId ? conv.userId2 : conv.userId1;
        const otherUser = conv.userId1 === userId ? conv.user2 : conv.user1;

        // Count unread messages from other user
        const unreadCount = await prisma.directMessage.count({
          where: {
            conversationId: conv.id,
            senderId: otherUserId,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          otherUser,
          otherUserId,
          lastMessage: conv.directMessages[0] || null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.json({ conversations: transformedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get or create conversation with a specific user
 */
export const getOrCreateConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      res.status(400).json({ message: 'Other user ID is required' });
      return;
    }

    if (userId === otherUserId) {
      res.status(400).json({ message: 'Cannot create conversation with yourself' });
      return;
    }

    // Check if users can message (have contact or admin)
    const canMessage = await validateCanMessage(userId, otherUserId, req.user!.role);

    if (!canMessage) {
      res.status(403).json({
        message: 'You cannot message this user. Add them as a contact first.',
      });
      return;
    }

    // Normalize IDs for unique constraint (smaller ID first)
    const [user1Id, user2Id] = [userId, otherUserId].sort();

    // Get existing or create new conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        userId1_userId2: {
          userId1: user1Id,
          userId2: user2Id,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isOnline: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isOnline: true,
          },
        },
        directMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId1: user1Id,
          userId2: user2Id,
        },
        include: {
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              isOnline: true,
            },
          },
          user2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              isOnline: true,
            },
          },
          directMessages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    // Transform response
    const otherUser = conversation.userId1 === userId ? conversation.user2 : conversation.user1;
    const unreadCount = await prisma.directMessage.count({
      where: {
        conversationId: conversation.id,
        senderId: otherUserId,
        isRead: false,
      },
    });

    res.json({
      conversation: {
        id: conversation.id,
        otherUser,
        lastMessage: conversation.directMessages[0] || null,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get conversation details with messages
 */
export const getConversationDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isOnline: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
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
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      conversation,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error('Get conversation details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

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

    // Delete all messages first
    await prisma.directMessage.deleteMany({
      where: { conversationId },
    });

    // Delete conversation
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify if two users can message each other
 */
async function validateCanMessage(
  userId: string,
  otherUserId: string,
  userRole: string
): Promise<boolean> {
  // Admins can message anyone
  if (userRole === 'ADMIN') {
    return true;
  }

  // Check if both users have established contact relationship
  const hasContact = await prisma.contact.findFirst({
    where: {
      userId,
      contactUserId: otherUserId,
    },
  });

  if (hasContact) {
    return true;
  }

  // Check if both users are in the same Group (via GroupMember)
  const sharedGroupMembership = await prisma.groupMember.findFirst({
    where: {
      userId,
      group: {
        members: {
          some: {
            userId: otherUserId,
          },
        },
      },
    },
  });

  if (sharedGroupMembership) {
    return true;
  }

  // Check if both users are in the same MentorGroup
  const userInMentorGroup = await prisma.mentorGroup.findFirst({
    where: {
      OR: [
        { mentorId: userId },
        { menteeIds: { has: userId } },
      ],
    },
  });

  if (userInMentorGroup) {
    const otherInSameMentorGroup = await prisma.mentorGroup.findFirst({
      where: {
        id: userInMentorGroup.id,
        OR: [
          { mentorId: otherUserId },
          { menteeIds: { has: otherUserId } },
        ],
      },
    });

    if (otherInSameMentorGroup) {
      return true;
    }
  }

  return false;
}
