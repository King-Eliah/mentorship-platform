# Messaging System Implementation Plan

## Overview

A fully functional messaging system where:

- **Mentors** get contacts: all their mentees + admin contact
- **Mentees** get contacts: their mentor + group mentees + ability to add anyone
- **Admins** can message anyone
- **Real-time messaging** with WebSocket support
- **Conversation management** with unread counts

## Database Schema Updates

### New Fields in User Model

```prisma
model User {
  // ... existing fields ...

  // Messaging
  blockedUsers      String[]     @default([])  // List of blocked user IDs
  lastSeenOnline    DateTime     @default(now())
  isOnline          Boolean      @default(false)

  // Relations
  conversations     Conversation[]
  directMessages    DirectMessage[]
}
```

### New Models

```prisma
// Represents a conversation between two users
model Conversation {
  id              String   @id @default(uuid())
  userId1         String   // Participant 1
  user1           User     @relation("ConversationUser1", fields: [userId1], references: [id], onDelete: Cascade)
  userId2         String   // Participant 2
  user2           User     @relation("ConversationUser2", fields: [userId2], references: [id], onDelete: Cascade)

  // Message history
  directMessages  DirectMessage[]

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId1, userId2])
  @@index([userId1])
  @@index([userId2])
}

// Direct messages between users
model DirectMessage {
  id              String   @id @default(uuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  senderId        String
  sender          User     @relation(fields: [senderId], references: [id], onDelete: Cascade)

  content         String
  type            MessageType  @default(TEXT)  // TEXT, IMAGE, FILE
  fileUrl         String?      // For file/image uploads

  isRead          Boolean  @default(false)
  readAt          DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}

enum MessageType {
  TEXT
  IMAGE
  FILE
}

// Contact list for each user
model Contact {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation("UserContacts", fields: [userId], references: [id], onDelete: Cascade)

  contactUserId   String
  contactUser     User     @relation("ContactOf", fields: [contactUserId], references: [id], onDelete: Cascade)

  // Contact metadata
  contactType     ContactType  // MENTOR, MENTEE, GROUP_MEMBER, ADMIN, CUSTOM
  addedAt         DateTime     @default(now())
  notes           String?      // Custom notes for the contact

  @@unique([userId, contactUserId])
  @@index([userId])
  @@index([contactType])
}

enum ContactType {
  MENTOR            // Auto-added from group assignment
  MENTEE            // Auto-added from group assignment
  GROUP_MEMBER      // Auto-added from group membership
  ADMIN             // Auto-added for all users
  CUSTOM            // Manually added by user
}
```

## Backend Implementation

### 1. Contact Management Controller

**File**: `backend/src/controllers/contactController.ts`

Functions:

- `getContacts()` - Get auto-populated contacts for user
- `addContact()` - Manually add a custom contact
- `removeContact()` - Remove a custom contact
- `blockUser()` - Block a user from messaging
- `unblockUser()` - Unblock a user
- `getBlockedUsers()` - Get list of blocked users

**Logic**:

```
For MENTOR:
  - All their mentees (from MentorGroup.menteeIds)
  - All admins (role = ADMIN)
  - Any custom contacts they added

For MENTEE:
  - Their assigned mentor (from group assignment)
  - All other mentees in their group (from GroupMember where groupId = their group)
  - All admins (role = ADMIN)
  - Any custom contacts they added

For ADMIN:
  - All other admins
  - Any custom contacts they added
  - Can search and message any user
```

### 2. Conversation Controller

**File**: `backend/src/controllers/conversationController.ts`

Functions:

- `getOrCreateConversation(userId1, userId2)` - Get existing or create new
- `getConversations()` - Get all conversations for current user
- `deleteConversation()` - Delete a conversation

**Features**:

- Verify users can message each other (contact exists or admin)
- Auto-create Conversation if it doesn't exist
- Return with last message and unread count

### 3. Direct Message Controller

**File**: `backend/src/controllers/directMessageController.ts`

Functions:

- `sendMessage(conversationId, content)` - Send a message
- `getMessages(conversationId)` - Get all messages in conversation
- `markAsRead(conversationId)` - Mark all messages as read
- `deleteMessage(messageId)` - Soft delete a message
- `editMessage(messageId, content)` - Edit a message

**Features**:

