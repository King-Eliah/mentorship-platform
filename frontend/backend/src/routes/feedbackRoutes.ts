import { Router } from 'express';
import {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
} from '../controllers/feedbackController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getAllFeedback); // Admin gets all, users get own
router.get('/my-feedback', authenticate, getUserFeedback);
router.get('/stats', authenticate, authorize('ADMIN'), getFeedbackStats);
router.get('/:id', authenticate, getFeedback);
router.post('/', authenticate, submitFeedback);
router.put('/:id', authenticate, authorize('ADMIN'), updateFeedback);
router.delete('/:id', authenticate, deleteFeedback);

export default router;
