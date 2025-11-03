import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Create session log (utility function, called automatically by middleware)
export const createSessionLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, metadata } = req.body;

    const log = await prisma.sessionLog.create({
      data: {
        userId: req.user!.id,
        action,
        metadata,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
      },
    });

    res.status(201).json({ log });
  } catch (error) {
    console.error('❌ [CREATE SESSION LOG] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's session logs
export const getUserSessionLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '50', action } = req.query;

    const where: any = { userId: req.user!.id };
    if (action) where.action = action;

    const logs = await prisma.sessionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ logs });
  } catch (error) {
    console.error('❌ [GET USER SESSION LOGS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all session logs (admin only)
export const getAllSessionLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { userId, action, limit = '100', page = '1' } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.sessionLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.sessionLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ [GET ALL SESSION LOGS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session log statistics (admin only)
export const getSessionLogStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, last24h, last7d, byAction] = await Promise.all([
      prisma.sessionLog.count(),
      prisma.sessionLog.count({ where: { createdAt: { gte: last24Hours } } }),
      prisma.sessionLog.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.sessionLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      stats: {
        total,
        last24Hours: last24h,
        last7Days: last7d,
        topActions: byAction,
      },
    });
  } catch (error) {
    console.error('❌ [GET SESSION LOG STATS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete old session logs (admin only, for maintenance)
export const deleteOldSessionLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { days = '90' } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

    const result = await prisma.sessionLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    res.json({
      message: `Deleted ${result.count} session logs older than ${days} days`,
      count: result.count,
    });
  } catch (error) {
    console.error('❌ [DELETE OLD SESSION LOGS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
