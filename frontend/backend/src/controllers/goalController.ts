import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { trackActivity } from './recentActivityController';

// Create goal
export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Only include fields that exist in the Prisma schema
    const goalData: any = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status,
      priority: req.body.priority,
      userId: req.user!.id,
      needsHelp: req.body.needsHelp || false,
    };

    if (req.body.dueDate) {
      goalData.dueDate = new Date(req.body.dueDate);
    }

    if (req.body.completedAt) {
      goalData.completedAt = new Date(req.body.completedAt);
    }

    if (req.body.helpRequestedAt) {
      goalData.helpRequestedAt = new Date(req.body.helpRequestedAt);
    }

    const goal = await prisma.goal.create({
      data: goalData,
    });

    // Track activity
    await trackActivity(
      req.user!.id,
      'GOAL_CREATED',
      `Created goal: ${goal.title}`,
      `New goal "${goal.title}" in ${goal.category || 'General'} category`,
      {
        relatedEntityId: goal.id,
        relatedEntityType: 'goal',
        metadata: { priority: goal.priority, status: goal.status }
      }
    );

    res.status(201).json({ goal });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's goals
export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = { userId: req.user!.id };
    
    // Handle status filter - can be single value or array
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update goal
export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({ where: { id } });
    
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    if (goal.userId !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Only include fields that exist in the Prisma schema
    const updateData: any = {};
    
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.needsHelp !== undefined) updateData.needsHelp = req.body.needsHelp;
    
    if (req.body.dueDate) updateData.dueDate = new Date(req.body.dueDate);
    if (req.body.completedAt) updateData.completedAt = new Date(req.body.completedAt);
    if (req.body.helpRequestedAt !== undefined) {
      updateData.helpRequestedAt = req.body.helpRequestedAt ? new Date(req.body.helpRequestedAt) : null;
    }
    
    if (req.body.status === 'COMPLETED' && !goal.completedAt) {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    // Track activity if status changed to completed
    if (req.body.status === 'COMPLETED' && goal.status !== 'COMPLETED') {
      await trackActivity(
        req.user!.id,
        'GOAL_COMPLETED',
        `Completed goal: ${updated.title}`,
        `Successfully completed "${updated.title}"`,
        {
          relatedEntityId: updated.id,
          relatedEntityType: 'goal',
          metadata: { priority: updated.priority, category: updated.category }
        }
      );
    } else if (req.body.status && req.body.status !== goal.status) {
      await trackActivity(
        req.user!.id,
        'GOAL_UPDATED',
        `Updated goal: ${updated.title}`,
        `Changed status from ${goal.status} to ${updated.status}`,
        {
          relatedEntityId: updated.id,
          relatedEntityType: 'goal',
          metadata: { oldStatus: goal.status, newStatus: updated.status }
        }
      );
    }

    // Create notification for mentor when mentee requests help
    if (req.body.needsHelp === true && !goal.needsHelp) {
      try {
        // Get mentee's user info
        const mentee = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { firstName: true, lastName: true }
        });

        // Find mentor(s) for this mentee
        const mentorGroups = await prisma.mentorGroup.findMany({
          where: {
            menteeIds: { has: req.user!.id },
            isActive: true
          },
          select: { mentorId: true }
        });

        // Create notification for each mentor
        for (const group of mentorGroups) {
          await prisma.notification.create({
            data: {
              userId: group.mentorId,
              type: 'GOAL',
              title: `${mentee?.firstName} ${mentee?.lastName} needs help`,
              message: `Goal: "${updated.title}" - ${updated.description?.substring(0, 100)}...`,
            }
          });
        }
        
        if (mentorGroups.length > 0) {
          console.log(`✓ Help request notification created for ${mentorGroups.length} mentor(s)`);
        }
      } catch (notifError) {
        console.error('Error creating help request notification:', notifError);
      }
    }

    res.json({ goal: updated });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete goal
export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({ where: { id } });
    
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    if (goal.userId !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.goal.delete({ where: { id } });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get goal statistics for a user
export const getGoalStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [
      totalGoals,
      completedGoals,
      inProgressGoals,
      overdueGoals
    ] = await Promise.all([
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.goal.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.goal.count({
        where: {
          userId,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() }
        }
      })
    ]);

    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const stats = {
      totalGoals,
      completedGoals,
      inProgressGoals,
      overdueGoals,
      completionRate
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get goal stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mentee goals for a mentor
export const getMenteeGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentorId = req.user!.id;
    const { menteeId } = req.params;

    // Verify the mentor-mentee relationship through MentorGroup
    const mentorGroup = await prisma.mentorGroup.findFirst({
      where: {
        mentorId: mentorId,
        menteeIds: {
          has: menteeId
        },
        isActive: true
      }
    });

    if (!mentorGroup) {
      res.status(403).json({ message: 'Not authorized to view this mentee\'s goals' });
      return;
    }

    const goals = await prisma.goal.findMany({
      where: { userId: menteeId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ goals });
  } catch (error) {
    console.error('Get mentee goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all mentees' goals for a mentor (dashboard view)
export const getAllMenteesGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentorId = req.user!.id;

    // Get all mentee IDs from mentor's groups
    const mentorGroups = await prisma.mentorGroup.findMany({
      where: { 
        mentorId: mentorId,
        isActive: true
      },
      select: { menteeIds: true }
    });

    // Flatten all mentee IDs
    const menteeIds = mentorGroups.flatMap(group => group.menteeIds);
    const uniqueMenteeIds = [...new Set(menteeIds)];

    if (uniqueMenteeIds.length === 0) {
      res.json({ goals: [] });
      return;
    }

    // Get all goals for these mentees
    const goals = await prisma.goal.findMany({
      where: { userId: { in: uniqueMenteeIds } },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ goals });
  } catch (error) {
    console.error('Get all mentees goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all goals (Admin only)
export const getAllGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied. Admin only.' });
      return;
    }

    const goals = await prisma.goal.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ goals });
  } catch (error) {
    console.error('Get all goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

