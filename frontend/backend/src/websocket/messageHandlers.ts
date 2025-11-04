import { Server, Socket } from 'socket.io';
import prisma from '../config/database';

/**
 * Message Handler Module
 * Handles real-time messaging events via WebSocket
 * Events:
 * - message:send - Send direct message
 * - message:read - Mark message as read
 * - message:edit - Edit sent message
 * - message:delete - Delete sent message
 * - typing:start - User typing indicator
 * - typing:stop - User stopped typing
 * - user:online - User came online
 * - user:offline - User went offline
 */

export const setupMessageHandlers = (io: Server, socket: Socket, userId: string) => {
  // ============================================
  // Message Events
  // ============================================

  /**
   * Send direct message
   * Data: { conversationId, content }
   */
  socket.on('message:send', async (data: { conversationId: string; content: string }) => {
    try {
      const { conversationId, content } = data;

      // Validate message
      if (!content || content.trim().length === 0 || content.length > 5000) {
        socket.emit('error', { message: 'Invalid message' });
        return;
      }

      // Verify user is part of conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId1: true, userId2: true },
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant =
        conversation.userId1 === userId || conversation.userId2 === userId;

      if (!isParticipant) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Get other participant
      const recipientId =
        conversation.userId1 === userId
          ? conversation.userId2
          : conversation.userId1;

      // Create message
      const message = await prisma.directMessage.create({
        data: {
          conversationId,
          senderId: userId,
          content: content.trim(),
          type: 'TEXT',
          readAt: null,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Emit to recipient and sender
      io.to(`user-${recipientId}`).emit('message:new', {
        id: message.id,
        conversationId: message.conversationId,
        sender: message.sender,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        readAt: message.readAt,
      });

      socket.emit('message:sent', {
        id: message.id,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Mark message as read
   * Data: { conversationId }
   */
  socket.on('message:read', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      // Verify user is part of conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId1: true, userId2: true },
      });

      if (!conversation) return;

      const isParticipant =
        conversation.userId1 === userId || conversation.userId2 === userId;

      if (!isParticipant) return;

      // Get other participant
      const senderId =
        conversation.userId1 === userId
          ? conversation.userId2
          : conversation.userId1;

      // Mark all unread messages as read
      await prisma.directMessage.updateMany({
        where: {
          conversationId,
          senderId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      // Get first unread message to confirm read
      const lastReadMessage = await prisma.directMessage.findFirst({
        where: {
          conversationId,
          senderId,
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      // Notify sender of read receipt
      io.to(`user-${senderId}`).emit('message:read', {
        conversationId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Message read error:', error);
    }
  });

  /**
   * Edit message
   * Data: { messageId, content }
   */
  socket.on('message:edit', async (data: { messageId: string; content: string }) => {
    try {
      const { messageId, content } = data;

      // Validate content
      if (!content || content.trim().length === 0 || content.length > 5000) {
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }

      // Get message and verify ownership
      const message = await prisma.directMessage.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            select: { userId1: true, userId2: true },
          },
        },
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      if (message.senderId !== userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Update message
      const updated = await prisma.directMessage.update({
        where: { id: messageId },
        data: { content: content.trim() },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get recipient
      const recipient =
        message.conversation.userId1 === userId
          ? message.conversation.userId2
          : message.conversation.userId1;

      // Emit to both participants
      io.to(`user-${recipient}`).emit('message:edited', {
        id: updated.id,
        conversationId: updated.conversationId,
        content: updated.content,
        isEdited: true,
        editedAt: updated.updatedAt,
      });

      socket.emit('message:edited', {
        id: updated.id,
        content: updated.content,
        isEdited: true,
        editedAt: updated.updatedAt,
      });
    } catch (error) {
      console.error('Message edit error:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  /**
   * Delete message
   * Data: { messageId }
   */
  socket.on('message:delete', async (data: { messageId: string }) => {
    try {
      const { messageId } = data;

      // Get message and verify ownership
      const message = await prisma.directMessage.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            select: { userId1: true, userId2: true },
          },
        },
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      if (message.senderId !== userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Soft delete
      await prisma.directMessage.update({
        where: { id: messageId },
        data: { content: '[Message deleted]' },
      });

      // Get recipient
      const recipient =
        message.conversation.userId1 === userId
          ? message.conversation.userId2
          : message.conversation.userId1;

      // Emit to both participants
      io.to(`user-${recipient}`).emit('message:deleted', {
        id: messageId,
        conversationId: message.conversationId,
      });

      socket.emit('message:deleted', {
        id: messageId,
      });
    } catch (error) {
      console.error('Message delete error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // ============================================
  // Typing Indicators
  // ============================================

  /**
   * User started typing
   * Data: { conversationId }
   */
  socket.on('typing:start', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId1: true, userId2: true },
      });

      if (!conversation) return;

      const isParticipant =
        conversation.userId1 === userId || conversation.userId2 === userId;

      if (!isParticipant) return;

      const recipient =
        conversation.userId1 === userId
          ? conversation.userId2
          : conversation.userId1;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      io.to(`user-${recipient}`).emit('typing:started', {
        conversationId,
        userId,
        userName: `${user?.firstName} ${user?.lastName}`,
      });
    } catch (error) {
      console.error('Typing start error:', error);
    }
  });

  /**
   * User stopped typing
   * Data: { conversationId }
   */
  socket.on('typing:stop', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId1: true, userId2: true },
      });

      if (!conversation) return;

      const recipient =
        conversation.userId1 === userId
          ? conversation.userId2
          : conversation.userId1;

      io.to(`user-${recipient}`).emit('typing:stopped', {
        conversationId,
        userId,
      });
    } catch (error) {
      console.error('Typing stop error:', error);
    }
  });

  // ============================================
  // Online Status
  // ============================================

  /**
   * Update user online status
   */
  socket.on('user:online', async () => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: true,
          lastSeenOnline: new Date(),
        },
      });

      // Notify contacts
      const contacts = await prisma.contact.findMany({
        where: { userId },
        select: { contactUserId: true },
      });

      contacts.forEach((contact) => {
        io.to(`user-${contact.contactUserId}`).emit('user:online', {
          userId,
        });
      });
    } catch (error) {
      console.error('User online error:', error);
    }
  });

  /**
   * User is about to disconnect
   */
  socket.on('user:offline', async () => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeenOnline: new Date(),
        },
      });

      // Notify contacts
      const contacts = await prisma.contact.findMany({
        where: { userId },
        select: { contactUserId: true },
      });

      contacts.forEach((contact) => {
        io.to(`user-${contact.contactUserId}`).emit('user:offline', {
          userId,
          lastSeen: new Date(),
        });
      });
    } catch (error) {
      console.error('User offline error:', error);
    }
  });

  /**
   * On disconnect
   */
  socket.on('disconnect', async () => {
    try {
      // Set user as offline
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeenOnline: new Date(),
        },
      });

      // Notify contacts
      const contacts = await prisma.contact.findMany({
        where: { userId },
        select: { contactUserId: true },
      });

      contacts.forEach((contact) => {
        io.to(`user-${contact.contactUserId}`).emit('user:offline', {
          userId,
          lastSeen: new Date(),
        });
      });

      console.log('User disconnected:', userId);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
};
