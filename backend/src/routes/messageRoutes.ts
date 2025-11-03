import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { messageValidation } from '../utils/validators';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/', authenticate, getMessages);
router.post('/', authenticate, messageValidation, sendMessage);

export default router;
