import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { setupWebSocket } from './websocket';

// Import routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import goalRoutes from './routes/goalRoutes';
import groupRoutes from './routes/groupRoutes';
import mentorGroupRoutes from './routes/mentorGroupRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import activityRoutes from './routes/activityRoutes';
import recentActivityRoutes from './routes/recentActivityRoutes';
import resourceRoutes from './routes/resourceRoutes';
import sharedResourceRoutes from './routes/sharedResources';
import feedbackRoutes from './routes/feedbackRoutes';
import incidentReportRoutes from './routes/incidentReportRoutes';
import sessionLogRoutes from './routes/sessionLogRoutes';
import searchRoutes from './routes/searchRoutes';
import contactRoutes from './routes/contactRoutes';
import conversationRoutes from './routes/conversationRoutes';
import directMessageRoutes from './routes/directMessageRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// CORS configuration - allow multiple origins for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Setup WebSocket
setupWebSocket(io);

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// Increase payload size limit to handle large file uploads (base64 encoded)
// 150MB limit accounts for base64 encoding overhead (~33% larger than original)
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));
app.use(cookieParser());

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/recent-activities', recentActivityRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/shared-resources', sharedResourceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/incidents', incidentReportRoutes);
app.use('/api/session-logs', sessionLogRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/mentor-groups', mentorGroupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/direct-messages', directMessageRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server ready`);
});

export { io };
