import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  markAsRead,
  editMessage,
  deleteMessage,
  deleteMessageForEveryone,
  searchMessages,
} from '../controllers/directMessageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Send message to conversation
router.post('/:conversationId', sendMessage);

// Get messages in conversation
router.get('/:conversationId/messages', getMessages);

// Get messages in conversation (alternate route for compatibility)
router.get('/:conversationId', getMessages);

// Mark messages as read
router.post('/:conversationId/read', markAsRead);

// Search messages in conversation
router.get('/:conversationId/search', searchMessages);

// Edit message
router.put('/:messageId', editMessage);

// Delete message
router.delete('/:messageId', deleteMessage);

// Delete message for everyone
router.delete('/:messageId/delete-everyone', deleteMessageForEveryone);

export default router;
