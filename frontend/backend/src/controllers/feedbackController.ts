import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Submit feedback
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, subject, message, isAnonymous } = req.body;

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user!.id,
        category,
        subject,
        message,
        status: 'PENDING',
        isAnonymous: isAnonymous || false,
      },
      include: {
        user: {
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

    // Create notification for admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const userName = feedback.isAnonymous ? 'Anonymous' : `${feedback.user.firstName} ${feedback.user.lastName}`;
      
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'FEEDBACK',
            title: `New feedback from ${userName}`,
            message: `${category}: ${subject}`,
          },
        });
      }
      console.log(`✓ Feedback notifications created for ${admins.length} admins`);
    } catch (notifError) {
      console.error('Error creating feedback notification:', notifError);
    }

    console.log('✅ [SUBMIT FEEDBACK] Feedback submitted:', feedback.id);
    res.status(201).json({ feedback });
  } catch (error) {
    console.error('❌ [SUBMIT FEEDBACK] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's feedback
export const getUserFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: req.user!.id },
      include: {
        user: {
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

    res.json({ feedbacks });
  } catch (error) {
    console.error('❌ [GET USER FEEDBACK] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { status, category } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
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

    res.json({ feedbacks });
  } catch (error) {
    console.error('❌ [GET ALL FEEDBACK] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single feedback
export const getFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
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

    if (!feedback) {
      res.status(404).json({ message: 'Feedback not found' });
      return;
    }

    // Check access permissions
    if (feedback.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json({ feedback });
  } catch (error) {
    console.error('❌ [GET FEEDBACK] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update feedback status and response (admin only)
export const updateFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { status, response } = req.body;

    const feedback = await prisma.feedback.findUnique({ where: { id } });

    if (!feedback) {
      res.status(404).json({ message: 'Feedback not found' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (response !== undefined) {
      updateData.response = response;
      // Set respondedBy and respondedAt when response is added for the first time
      if (response && !feedback.response) {
        // Fetch admin's full name
        const admin = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { firstName: true, lastName: true }
        });
        if (admin) {
          updateData.respondedBy = `${admin.firstName} ${admin.lastName}`;
          updateData.respondedAt = new Date();
        }
      }
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        user: {
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

    res.json({ feedback: updated });
  } catch (error) {
    console.error('❌ [UPDATE FEEDBACK] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete feedback
export const deleteFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({ where: { id } });

    if (!feedback) {
      res.status(404).json({ message: 'Feedback not found' });
      return;
    }

    if (feedback.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.feedback.delete({ where: { id } });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('❌ [DELETE FEEDBACK] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const [total, pending, reviewed, resolved] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: 'PENDING' } }),
      prisma.feedback.count({ where: { status: 'REVIEWED' } }),
      prisma.feedback.count({ where: { status: 'RESOLVED' } }),
    ]);

    res.json({
      stats: {
        total,
        pending,
        reviewed,
        resolved,
      },
    });
  } catch (error) {
    console.error('❌ [GET FEEDBACK STATS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
