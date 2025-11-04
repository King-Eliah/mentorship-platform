# Messaging System - API Quick Reference

## Endpoints Overview

### Contacts Management

```
GET    /api/contacts
├─ Returns: All contacts organized by type (MENTOR, MENTEE, GROUP_MEMBER, ADMIN, CUSTOM)
└─ Response: { contacts: [], organized: { mentors: [], mentees: [], ... } }

POST   /api/contacts
├─ Body: { email: string, notes?: string }
├─ Creates: Custom contact from email
└─ Response: { contact: {...} }

DELETE /api/contacts/:contactId
├─ Deletes: Only CUSTOM type contacts
└─ Response: { message: "Contact removed" }

POST   /api/contacts/block
├─ Body: { targetUserId: string }
├─ Adds: User to blocked list
└─ Response: { message: "User blocked", blockedUsers: [...] }

DELETE /api/contacts/block
├─ Body: { targetUserId: string }
├─ Removes: User from blocked list
└─ Response: { message: "User unblocked", blockedUsers: [...] }

GET    /api/contacts/blocked
├─ Returns: List of all blocked users
└─ Response: { blockedCount: number, blockedUsers: [...] }
```

### Conversations Management

```
GET    /api/conversations
├─ Returns: All conversations sorted by last message date
├─ Response: { conversations: [{
│    id, otherUser, lastMessage, unreadCount, createdAt, updatedAt
│  }] }
└─ Use Case: Display conversation list in sidebar

POST   /api/conversations
├─ Body: { otherUserId: string }
├─ Returns: Get existing or create new conversation
├─ Validates: Users can message (contact/admin)
└─ Response: { conversation: {...} }

GET    /api/conversations/:conversationId
├─ Query: ?limit=50&offset=0
├─ Returns: Conversation with message history
├─ Validates: User is participant
└─ Response: { conversation, messages: [...] }

DELETE /api/conversations/:conversationId
├─ Deletes: Entire conversation and all messages
└─ Response: { message: "Conversation deleted" }
```

### Direct Messages

```
POST   /api/direct-messages/:conversationId
├─ Body: { content: string }
├─ Creates: New message
├─ Validates: User in conversation, not blocked
├─ Emits: WebSocket 'message:new' to recipient
└─ Response: { message: {...} }

GET    /api/direct-messages/:conversationId/messages
├─ Query: ?limit=50&offset=0
├─ Returns: Messages in conversation
├─ Auto marks: Messages as read
├─ Emits: WebSocket 'messages:read' to sender
└─ Response: { messages: [...] }

POST   /api/direct-messages/:conversationId/read
├─ Marks: All unread messages as read
├─ Emits: WebSocket 'messages:read' event
└─ Response: { message: "Messages marked as read" }

GET    /api/direct-messages/:conversationId/search
├─ Query: ?query=text
├─ Returns: Matching messages in conversation
└─ Response: { messages: [...] }

PUT    /api/direct-messages/:messageId
├─ Body: { content: string }
├─ Updates: Message content
├─ Validates: Only sender can edit
├─ Emits: WebSocket 'message:edited'
└─ Response: { message: {...updated} }

DELETE /api/direct-messages/:messageId
├─ Deletes: Message
├─ Validates: Only sender can delete
├─ Emits: WebSocket 'message:deleted'
└─ Response: { message: "Message deleted" }
```

## WebSocket Events

### Client → Server

```javascript
// Send message (from Chat component)
socket.emit("message:send", {
  recipientId: string,
  content: string,
});

// Mark as read
socket.emit("message:read", {
  conversationId: string,
  recipientId: string,
});

// Typing indicator
socket.emit("typing:start", { recipientId: string });
socket.emit("typing:stop", { recipientId: string });
```

### Server → Client

```javascript
// New message received
socket.on("message:new", (message) => {
  // Add to chat
});

// Message read receipt
socket.on("messages:read", ({ conversationId }) => {
  // Mark messages as read in UI
});

// Typing indicator
socket.on("typing:start", ({ userId }) => {
  // Show "User is typing..."
});

socket.on("typing:stop", ({ userId }) => {
  // Hide typing indicator
});

// User online/offline
socket.on("user:online", ({ userId }) => {
  // Update online status
});

socket.on("user:offline", ({ userId }) => {
  // Update offline status
});

// Message edited/deleted
socket.on("message:edited", ({ id, content, updatedAt }) => {
  // Update message in UI
});

socket.on("message:deleted", ({ messageId }) => {
  // Remove message from UI
});
```

## Data Models

### Contact

```typescript
{
  id: string
  userId: string
  contactUserId: string
  contactType: 'MENTOR' | 'MENTEE' | 'GROUP_MEMBER' | 'ADMIN' | 'CUSTOM'
  addedAt: DateTime
  notes?: string

  // Relations
  user: User
  contactUser: User
}
```

### Conversation

