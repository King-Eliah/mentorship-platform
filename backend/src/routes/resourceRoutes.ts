import { Router } from 'express';
import {
  createResource,
  getResources,
  getUserResources,
  getResource,
  updateResource,
  deleteResource,
  getResourceStats,
} from '../controllers/resourceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getResources);
router.get('/my-resources', authenticate, getUserResources);
router.get('/stats', authenticate, getResourceStats);
router.get('/:id', authenticate, getResource);
router.post('/', authenticate, createResource);
router.put('/:id', authenticate, updateResource);
router.delete('/:id', authenticate, deleteResource);

export default router;