- Verify sender is in conversation
- WebSocket emit for real-time delivery
- Track read status and read timestamps
- Search within conversation

### 4. Routes

**File**: `backend/src/routes/contactRoutes.ts`

```typescript
GET    /api/contacts              - Get user's contacts
POST   /api/contacts              - Add custom contact
DELETE /api/contacts/:contactId   - Remove contact
POST   /api/contacts/block/:userId - Block user
DELETE /api/contacts/block/:userId - Unblock user
GET    /api/contacts/blocked      - Get blocked users
```

**File**: `backend/src/routes/conversationRoutes.ts`

```typescript
GET    /api/conversations           - Get all conversations
POST   /api/conversations           - Create/get conversation with user
GET    /api/conversations/:id       - Get conversation details
DELETE /api/conversations/:id       - Delete conversation
```

**File**: `backend/src/routes/directMessageRoutes.ts`

```typescript
GET    /api/messages/:conversationId     - Get messages
POST   /api/messages/:conversationId     - Send message
PUT    /api/messages/:messageId          - Edit message
DELETE /api/messages/:messageId          - Delete message
POST   /api/messages/:conversationId/read - Mark as read
```

### 5. WebSocket Events

**File**: `backend/src/websocket/messageHandlers.ts`

Events:

- `message:new` - New message sent
- `message:read` - Message read receipt
- `typing:start` - User typing indicator
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline
- `conversation:created` - New conversation created
- `contact:added` - New contact added

## Frontend Implementation

### 1. Contact List Component

**File**: `frontend/src/components/messaging/ContactList.tsx`

Features:

- Display auto-populated contacts (mentor, mentees, admin, group members)
- Search contacts
- Add custom contact by email/name
- Block/unblock contacts
- Show online status
- Badge for unread message count

### 2. Conversation List Component

**File**: `frontend/src/components/messaging/ConversationList.tsx`

Features:

- List all conversations sorted by last message date
- Search conversations
- Show unread count badge
- Show last message preview
- Delete conversation (soft delete)
- Online status indicator

### 3. Chat Window Component

**File**: `frontend/src/components/messaging/ChatWindow.tsx`

Features:

- Display all messages in conversation
- Auto-scroll to latest message
- Typing indicator
- Message timestamps
- Read receipts
- Send message form
- Edit message (swipe left or context menu)
- Delete message
- Emoji picker

### 4. Messages Page

**File**: `frontend/src/pages/MessagesPage.tsx`

Layout:

```
┌─────────────────────────────────────────────────────┐
│  Contacts (Sidebar)  │  Conversations  │  Chat Box  │
│  - List contacts     │  - Search/filter │  - Message │
│  - Add custom        │  - Sort by date  │  - Send   │
│  - Online status     │  - Unread badge  │  - Status │
│  - Block user        │  - Last message  │  - Info   │
└─────────────────────────────────────────────────────┘
```

### 5. Services

**File**: `frontend/src/services/messagingService.ts`

```typescript
// Contact management
getContacts()                    // Get all contacts
addContact(email: string)        // Add custom contact
removeContact(contactId: string) // Remove contact
blockUser(userId: string)        // Block user
unblockUser(userId: string)      // Unblock user

// Conversations
getConversations()               // Get all conversations
getOrCreateConversation(userId)  // Get/create conversation
deleteConversation(conversationId)

// Messages
getMessages(conversationId)      // Get all messages
sendMessage(conversationId, content)
markAsRead(conversationId)       // Mark all as read
editMessage(messageId, content)
deleteMessage(messageId)

// Real-time
subscribeToMessages(conversationId, callback)
subscribeToTyping(conversationId, callback)
emitTyping(conversationId, isTyping)
```

### 6. Hooks

**File**: `frontend/src/hooks/useMessaging.ts`

```typescript
useMessaging(conversationId?: string)
  - conversations: Conversation[]
  - currentConversation: Conversation | null
  - messages: Message[]
  - isTyping: boolean
  - selectedContact: Contact | null
  - sendMessage(content: string)
  - selectContact(contact: Contact)
  - loadConversation(conversationId)
```

## Data Flow

### Sending a Message

