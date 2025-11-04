import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getConversationDetails,
  deleteConversation,
} from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for current user
router.get('/', getConversations);

// Get or create conversation with specific user
router.post('/', getOrCreateConversation);

// Get conversation details with messages
router.get('/:conversationId', getConversationDetails);

// Delete conversation
router.delete('/:conversationId', deleteConversation);

export default router;
