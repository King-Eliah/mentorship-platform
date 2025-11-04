import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import { setupMessageHandlers } from './messageHandlers';

export const setupWebSocket = (io: Server) => {
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    const userId = user.id;
    console.log('User connected:', user.email);

    // Join user's personal room
    socket.join(`user-${userId}`);

    // Join user's group rooms
    prisma.groupMember
      .findMany({
        where: { userId },
        select: { groupId: true },
      })
      .then((memberships: Array<{ groupId: string }>) => {
        memberships.forEach((m: { groupId: string }) => {
          socket.join(`group-${m.groupId}`);
        });
      });

    // Setup message handlers (Phase 2 - Real-time messaging)
    setupMessageHandlers(io, socket, userId);

    // Handle typing indicator (legacy - can remove after frontend migration)
    socket.on('typing', (data: { receiverId?: string; groupId?: string }) => {
      if (data.receiverId) {
        io.to(`user-${data.receiverId}`).emit('user-typing', {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
        });
      } else if (data.groupId) {
        socket.to(`group-${data.groupId}`).emit('user-typing', {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
        });
      }
    });

    // Handle stop typing (legacy - can remove after frontend migration)
    socket.on('stop-typing', (data: { receiverId?: string; groupId?: string }) => {
      if (data.receiverId) {
        io.to(`user-${data.receiverId}`).emit('user-stopped-typing', {
          userId: user.id,
        });
      } else if (data.groupId) {
        socket.to(`group-${data.groupId}`).emit('user-stopped-typing', {
          userId: user.id,
        });
      }
    });

    // Handle join group
    socket.on('join-group', (groupId: string) => {
      socket.join(`group-${groupId}`);
    });

    // Handle leave group
    socket.on('leave-group', (groupId: string) => {
      socket.leave(`group-${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', user.email);
    });
  });

  return io;
};

// Helper function to send notification via WebSocket
export const sendNotification = async (
  io: Server,
  userId: string,
  notification: any
) => {
  // Save to database
  const saved = await prisma.notification.create({
    data: {
      userId,
      ...notification,
    },
  });

  // Send via WebSocket
  io.to(`user-${userId}`).emit('notification', saved);

  return saved;
};
