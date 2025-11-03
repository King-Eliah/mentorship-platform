import { Router } from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
} from '../controllers/groupController';
import { authenticate } from '../middleware/auth';
import { groupValidation } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getGroups);
router.get('/:id', authenticate, getGroup);
router.post('/', authenticate, groupValidation, createGroup);
router.post('/:id/join', authenticate, joinGroup);
router.post('/:id/leave', authenticate, leaveGroup);
router.delete('/:id', authenticate, deleteGroup);

export default router;
