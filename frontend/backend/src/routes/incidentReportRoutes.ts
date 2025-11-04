import { Router } from 'express';
import {
  submitIncidentReport,
  getUserIncidentReports,
  getAllIncidentReports,
  getIncidentReport,
  updateIncidentReport,
  deleteIncidentReport,
  getIncidentStats,
} from '../controllers/incidentReportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getAllIncidentReports); // Admin gets all, users get own
router.get('/my-reports', authenticate, getUserIncidentReports);
router.get('/stats', authenticate, authorize('ADMIN'), getIncidentStats);
router.get('/:id', authenticate, getIncidentReport);
router.post('/', authenticate, submitIncidentReport);
router.put('/:id', authenticate, authorize('ADMIN'), updateIncidentReport);
router.delete('/:id', authenticate, deleteIncidentReport);

export default router;
