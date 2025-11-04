import express from 'express';
import * as sharedResourceController from '../controllers/sharedResourceController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
// Share resources with mentees
router.post('/share', authenticate, sharedResourceController.shareResources);

// Get resources shared with me (mentee view)
router.get('/shared-with-me', authenticate, sharedResourceController.getSharedWithMe);

// Get resources I've shared (mentor view)
router.get('/shared-by-me', authenticate, sharedResourceController.getSharedByMe);

// Mark shared resource as viewed
router.patch('/:id/viewed', authenticate, sharedResourceController.markAsViewed);

// Get mentor's mentees
router.get('/my-mentees', authenticate, sharedResourceController.getMyMentees);

export default router;
