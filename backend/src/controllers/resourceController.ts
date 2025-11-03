import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Create resource
export const createResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only mentors and admins can create resources
    if (req.user!.role !== 'MENTOR' && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only mentors and admins can upload resources' });
      return;
    }

    const { title, description, type, url, filePath, category, isPublic } = req.body;

    const resource = await prisma.resource.create({
      data: {
        userId: req.user!.id,
        title,
        description,
        type,
        url,
        filePath,
        category,
        isPublic: isPublic !== undefined ? isPublic : true,
      },
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
    });

    console.log('✅ [CREATE RESOURCE] Resource created:', resource.id);
    res.status(201).json({ resource });
  } catch (error) {
    console.error('❌ [CREATE RESOURCE] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all resources (public + user's private)
export const getResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, search } = req.query;

    const where: any = {
      OR: [
        { isPublic: true },
        { userId: req.user!.id },
      ],
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (search) {
      where.AND = [
        where.AND || {},
        {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const resources = await prisma.resource.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({ resources });
  } catch (error) {
    console.error('❌ [GET RESOURCES] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's resources
export const getUserResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resources = await prisma.resource.findMany({
      where: { userId: req.user!.id },
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({ resources });
  } catch (error) {
    console.error('❌ [GET USER RESOURCES] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single resource
export const getResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({
      where: { id },
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
    });

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    // Check access permissions
    if (!resource.isPublic && resource.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Increment download count
    await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    res.json({ resource });
  } catch (error) {
    console.error('❌ [GET RESOURCE] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update resource
export const updateResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({ where: { id } });

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    if (resource.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: req.body,
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
    });

    res.json({ resource: updated });
  } catch (error) {
    console.error('❌ [UPDATE RESOURCE] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete resource
export const deleteResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({ where: { id } });

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    if (resource.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.resource.delete({ where: { id } });

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('❌ [DELETE RESOURCE] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resource statistics
export const getResourceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalShared, totalDownloads, byType] = await Promise.all([
      prisma.resource.count({ where: { userId: req.user!.id } }),
      prisma.resource.aggregate({
        where: { userId: req.user!.id },
        _sum: { downloads: true },
      }),
      prisma.resource.groupBy({
        by: ['type'],
        where: { userId: req.user!.id },
        _count: true,
      }),
    ]);

    res.json({
      stats: {
        totalShared,
        totalDownloads: totalDownloads._sum.downloads || 0,
        byType,
      },
    });
  } catch (error) {
    console.error('❌ [GET RESOURCE STATS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
