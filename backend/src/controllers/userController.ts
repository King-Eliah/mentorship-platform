import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        mentorProfile: true,
      },
      });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const { firstName, lastName, bio, avatar, profile, mentorProfile } = req.body;

    // Update user
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update profile if provided
    if (profile) {
      await prisma.profile.upsert({
        where: { userId: id },
        update: profile,
        create: {
          userId: id,
          ...profile,
        },
      });
    }

    // Update mentor profile if provided and user is mentor
    if (mentorProfile && user.role === 'MENTOR') {
      await prisma.mentorProfile.upsert({
        where: { userId: id },
        update: mentorProfile,
        create: {
          userId: id,
          ...mentorProfile,
        },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        mentorProfile: true,
      },
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current and new password required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query, role } = req.query;

    if (!query) {
      res.status(400).json({ message: 'Search query required' });
      return;
    }

    const where: any = {
      isActive: true,
      OR: [
        { firstName: { contains: query as string, mode: 'insensitive' } },
        { lastName: { contains: query as string, mode: 'insensitive' } },
        { email: { contains: query as string, mode: 'insensitive' } },
      ],
    };

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
      },
      take: 20,
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's mentees (for mentors)
export const getMentees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'MENTOR') {
      res.status(403).json({ message: 'Only mentors can access this' });
      return;
    }

    // Find mentor groups where this user is the mentor
    const mentorGroups = await prisma.mentorGroup.findMany({
      where: {
        mentorId: req.user!.id,
        isActive: true
      },
      select: {
        menteeIds: true
      }
    });

    // Collect all unique mentee IDs from all groups
    const allMenteeIds = new Set<string>();
    mentorGroups.forEach(group => {
      group.menteeIds.forEach(id => allMenteeIds.add(id));
    });

    if (allMenteeIds.size === 0) {
      res.json({ mentees: [] });
      return;
    }

    // Fetch all mentees by their IDs
    const mentees = await prisma.user.findMany({
      where: {
        id: { in: Array.from(allMenteeIds) },
        role: 'MENTEE',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true
      }
    });

    res.json({ mentees });
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's mentor (for mentees)
export const getMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only mentees can access this endpoint
    if (req.user!.role !== 'MENTEE') {
      res.status(403).json({ message: 'Only mentees can access this' });
      return;
    }

    // Find mentor group that includes this mentee
    const mentorGroup = await prisma.mentorGroup.findFirst({
      where: {
        menteeIds: {
          has: req.user!.id
        },
        isActive: true
      },
      include: {
        mentor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    if (!mentorGroup) {
      res.json({ mentor: null });
      return;
    }

    res.json({ mentor: mentorGroup.mentor });
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
