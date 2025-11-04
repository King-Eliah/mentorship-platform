import { Router } from 'express';
import {
  getContacts,
  addContact,
  removeContact,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBrowsableUsers,
  sendContactRequest,
  getPendingRequests,
  getSentRequests,
  acceptContactRequest,
  rejectContactRequest,
  searchUserById,
} from '../controllers/contactController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all browsable users (needs to be before GET /:id)
router.get('/browse', getBrowsableUsers);

// Search user by ID
router.get('/search/:userId', searchUserById);

// Get all contacts for current user
router.get('/', getContacts);

// Add custom contact
router.post('/', addContact);

// Remove custom contact
router.delete('/:contactId', removeContact);

// Block user from messaging
router.post('/block', blockUser);

// Unblock user
router.delete('/block', unblockUser);

// Get list of blocked users
router.get('/blocked', getBlockedUsers);

// ====== Contact Request Routes ======

// Send contact request
router.post('/request/send', sendContactRequest);

// Get pending requests received by current user
router.get('/request/pending', getPendingRequests);

// Get sent requests
router.get('/request/sent', getSentRequests);

// Accept contact request
router.patch('/request/:requestId/accept', acceptContactRequest);

// Reject contact request
router.patch('/request/:requestId/reject', rejectContactRequest);

export default router;
