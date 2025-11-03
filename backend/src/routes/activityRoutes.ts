import { Router } from 'express';
import {
  createActivity,
  getUserActivities,
  getUserActivitiesById,
  getActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
} from '../controllers/activityController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getUserActivities);
router.get('/stats', authenticate, getActivityStats);
router.get('/user/:userId', authenticate, getUserActivitiesById);
router.get('/:id', authenticate, getActivity);
router.post('/', authenticate, createActivity);
router.put('/:id', authenticate, updateActivity);
router.delete('/:id', authenticate, deleteActivity);

export default router;
