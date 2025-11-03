import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  searchUsers,
  getMentees,
  getMentor,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', authenticate, searchUsers);
router.get('/mentees', authenticate, getMentees);
router.get('/mentor', authenticate, getMentor);
router.get('/:id', authenticate, getProfile);
router.put('/:id', authenticate, updateProfile);
router.put('/:id/password', authenticate, changePassword);

export default router;
