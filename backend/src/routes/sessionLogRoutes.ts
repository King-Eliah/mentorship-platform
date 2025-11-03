import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createSessionLog,
  getUserSessionLogs,
  getAllSessionLogs,
  getSessionLogStats,
  deleteOldSessionLogs,
} from '../controllers/sessionLogController';

const router = Router();

// User routes
router.get('/my-logs', authenticate, getUserSessionLogs);
router.post('/', authenticate, createSessionLog);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllSessionLogs);
router.get('/stats', authenticate, authorize('ADMIN'), getSessionLogStats);
router.delete('/cleanup', authenticate, authorize('ADMIN'), deleteOldSessionLogs);

export default router;
