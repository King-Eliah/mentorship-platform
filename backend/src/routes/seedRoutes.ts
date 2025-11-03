import express from 'express';
import { seedDatabaseController } from '../controllers/seedController';

const router = express.Router();

// Seed database endpoint - should only be called once during initial setup
router.post('/seed', seedDatabaseController);

export default router;