```
User types message
    ↓
User clicks Send / presses Enter
    ↓
Frontend: emitTyping(false)
    ↓
Frontend: sendMessage(conversationId, content)
    ↓
Backend: Verify sender is in conversation
    ↓
Backend: Create DirectMessage record
    ↓
Backend: Update Conversation.updatedAt
    ↓
Backend: WebSocket emit 'message:new' to recipient
    ↓
Frontend: Receive message via WebSocket
    ↓
Frontend: Add message to chat window
    ↓
Frontend: Auto-scroll to bottom
    ↓
Recipient sees message in real-time
```

### Contact Auto-Population

```
Group created with mentor + mentees
    ↓
Backend: groupController creates Contact records:
  - For mentor: add each mentee as MENTEE type
  - For each mentee: add mentor as MENTOR type
  - For each mentee: add other mentees as GROUP_MEMBER type
  - For all: add admin as ADMIN type
    ↓
Frontend: User opens Contacts page
    ↓
Backend: contactController.getContacts() returns all Contact records
    ↓
Frontend: Displays contacts organized by type
  - Section: Your Mentor (MENTOR)
  - Section: Group Members (GROUP_MEMBER)
  - Section: Admins (ADMIN)
  - Section: Custom (CUSTOM)
    ↓
User can click contact to start conversation
```

### Online Status

```
User logs in
    ↓
Frontend: WebSocket connects
    ↓
Backend: Set user.isOnline = true, lastSeenOnline = now
    ↓
Backend: Emit 'user:online' event with userId
    ↓
All open chats update to show user as online
    ↓
User closes app / disconnects WebSocket
    ↓
Backend: Set user.isOnline = false
    ↓
Backend: Emit 'user:offline' event
    ↓
All chats update to show user as offline
```

## Database Migrations

Create migration: `add_messaging_system`

```prisma
model Conversation {
  id              String        @id @default(uuid())
  userId1         String
  user1           User          @relation("ConversationUser1", fields: [userId1], references: [id], onDelete: Cascade)
  userId2         String
  user2           User          @relation("ConversationUser2", fields: [userId2], references: [id], onDelete: Cascade)
  directMessages  DirectMessage[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([userId1, userId2])
  @@index([userId1])
  @@index([userId2])
}

model DirectMessage {
  id              String        @id @default(uuid())
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId        String
  sender          User          @relation(fields: [senderId], references: [id], onDelete: Cascade)
  content         String
  type            MessageType   @default(TEXT)
  fileUrl         String?
  isRead          Boolean       @default(false)
  readAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}

enum MessageType {
  TEXT
  IMAGE
  FILE
}

model Contact {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation("UserContacts", fields: [userId], references: [id], onDelete: Cascade)
  contactUserId   String
  contactUser     User          @relation("ContactOf", fields: [contactUserId], references: [id], onDelete: Cascade)
  contactType     ContactType
  addedAt         DateTime      @default(now())
  notes           String?

  @@unique([userId, contactUserId])
  @@index([userId])
  @@index([contactType])
}

enum ContactType {
  MENTOR
  MENTEE
  GROUP_MEMBER
  ADMIN
  CUSTOM
}
```

## WebSocket Integration

Using Socket.IO (already in project):

```typescript
// backend/src/websocket/messageHandlers.ts

export function setupMessageHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.auth.userId;

    // Join personal room
    socket.join(`user-${userId}`);

    // Message events
    socket.on("message:send", async (data) => {
      // Create message, emit to recipient
      io.to(`user-${data.recipientId}`).emit("message:new", message);
    });

    socket.on("message:read", async (data) => {
      io.to(`user-${data.recipientId}`).emit("message:read", data);
    });

    socket.on("typing:start", (data) => {
      io.to(`user-${data.recipientId}`).emit("typing:start", { userId });
    });

    socket.on("typing:stop", (data) => {
      io.to(`user-${data.recipientId}`).emit("typing:stop", { userId });
    });

    socket.on("disconnect", async () => {
      // Set user offline
    });
  });
}
```

## Security & Permissions

### Authorization Rules

1. **Can send message to**:

   - Contact exists in their contact list OR
   - They are an admin OR
   - Recipient is an admin

2. **Can see conversation**:

   - They are a participant in the conversation OR
   - They are an admin

3. **Can edit/delete message**:
   - They are the sender OR
   - They are an admin

### Validation

- Message length: 1-5000 characters
- Rate limiting: Max 100 messages per minute per user
- Block list: Can't message blocked users
- Group isolation: Mentees can't message outside their group unless admin/mentor

