import { Router } from 'express';
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  getGoalStats,
  getMenteeGoals,
  getAllMenteesGoals,
  getAllGoals,
} from '../controllers/goalController';
import { authenticate } from '../middleware/auth';
import { goalValidation } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getGoals);
router.get('/stats', authenticate, getGoalStats);
router.get('/admin/all', authenticate, getAllGoals);
router.get('/mentees', authenticate, getAllMenteesGoals);
router.get('/mentee/:menteeId', authenticate, getMenteeGoals);
router.post('/', authenticate, goalValidation, createGoal);
router.put('/:id', authenticate, updateGoal);
router.delete('/:id', authenticate, deleteGoal);

export default router;
