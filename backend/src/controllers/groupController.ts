import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Create group
export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const group = await prisma.group.create({
      data: req.body,
    });

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: req.user!.id,
        role: 'ADMIN',
      },
    });

    res.status(201).json({ group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all groups
export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const where: any = {};
    
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single group
export const getGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    res.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join group
export const joinGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.user!.id,
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'Already a member of this group' });
      return;
    }

    // Check max members
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      res.status(400).json({ message: 'Group is full' });
      return;
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: req.user!.id,
      },
    });

    res.status(201).json({ message: 'Joined group successfully', member });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave group
export const leaveGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.user!.id,
        },
      },
    });

    if (!member) {
      res.status(404).json({ message: 'Not a member of this group' });
      return;
    }

    await prisma.groupMember.delete({
      where: { id: member.id },
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete group
export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is admin of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: req.user!.id,
        },
      },
    });

    if (!member || (member.role !== 'ADMIN' && req.user!.role !== 'ADMIN')) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.group.delete({ where: { id } });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
