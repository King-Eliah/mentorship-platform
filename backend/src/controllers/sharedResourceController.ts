import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Share resources with mentees
export const shareResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only mentors and admins can share resources
    if (req.user!.role !== 'MENTOR' && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only mentors and admins can share resources' });
      return;
    }

    const { resourceIds, menteeIds } = req.body;

    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      res.status(400).json({ message: 'Resource IDs are required' });
      return;
    }

    if (!Array.isArray(menteeIds) || menteeIds.length === 0) {
      res.status(400).json({ message: 'Mentee IDs are required' });
      return;
    }

    // Verify all resources exist and belong to the user (or are public)
    const resources = await prisma.resource.findMany({
      where: {
        id: { in: resourceIds },
        OR: [
          { userId: req.user!.id },
          { isPublic: true }
        ]
      }
    });

    if (resources.length !== resourceIds.length) {
      res.status(404).json({ message: 'Some resources not found or not accessible' });
      return;
    }

    // Verify all mentees exist and have MENTEE role
    const mentees = await prisma.user.findMany({
      where: {
        id: { in: menteeIds },
        role: 'MENTEE',
        isActive: true
      }
    });

    if (mentees.length !== menteeIds.length) {
      res.status(404).json({ message: 'Some mentees not found or not active' });
      return;
    }

    // If user is a mentor, verify the mentees are in their group
    if (req.user!.role === 'MENTOR') {
      const mentorGroups = await prisma.mentorGroup.findMany({
        where: {
          mentorId: req.user!.id,
          isActive: true
        }
      });

      const assignedMenteeIds = mentorGroups.flatMap(group => group.menteeIds);
      const invalidMentees = menteeIds.filter(id => !assignedMenteeIds.includes(id));

      if (invalidMentees.length > 0) {
        res.status(403).json({ 
          message: 'You can only share resources with your assigned mentees' 
        });
        return;
      }
    }

    // Create shared resource records (use createMany with skipDuplicates to avoid errors)
    const sharesToCreate = resourceIds.flatMap(resourceId =>
      menteeIds.map(menteeId => ({
        resourceId,
        sharedById: req.user!.id,
        sharedWithId: menteeId
      }))
    );

    const result = await prisma.sharedResource.createMany({
      data: sharesToCreate,
      skipDuplicates: true
    });

    // Create notifications for mentees
    if (result.count > 0) {
      try {
        const sharer = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { firstName: true, lastName: true }
        });

        const resourceCount = resourceIds.length;
        const resourceWord = resourceCount === 1 ? 'resource' : 'resources';

        for (const menteeId of menteeIds) {
          await prisma.notification.create({
            data: {
              userId: menteeId,
              type: 'ACTIVITY',
              title: `${sharer?.firstName} ${sharer?.lastName} shared ${resourceWord} with you`,
              message: `${resourceCount} ${resourceWord} have been shared with you`,
            }
          });
        }
        
        console.log(`✓ Resource share notifications created for ${menteeIds.length} mentee(s)`);
      } catch (notifError) {
        console.error('Error creating resource share notification:', notifError);
      }
    }

    console.log(`✅ [SHARE RESOURCES] Shared ${resourceIds.length} resources with ${menteeIds.length} mentees`);
    
    res.status(201).json({ 
      message: `Shared ${resourceIds.length} resource(s) with ${menteeIds.length} mentee(s)`,
      shared: result.count
    });
  } catch (error) {
    console.error('❌ [SHARE RESOURCES] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resources shared with the current user (mentee view)
export const getSharedWithMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sharedResources = await prisma.sharedResource.findMany({
      where: {
        sharedWithId: req.user!.id
      },
      include: {
        resource: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        sharedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ sharedResources });
  } catch (error) {
    console.error('❌ [GET SHARED WITH ME] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resources I've shared with others (mentor view)
export const getSharedByMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sharedResources = await prisma.sharedResource.findMany({
      where: {
        sharedById: req.user!.id
      },
      include: {
        resource: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        sharedWith: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ sharedResources });
  } catch (error) {
    console.error('❌ [GET SHARED BY ME] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a shared resource as viewed
export const markAsViewed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sharedResource = await prisma.sharedResource.findUnique({
      where: { id }
    });

    if (!sharedResource) {
      res.status(404).json({ message: 'Shared resource not found' });
      return;
    }

    if (sharedResource.sharedWithId !== req.user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updated = await prisma.sharedResource.update({
      where: { id },
      data: { viewedAt: new Date() }
    });

    res.json({ sharedResource: updated });
  } catch (error) {
    console.error('❌ [MARK AS VIEWED] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mentor's mentees (for the share resources page)
export const getMyMentees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'MENTOR' && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only mentors and admins can access this' });
      return;
    }

    // For admins, get all mentees
    if (req.user!.role === 'ADMIN') {
      const mentees = await prisma.user.findMany({
        where: {
          role: 'MENTEE',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          createdAt: true
        },
        orderBy: {
          firstName: 'asc'
        }
      });

      res.json({ mentees });
      return;
    }

    // For mentors, get assigned mentees from their groups
    const mentorGroups = await prisma.mentorGroup.findMany({
      where: {
        mentorId: req.user!.id,
        isActive: true
      }
    });

    const menteeIds = [...new Set(mentorGroups.flatMap(group => group.menteeIds))];

    if (menteeIds.length === 0) {
      res.json({ mentees: [] });
      return;
    }

    const mentees = await prisma.user.findMany({
      where: {
        id: { in: menteeIds },
        role: 'MENTEE',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    res.json({ mentees });
  } catch (error) {
    console.error('❌ [GET MY MENTEES] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