## Testing Plan

### Manual Tests

1. ✅ Mentor can message mentees
2. ✅ Mentee can message mentor
3. ✅ Mentee can message other mentees in group
4. ✅ Admin can message anyone
5. ✅ Can't message non-contacts (unless admin)
6. ✅ Block/unblock users
7. ✅ Real-time message delivery
8. ✅ Read receipts work
9. ✅ Typing indicator works
10. ✅ Online status updates

### API Tests

- GET /api/contacts - Returns correct contacts for role
- POST /api/contacts - Adds custom contact
- GET /api/conversations - Returns all conversations
- POST /api/messages - Sends message to recipient
- PUT /api/messages/:id - Edits message
- POST /api/messages/:conversationId/read - Marks as read

## Implementation Sequence

### Phase 1: Database & Backend (Days 1-2)

- [ ] Add Conversation, DirectMessage, Contact models
- [ ] Create Prisma migration
- [ ] Implement contactController
- [ ] Implement conversationController
- [ ] Implement directMessageController
- [ ] Create routes for all three
- [ ] Add authorization middleware
- [ ] Test with Postman/cURL

### Phase 2: WebSocket & Real-time (Day 2-3)

- [ ] Wire up Socket.IO message handlers
- [ ] Implement typing indicator
- [ ] Implement online/offline status
- [ ] Implement read receipts
- [ ] Test real-time events

### Phase 3: Frontend UI (Days 3-5)

- [ ] Create ContactList component
- [ ] Create ConversationList component
- [ ] Create ChatWindow component
- [ ] Create MessagesPage
- [ ] Integrate messagingService
- [ ] Integrate useMessaging hook
- [ ] Add WebSocket listeners

### Phase 4: Testing & Polish (Days 5-6)

- [ ] End-to-end testing
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Loading states
- [ ] Documentation

## Performance Optimizations

1. **Message Pagination**: Load messages in batches (50 per request)
2. **Lazy Loading**: Conversations load contacts on demand
3. **Caching**: Cache contacts list with 5-min refresh
4. **Indexing**: Database indexes on userId, conversationId, createdAt
5. **Connection Pooling**: Use database connection pool

## Future Enhancements

1. **Group Messaging**: Messages to entire group/mentor-group
2. **File Sharing**: Upload files/images in messages
3. **Message Search**: Search across all messages
4. **Reactions**: Emoji reactions to messages
5. **Voice/Video**: Audio and video call integration
6. **Message Scheduling**: Send messages at specific time
7. **Forwarding**: Forward messages to other contacts
8. **Message Encryption**: End-to-end encryption
9. **Archive Conversations**: Hide old conversations
10. **Mute Conversations**: Silence notifications for specific conversations

## Code Files Created/Modified

**Backend**:

- `backend/src/controllers/contactController.ts` (NEW)
- `backend/src/controllers/conversationController.ts` (NEW)
- `backend/src/controllers/directMessageController.ts` (NEW)
- `backend/src/routes/contactRoutes.ts` (NEW)
- `backend/src/routes/conversationRoutes.ts` (NEW)
- `backend/src/routes/directMessageRoutes.ts` (NEW)
- `backend/src/websocket/messageHandlers.ts` (UPDATE)
- `backend/src/server.ts` (UPDATE - register routes)
- `backend/prisma/schema.prisma` (UPDATE - add models)

**Frontend**:

- `frontend/src/components/messaging/ContactList.tsx` (NEW)
- `frontend/src/components/messaging/ConversationList.tsx` (NEW)
- `frontend/src/components/messaging/ChatWindow.tsx` (NEW)
- `frontend/src/pages/MessagesPage.tsx` (UPDATE)
- `frontend/src/services/messagingService.ts` (NEW)
- `frontend/src/hooks/useMessaging.ts` (NEW)
- `frontend/src/App.tsx` (UPDATE - add route)

## Environment Variables

No new environment variables needed. Uses existing:

- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication
- `VITE_API_URL` - Frontend API base URL

## Dependencies

No new dependencies required. Uses:

- Existing: Express, Prisma, Socket.IO, React, React Router
- Already installed: All necessary libraries

---

**Status**: Planning phase complete. Ready for Phase 1 implementation.
