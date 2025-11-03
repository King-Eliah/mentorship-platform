import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Create event
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ [CREATE EVENT] Validation errors:', JSON.stringify(errors.array(), null, 2));
      console.error('📝 [CREATE EVENT] Request body:', JSON.stringify(req.body, null, 2));
      res.status(400).json({ errors: errors.array() });
      return;
    }

    console.log('✅ [CREATE EVENT] Validation passed, creating event...');
    console.log('📝 [CREATE EVENT] Data:', JSON.stringify(req.body, null, 2));

    // Fetch user details for activity
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, firstName: true, lastName: true, role: true }
    });

    const event = await prisma.event.create({
      data: {
        ...req.body,
        creatorId: req.user!.id,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity for event creation
    if (user) {
      await prisma.recentActivity.create({
        data: {
          userId: req.user!.id,
          type: 'EVENT_CREATED',
          title: `New Event: ${event.title}`,
          description: `${user.firstName} ${user.lastName} created a new event`,
          relatedEntityId: event.id,
          relatedEntityType: 'event',
          isPublic: true,
          metadata: {
            userName: `${user.firstName} ${user.lastName}`,
            userRole: user.role,
            eventType: event.type,
            eventDate: event.startTime.toISOString()
          }
        }
      });
    }

    console.log('🎉 [CREATE EVENT] Event created successfully:', event.id);
    res.status(201).json({ event });
  } catch (error) {
    console.error('❌ [CREATE EVENT] Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all events
export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[GET /events] Query params:', req.query);
    console.log('[GET /events] User:', req.user?.id, req.user?.role);
    
    const { type, status, page, limit } = req.query;

    // Parse and validate page number with better defaults
    const pageNum = page && page !== '' ? parseInt(page as string, 10) : 1;
    const limitNum = limit && limit !== '' ? parseInt(limit as string, 10) : 20;
    
    if (isNaN(pageNum) || pageNum < 1) {
      console.error('[GET /events] Invalid page number:', page, 'parsed as:', pageNum);
      res.status(400).json({ message: 'Invalid page number' });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      console.error('[GET /events] Invalid limit:', limit, 'parsed as:', limitNum);
      res.status(400).json({ message: 'Invalid limit (must be 1-100)' });
      return;
    }
    
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isPublic: true };
    
    if (type) where.type = type;
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          attendees: {
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
        orderBy: { startTime: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      events,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[GET /events] Error details:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get single event
export const getEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        attendees: {
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

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.creatorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updateData: any = { ...req.body };
    if (req.body.startTime) updateData.startTime = new Date(req.body.startTime);
    if (req.body.endTime) updateData.endTime = new Date(req.body.endTime);

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.json({ event: updated });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.creatorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await prisma.event.delete({ where: { id } });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register for event
export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: { attendees: true },
    });

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check if already registered
    const existing = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id,
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'Already registered for this event' });
      return;
    }

    // Check max attendees
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      res.status(400).json({ message: 'Event is full' });
      return;
    }

    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: id,
        userId: req.user!.id,
      },
      include: {
        event: true,
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

    // Create notification for event creator
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { firstName: true, lastName: true },
      });

      await prisma.notification.create({
        data: {
          userId: event.creatorId,
          type: 'EVENT',
          title: `${user?.firstName} ${user?.lastName} joined ${event.title}`,
          message: `Event reminder: Your event "${event.title}" is coming up`,
        },
      });
      console.log(`✓ Event notification created for event creator`);
    } catch (notifError) {
      console.error('Error creating event notification:', notifError);
    }

    res.status(201).json({ message: 'Registered successfully', attendee });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel event registration
export const cancelRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const attendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id,
        },
      },
    });

    if (!attendee) {
      res.status(404).json({ message: 'Registration not found' });
      return;
    }

    await prisma.eventAttendee.delete({
      where: { id: attendee.id },
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's joined events
export const getUserJoinedEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📋 [GET JOINED EVENTS] User:', req.user?.id);

    const attendances = await prisma.eventAttendee.findMany({
      where: {
        userId: req.user!.id,
        status: {
          in: ['REGISTERED', 'ATTENDED'],
        },
      },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            attendees: {
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
        },
      },
      orderBy: {
        event: {
          startTime: 'asc',
        },
      },
    });

    const events = attendances.map(a => a.event);
    
    console.log('✅ [GET JOINED EVENTS] Found', events.length, 'events');
    res.json({ events });
  } catch (error) {
    console.error('❌ [GET JOINED EVENTS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events for a specific user (for mentors viewing mentee's events)
export const getUserEventsById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log('📋 [GET USER EVENTS] Requested user:', userId, 'by:', req.user?.id);

    const attendances = await prisma.eventAttendee.findMany({
      where: {
        userId: userId,
        status: {
          in: ['REGISTERED', 'ATTENDED'],
        },
      },
      include: {
        event: {
          include: {
            creator: {
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
      orderBy: {
        event: {
          startTime: 'asc',
        },
      },
    });

    const events = attendances.map(a => a.event);
    
    console.log('✅ [GET USER EVENTS] Found', events.length, 'events for user', userId);
    res.json({ events });
  } catch (error) {
    console.error('❌ [GET USER EVENTS] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