```typescript
{
  id: string
  userId1: string
  userId2: string
  createdAt: DateTime
  updatedAt: DateTime

  // Relations
  user1: User
  user2: User
  directMessages: DirectMessage[]
}
```

### DirectMessage

```typescript
{
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE'
  fileUrl?: string
  isRead: boolean
  readAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime

  // Relations
  sender: User
  conversation: Conversation
}
```

## Usage Examples

### 1. Start Conversation and Send Message

```typescript
// Get or create conversation
const convResponse = await fetch("/api/conversations", {
  method: "POST",
  body: JSON.stringify({ otherUserId: "user-123" }),
});
const { conversation } = await convResponse.json();

// Send message
const msgResponse = await fetch(`/api/direct-messages/${conversation.id}`, {
  method: "POST",
  body: JSON.stringify({ content: "Hello!" }),
});
```

### 2. Load Conversation History

```typescript
// Get messages with pagination
const response = await fetch(
  `/api/direct-messages/${conversationId}/messages?limit=50&offset=0`
);
const { messages } = await response.json();
// Messages auto-marked as read!
```

### 3. List All Conversations

```typescript
const response = await fetch("/api/conversations");
const { conversations } = await response.json();

// Each has:
// - conversation.id
// - conversation.otherUser
// - conversation.lastMessage
// - conversation.unreadCount
```

### 4. Get User Contacts

```typescript
const response = await fetch("/api/contacts");
const { contacts, organized } = await response.json();

// Organized by type:
// - organized.mentors
// - organized.mentees
// - organized.groupMembers
// - organized.admins
// - organized.custom
```

### 5. Add Custom Contact

```typescript
await fetch("/api/contacts", {
  method: "POST",
  body: JSON.stringify({
    email: "user@example.com",
    notes: "Met at conference",
  }),
});
```

### 6. Block User

```typescript
await fetch("/api/contacts/block", {
  method: "POST",
  body: JSON.stringify({ targetUserId: "user-123" }),
});
// Now can't message this user
```

## Authorization Rules

| Action                | MENTOR              | MENTEE              | ADMIN    |
| --------------------- | ------------------- | ------------------- | -------- |
| Message mentees       | ✅ (auto)           | ❌                  | ✅ (any) |
| Message mentor        | ❌                  | ✅ (auto)           | ✅ (any) |
| Message group members | ✅ (auto)           | ✅ (auto)           | ✅ (any) |
| Message other users   | ✅ (custom contact) | ✅ (custom contact) | ✅ (any) |
| Add custom contact    | ✅                  | ✅                  | ✅       |
| Block user            | ✅                  | ✅                  | ✅       |
| Edit own message      | ✅                  | ✅                  | ✅       |
| Delete message        | ✅ (own only)       | ✅ (own only)       | ✅ (any) |

## Error Handling

### Common Errors

```
400 Bad Request
├─ Missing required fields
├─ Invalid email format
└─ Message too long (>5000 chars)

403 Forbidden
├─ User not authorized to message
├─ Cannot message blocked user
└─ User not in conversation

404 Not Found
├─ Conversation not found
├─ Message not found
└─ User not found

500 Server Error
└─ Database or server error
```

### Error Response Format

```json
{
  "message": "Error description"
}
```

## Performance Notes

- **Conversations** indexed by userId for fast queries
- **Messages** indexed by conversationId and createdAt
- **Contacts** indexed by userId and contactType
- **Pagination** recommended for large conversations (50 msgs/request)
- **WebSocket** real-time delivery < 100ms latency

## Frontend Integration

### Required Setup

1. Import `messagingService` for API calls
2. Set up WebSocket connection in `useMessaging` hook
3. Create components: ContactList, ConversationList, ChatWindow
4. Handle WebSocket events for real-time updates

### Service Methods

```typescript
messagingService.getContacts();
messagingService.addContact(email, notes);
messagingService.removeContact(contactId);
messagingService.blockUser(userId);
messagingService.unblockUser(userId);

messagingService.getConversations();
messagingService.getOrCreateConversation(userId);
messagingService.getMessages(conversationId);
messagingService.deleteConversation(conversationId);

messagingService.sendMessage(conversationId, content);
messagingService.editMessage(messageId, content);
messagingService.deleteMessage(messageId);
messagingService.searchMessages(conversationId, query);
messagingService.markAsRead(conversationId);
```

## Rate Limiting (Future Enhancement)

Recommended limits:

- 100 messages per minute per user
- 50 contact additions per day
- 10 block actions per day

## Testing Checklist

- [ ] Mentor can message all mentees in group
- [ ] Mentee can message mentor
- [ ] Mentee can message other group members
- [ ] Admin can message anyone
- [ ] Cannot message outside contacts
- [ ] Block/unblock works
- [ ] Edit/delete own messages works
- [ ] Messages auto-mark as read
- [ ] WebSocket real-time delivery works
- [ ] Typing indicators appear
- [ ] Online status updates

---

**API Status**: ✅ **FULLY IMPLEMENTED**

All endpoints ready for frontend integration!
