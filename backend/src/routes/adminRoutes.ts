import { Router } from 'express';
import {
  getInvitationRequests,
  approveInvitation,
  rejectInvitation,
  generateInvitationCode,
  getAllUsers,
  updateUserStatus,
  createUserManually,
  getAnalytics,
  deleteUser,
  deleteInvitationCode,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Invitation management
router.post('/generate-invitation-code', generateInvitationCode);
router.get('/invitations', getInvitationRequests);
router.put('/invitations/:id/approve', approveInvitation);
router.put('/invitations/:id/reject', rejectInvitation);
router.delete('/invitations/:id', deleteInvitationCode);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUserManually);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
