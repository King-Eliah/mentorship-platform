import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllMentorGroups,
  getMyMentorGroups,
  createMentorGroup,
  createMentorGroupsRandomly,
  updateMentorGroup,
  deleteMentorGroup,
  getAvailableUsers,
} from '../controllers/mentorGroupController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all mentor groups (Admin only)
router.get('/', authorize('ADMIN'), getAllMentorGroups);

// Get my mentor groups (role-based)
router.get('/my', getMyMentorGroups);

// Get available users (Admins and Mentors)
router.get('/available-users', authorize('ADMIN', 'MENTOR'), getAvailableUsers);

// Create mentor group manually (Admin only)
router.post(
  '/',
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('mentorId').trim().notEmpty().withMessage('Mentor ID is required'),
    body('menteeIds').isArray().withMessage('Mentee IDs must be an array'),
  ],
  createMentorGroup
);

// Create mentor groups randomly (Admin only)
router.post(
  '/create-random',
  authorize('ADMIN'),
  [
    body('menteesPerMentor').isInt({ min: 1 }).withMessage('Mentees per mentor must be at least 1'),
    body('mentorIds').isArray({ min: 1 }).withMessage('At least one mentor is required'),
    body('menteeIds').isArray({ min: 1 }).withMessage('At least one mentee is required'),
  ],
  createMentorGroupsRandomly
);

// Update mentor group (Admin only)
router.put(
  '/:id',
  authorize('ADMIN'),
  [
    body('name').optional().trim().notEmpty().withMessage('Group name cannot be empty'),
    body('menteeIds').optional().isArray().withMessage('Mentee IDs must be an array'),
  ],
  updateMentorGroup
);

// Delete mentor group (Admin only)
router.delete('/:id', authorize('ADMIN'), deleteMentorGroup);

export default router;
