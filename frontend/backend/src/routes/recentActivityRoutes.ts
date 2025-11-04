import { Router } from 'express';
import {
  getRecentActivities,
  createRecentActivity,
  deleteRecentActivity,
  getRecentActivityStats
} from '../controllers/recentActivityController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getRecentActivities);
router.get('/stats', authenticate, getRecentActivityStats);
router.post('/', authenticate, createRecentActivity);
router.delete('/:id', authenticate, deleteRecentActivity);

export default router;
