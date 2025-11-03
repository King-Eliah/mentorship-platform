import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

/**
 * Get all contacts for the current user
 * Auto-populates based on role and group membership
 */
export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Fetch all existing contacts
    const existingContacts = await prisma.contact.findMany({
      where: { userId },
      include: {
        contactUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true,
            isOnline: true,
            lastSeenOnline: true,
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    // Organize by contact type
    const organized = {
      mentors: existingContacts.filter((c) => c.contactType === 'MENTOR'),
      mentees: existingContacts.filter((c) => c.contactType === 'MENTEE'),
      groupMembers: existingContacts.filter((c) => c.contactType === 'GROUP_MEMBER'),
      admins: existingContacts.filter((c) => c.contactType === 'ADMIN'),
      custom: existingContacts.filter((c) => c.contactType === 'CUSTOM'),
    };

    res.json({
      contacts: existingContacts,
      organized,
      total: existingContacts.length,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all available users to browse and message
 * Returns all active users except current user
 */
export const getBrowsableUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const search = req.query.search as string;

    // Build where condition
    const whereCondition: any = {
      id: { not: userId },
      isActive: true,
    };

    if (search) {
      whereCondition.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const browsableUsers = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });

    res.json({
      users: browsableUsers,
      total: browsableUsers.length,
    });
  } catch (error) {
    console.error('Get browsable users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add a custom contact by email
 */
export const addContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { email, notes } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user by email
    const contactUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!contactUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (contactUser.id === userId) {
      res.status(400).json({ message: 'Cannot add yourself as contact' });
      return;
    }

    // Check if contact already exists
    const existingContact = await prisma.contact.findUnique({
      where: {
        userId_contactUserId: {
          userId,
          contactUserId: contactUser.id,
        },
      },
    });

    if (existingContact) {
      res.status(400).json({ message: 'Contact already exists' });
      return;
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        userId,
        contactUserId: contactUser.id,
        contactType: 'CUSTOM',
        notes: notes || null,
      },
      include: {
        contactUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true,
            isOnline: true,
          },
        },
      },
    });

    res.status(201).json({ contact });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Remove a contact
 */
export const removeContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { contactId } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }

    if (contact.userId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Only allow removing CUSTOM contacts
    if (contact.contactType !== 'CUSTOM') {
      res.status(400).json({ message: 'Cannot remove auto-populated contacts' });
      return;
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    res.json({ message: 'Contact removed' });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Block a user from messaging
 */
export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      res.status(400).json({ message: 'Target user ID is required' });
      return;
    }

    if (userId === targetUserId) {
      res.status(400).json({ message: 'Cannot block yourself' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.blockedUsers.includes(targetUserId)) {
      res.status(400).json({ message: 'User already blocked' });
      return;
    }

    // Add to blocked list
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        blockedUsers: [...user.blockedUsers, targetUserId],
      },
    });

    res.json({ message: 'User blocked', blockedUsers: updated.blockedUsers });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Unblock a user
 */
export const unblockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      res.status(400).json({ message: 'Target user ID is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.blockedUsers.includes(targetUserId)) {
      res.status(400).json({ message: 'User not blocked' });
      return;
    }

    // Remove from blocked list
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        blockedUsers: user.blockedUsers.filter((id) => id !== targetUserId),
      },
    });

    res.json({ message: 'User unblocked', blockedUsers: updated.blockedUsers });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get blocked users list
 */
