import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Get recent activities for the current user only
export const getRecentActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '20', userId, type, isPublic } = req.query;
    const currentUserId = req.user!.id;

    const where: any = {};

    // If userId is specified, get activities for that user (must be public unless it's the current user)
    if (userId && typeof userId === 'string') {
      where.userId = userId;
      if (userId !== currentUserId) {
        where.isPublic = true;
      }
    } else {
      // Only show the current user's own activities (not public activities from others)
      where.userId = currentUserId;
    }

    if (type && typeof type === 'string') {
      where.type = type;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    const activities = await prisma.recentActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        description: true,
        relatedEntityId: true,
        relatedEntityType: true,
        metadata: true,
        isPublic: true,
        createdAt: true,
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('❌  Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new recent activity entry
export const createRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, title, description, relatedEntityId, relatedEntityType, metadata, isPublic = true } = req.body;

    if (!type || !title || !description) {
      res.status(400).json({ message: 'Type, title, and description are required' });
      return;
    }

    const activity = await prisma.recentActivity.create({
      data: {
        userId: req.user!.id,
        type,
        title,
        description,
        relatedEntityId,
        relatedEntityType,
        metadata: metadata || {},
        isPublic
      }
    });

    console.log('✅  Activity created:', activity.id);
    res.status(201).json({ activity });
  } catch (error) {
    console.error('❌  Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a recent activity
export const deleteRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const activity = await prisma.recentActivity.findUnique({ where: { id } });

    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // Only the owner or admin can delete
    if (activity.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.recentActivity.delete({ where: { id } });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('❌  Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get activity statistics
export const getRecentActivityStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [totalActivities, activitiesThisWeek, activitiesThisMonth] = await Promise.all([
      prisma.recentActivity.count({ where: { userId } }),
      prisma.recentActivity.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.recentActivity.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
    ]);

    // Get activity types breakdown
    const activitiesByType = await prisma.recentActivity.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true }
    });

    res.json({
      stats: {
        total: totalActivities,
        thisWeek: activitiesThisWeek,
        thisMonth: activitiesThisMonth,
        byType: activitiesByType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('❌ [GET RECENT ACTIVITY STATS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to track activities automatically (can be called from other controllers)
export const trackActivity = async (
  userId: string,
  type: string,
  title: string,
  description: string,
  options?: {
    relatedEntityId?: string;
    relatedEntityType?: string;
    metadata?: any;
    isPublic?: boolean;
  }
): Promise<void> => {
  try {
    await prisma.recentActivity.create({
      data: {
        userId,
        type,
        title,
        description,
        relatedEntityId: options?.relatedEntityId,
        relatedEntityType: options?.relatedEntityType,
        metadata: options?.metadata || {},
        isPublic: options?.isPublic ?? true
      }
    });
    console.log(`✅ [TRACK ACTIVITY] ${type} tracked for user ${userId}`);
  } catch (error) {
    console.error('❌ [TRACK ACTIVITY] Error:', error);
    // Don't throw error, just log it - activity tracking shouldn't break main operations
  }
};
