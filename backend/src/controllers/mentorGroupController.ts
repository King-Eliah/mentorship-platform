import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { autoPopulateGroupContacts } from './contactController';

// Get all mentor groups (Admin only)
export const getAllMentorGroups = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentorGroups = await prisma.mentorGroup.findMany({
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Populate mentees for each group
    const groupsWithMentees = await Promise.all(
      mentorGroups.map(async (group) => {
        const mentees = await prisma.user.findMany({
          where: {
            id: { in: group.menteeIds },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        });

        return {
          ...group,
          mentorName: `${group.mentor.firstName} ${group.mentor.lastName}`,
          mentees,
          members: mentees, // Alias for backward compatibility
        };
      })
    );

    res.json({ groups: groupsWithMentees });
  } catch (error) {
    console.error('Get all mentor groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my mentor groups (role-based)
export const getMyMentorGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let mentorGroups;

    if (userRole === 'ADMIN') {
      // Admin sees all groups
      mentorGroups = await prisma.mentorGroup.findMany({
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'MENTOR') {
      // Mentor sees their groups
      mentorGroups = await prisma.mentorGroup.findMany({
        where: { mentorId: userId },
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Mentee sees groups they belong to
      mentorGroups = await prisma.mentorGroup.findMany({
        where: {
          menteeIds: {
            has: userId,
          },
        },
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Populate mentees for each group
    const groupsWithMentees = await Promise.all(
      mentorGroups.map(async (group) => {
        const mentees = await prisma.user.findMany({
          where: {
            id: { in: group.menteeIds },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        });

        return {
          ...group,
          mentorName: `${group.mentor.firstName} ${group.mentor.lastName}`,
          mentees,
          members: mentees, // Alias for backward compatibility
        };
      })
    );

    res.json({ groups: groupsWithMentees });
  } catch (error) {
    console.error('Get my mentor groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create mentor group manually
export const createMentorGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, description, mentorId, menteeIds, maxMembers } = req.body;

    // Validate mentor exists and is a mentor
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== 'MENTOR') {
      res.status(400).json({ message: 'Invalid mentor ID' });
      return;
    }

    // Validate mentees exist and are mentees
    if (menteeIds && menteeIds.length > 0) {
      const mentees = await prisma.user.findMany({
        where: {
          id: { in: menteeIds },
          role: 'MENTEE',
        },
      });

      if (mentees.length !== menteeIds.length) {
        res.status(400).json({ message: 'Some mentee IDs are invalid' });
        return;
      }
    }

    const group = await prisma.mentorGroup.create({
      data: {
        name,
        description,
        mentorId,
        menteeIds: menteeIds || [],
        maxMembers,
        isActive: true,
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Auto-populate contacts for group members (Phase 1 - Group Integration)
    if (group.menteeIds && group.menteeIds.length > 0) {
      await autoPopulateGroupContacts(mentorId, group.menteeIds);
    }

    // Get mentees
    const mentees = await prisma.user.findMany({
      where: {
        id: { in: group.menteeIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });

    res.status(201).json({
      group: {
        ...group,
        mentorName: `${group.mentor.firstName} ${group.mentor.lastName}`,
        mentees,
        members: mentees,
      },
    });
  } catch (error) {
    console.error('Create mentor group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create mentor groups randomly
export const createMentorGroupsRandomly = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { menteesPerMentor, mentorIds, menteeIds } = req.body;

    // Validate mentors
    const mentors = await prisma.user.findMany({
      where: {
        id: { in: mentorIds },
        role: 'MENTOR',
      },
    });

    if (mentors.length !== mentorIds.length) {
      res.status(400).json({ message: 'Some mentor IDs are invalid' });
      return;
    }

    // Validate mentees
    const mentees = await prisma.user.findMany({
      where: {
        id: { in: menteeIds },
        role: 'MENTEE',
      },
    });

    if (mentees.length !== menteeIds.length) {
      res.status(400).json({ message: 'Some mentee IDs are invalid' });
      return;
    }

    // Fisher-Yates shuffle algorithm
    const shuffledMentees = [...menteeIds];
    for (let i = shuffledMentees.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledMentees[i], shuffledMentees[j]] = [shuffledMentees[j], shuffledMentees[i]];
    }

    // Distribute mentees to mentors
    const createdGroups = [];
    let menteeIndex = 0;

    for (const mentorId of mentorIds) {
      const mentor = mentors.find(m => m.id === mentorId)!;
      const groupMentees = shuffledMentees.slice(menteeIndex, menteeIndex + menteesPerMentor);
      menteeIndex += menteesPerMentor;

      if (groupMentees.length === 0) break;

      const group = await prisma.mentorGroup.create({
        data: {
          name: `${mentor.firstName} ${mentor.lastName}'s Group`,
          description: `Mentorship group led by ${mentor.firstName} ${mentor.lastName}`,
          mentorId,
          menteeIds: groupMentees,
          maxMembers: menteesPerMentor,
          isActive: true,
        },
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Get mentees for this group
      const groupMenteesData = await prisma.user.findMany({
        where: {
          id: { in: group.menteeIds },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      });

      createdGroups.push({
        ...group,
        mentorName: `${group.mentor.firstName} ${group.mentor.lastName}`,
        mentees: groupMenteesData,
        members: groupMenteesData,
      });
    }

    res.status(201).json({ groups: createdGroups, count: createdGroups.length });
  } catch (error) {
    console.error('Create random mentor groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update mentor group
export const updateMentorGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, menteeIds, maxMembers, isActive } = req.body;

    const group = await prisma.mentorGroup.findUnique({
      where: { id },
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Validate mentees if provided
    if (menteeIds) {
      const mentees = await prisma.user.findMany({
        where: {
          id: { in: menteeIds },
          role: 'MENTEE',
        },
      });

      if (mentees.length !== menteeIds.length) {
        res.status(400).json({ message: 'Some mentee IDs are invalid' });
        return;
      }
    }

    const updatedGroup = await prisma.mentorGroup.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(menteeIds && { menteeIds }),
        ...(maxMembers && { maxMembers }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Get mentees
    const mentees = await prisma.user.findMany({
      where: {
        id: { in: updatedGroup.menteeIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });

    res.json({
      group: {
        ...updatedGroup,
        mentorName: `${updatedGroup.mentor.firstName} ${updatedGroup.mentor.lastName}`,
        mentees,
        members: mentees,
      },
    });
  } catch (error) {
    console.error('Update mentor group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete mentor group
export const deleteMentorGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const group = await prisma.mentorGroup.findUnique({
      where: { id },
    });

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    await prisma.mentorGroup.delete({
      where: { id },
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete mentor group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available users for group creation
export const getAvailableUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentors = await prisma.user.findMany({
      where: {
        role: 'MENTOR',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
      orderBy: { firstName: 'asc' },
    });

    const mentees = await prisma.user.findMany({
      where: {
        role: 'MENTEE',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
      orderBy: { firstName: 'asc' },
    });

    res.json({ mentors, mentees });
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