export const getBlockedUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { blockedUsers: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Fetch blocked user details
    const blockedUserDetails = await prisma.user.findMany({
      where: {
        id: { in: user.blockedUsers },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    res.json({
      blockedCount: user.blockedUsers.length,
      blockedUsers: blockedUserDetails,
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Auto-populate contacts when a group is created
 * Called from groupController
 */
export const autoPopulateGroupContacts = async (
  mentorId: string,
  menteeIds: string[]
): Promise<void> => {
  try {
    // For each mentee
    for (const menteeId of menteeIds) {
      // Mentee -> Mentor
      await prisma.contact.upsert({
        where: {
          userId_contactUserId: {
            userId: menteeId,
            contactUserId: mentorId,
          },
        },
        update: {},
        create: {
          userId: menteeId,
          contactUserId: mentorId,
          contactType: 'MENTOR',
        },
      });

      // Mentor -> Mentee
      await prisma.contact.upsert({
        where: {
          userId_contactUserId: {
            userId: mentorId,
            contactUserId: menteeId,
          },
        },
        update: {},
        create: {
          userId: mentorId,
          contactUserId: menteeId,
          contactType: 'MENTEE',
        },
      });
    }

    // Mentees -> Mentees (group members)
    for (let i = 0; i < menteeIds.length; i++) {
      for (let j = i + 1; j < menteeIds.length; j++) {
        // Mentee i -> Mentee j
        await prisma.contact.upsert({
          where: {
            userId_contactUserId: {
              userId: menteeIds[i],
              contactUserId: menteeIds[j],
            },
          },
          update: {},
          create: {
            userId: menteeIds[i],
            contactUserId: menteeIds[j],
            contactType: 'GROUP_MEMBER',
          },
        });

        // Mentee j -> Mentee i
        await prisma.contact.upsert({
          where: {
            userId_contactUserId: {
              userId: menteeIds[j],
              contactUserId: menteeIds[i],
            },
          },
          update: {},
          create: {
            userId: menteeIds[j],
            contactUserId: menteeIds[i],
            contactType: 'GROUP_MEMBER',
          },
        });
      }
    }

    // Everyone -> All Admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const allUserIds = [mentorId, ...menteeIds];

    for (const userId of allUserIds) {
      for (const admin of admins) {
        if (userId !== admin.id) {
          await prisma.contact.upsert({
            where: {
              userId_contactUserId: {
                userId,
                contactUserId: admin.id,
              },
            },
            update: {},
            create: {
              userId,
              contactUserId: admin.id,
              contactType: 'ADMIN',
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Auto-populate contacts error:', error);
    throw error;
  }
};

/**
 * Send a contact request to another user
 */
export const sendContactRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { receiverId, message } = req.body;

    if (!receiverId) {
      res.status(400).json({ message: 'Receiver ID is required' });
      return;
    }

    if (senderId === receiverId) {
      res.status(400).json({ message: 'Cannot send request to yourself' });
      return;
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if request already exists
    const existingRequest = await prisma.contactRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      // If existing is rejected, allow re-sending
      if (existingRequest.status === 'REJECTED') {
        const updated = await prisma.contactRequest.update({
          where: { id: existingRequest.id },
          data: {
            status: 'PENDING',
            message: message || null,
            respondedAt: null,
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
        res.status(200).json(updated);
        return;
      }
      res.status(400).json({ message: 'Request already exists' });
      return;
    }

    // Check if contact already exists
    const existingContact = await prisma.contact.findUnique({
      where: {
        userId_contactUserId: {
          userId: senderId,
          contactUserId: receiverId,
        },
      },
    });

    if (existingContact) {
      res.status(400).json({ message: 'Already in contacts' });
      return;
    }

    // Create request
    const request = await prisma.contactRequest.create({
      data: {
        senderId,
        receiverId,
        message: message || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notification for contact request
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { firstName: true, lastName: true },
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'SYSTEM',
        title: `Contact request from ${sender?.firstName} ${sender?.lastName}`,
        message: `${sender?.firstName} ${sender?.lastName} sent you a contact request${message ? `: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"` : ''}`,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Send contact request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get pending contact requests for the current user
 */
export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const requests = await prisma.contactRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all sent contact requests (for tracking status)
 */
export const getSentRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const requests = await prisma.contactRequest.findMany({
      where: { senderId: userId },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Accept a contact request
 */
export const acceptContactRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { requestId } = req.params;

    const request = await prisma.contactRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.receiverId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({ message: 'Request already processed' });
      return;
    }

    // Update request status
    const updatedRequest = await prisma.contactRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // Create mutual contacts
    // Contact from receiver's perspective (receiver added sender)
    await prisma.contact.upsert({
      where: {
        userId_contactUserId: {
          userId: request.receiverId,
          contactUserId: request.senderId,
        },
      },
      update: { contactType: 'CUSTOM' },
      create: {
        userId: request.receiverId,
        contactUserId: request.senderId,
        contactType: 'CUSTOM',
      },
    });

    // Contact from sender's perspective (sender added receiver)
    await prisma.contact.upsert({
      where: {
        userId_contactUserId: {
          userId: request.senderId,
          contactUserId: request.receiverId,
        },
      },
      update: { contactType: 'CUSTOM' },
      create: {
        userId: request.senderId,
        contactUserId: request.receiverId,
        contactType: 'CUSTOM',
      },
    });

    // Create notification for sender that request was accepted
    const receiver = await prisma.user.findUnique({
      where: { id: request.receiverId },
      select: { firstName: true, lastName: true },
    });

    await prisma.notification.create({
      data: {
        userId: request.senderId,
        type: 'SYSTEM',
        title: 'Contact request accepted',
        message: `${receiver?.firstName} ${receiver?.lastName} accepted your contact request`,
      },
    });

    res.json({
      message: 'Request accepted',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Accept contact request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reject a contact request
 */
export const rejectContactRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { requestId } = req.params;

    const request = await prisma.contactRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.receiverId !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({ message: 'Request already processed' });
      return;
    }

    // Update request status
    const updatedRequest = await prisma.contactRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });

    res.json({
      message: 'Request rejected',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Reject contact request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Search for a user by ID
 */
export const searchUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { userId: searchId } = req.params;

    // Can't search for yourself
    if (searchId === userId) {
      res.status(400).json({ message: 'Cannot add yourself' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: searchId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        isOnline: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user,
      message: 'User found',
    });
  } catch (error) {
    console.error('Search user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
