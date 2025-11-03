import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Get user notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isRead } = req.query;

    const where: any = { userId: req.user!.id };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    console.log('📋 [GET NOTIFICATIONS] User ID:', req.user!.id);
    console.log('📋 [GET NOTIFICATIONS] Query:', where);

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    console.log('✅ [GET NOTIFICATIONS] Found:', notifications.length, 'notifications');
    if (notifications.length > 0) {
      console.log('📋 [GET NOTIFICATIONS] Sample:', notifications[0]);
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    });

    console.log('📋 [GET NOTIFICATIONS] Unread count:', unreadCount);

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (notification.userId !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ notification: updated });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (notification.userId !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
