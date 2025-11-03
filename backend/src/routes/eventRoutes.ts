import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getUserJoinedEvents,
  getUserEventsById,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import { eventValidation } from '../utils/validators';

const router = Router();

// All authenticated users can view events
router.get('/', authenticate, getEvents);
router.get('/joined', authenticate, getUserJoinedEvents);
router.get('/user/:userId', authenticate, getUserEventsById);
router.get('/:id', authenticate, getEvent);

// Only ADMIN and MENTOR can create events
router.post('/', authenticate, authorize('ADMIN', 'MENTOR'), eventValidation, createEvent);

// Only creator or ADMIN can update/delete events (checked in controller)
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

// All authenticated users can join/leave events
router.post('/:id/register', authenticate, registerForEvent);
router.delete('/:id/register', authenticate, cancelRegistration);

export default router;
