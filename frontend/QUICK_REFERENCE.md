# Quick Reference: Messaging System Commands & APIs

---

## 🚀 Quick Start

### Install & Setup (5 minutes)

```bash
# Frontend
cd frontend
npm install socket.io-client axios react-icons

# Backend (if needed)
cd backend
npm install

# Start services
npm run dev  # Backend
npm run dev  # Frontend (separate terminal)
```

### Add to App

```tsx
// In App.tsx
import { MessagesPage } from "@/components/messaging";

<Route path="/messages" element={<MessagesPage />} />;
```

### Add Navigation

```tsx
<Link to="/messages">💬 Messages</Link>
```

---

## 📡 WebSocket Events (Real-time)

### Send Message

```javascript
socket.emit("message:send", {
  conversationId: "conv-123",
  content: "Hello!",
});

// Listen for confirmation
socket.on("message:sent", (data) => {
  console.log("Message sent:", data.id);
});

// Listen for new message from other user
socket.on("message:new", (data) => {
  console.log("New message:", data.content);
});
```

### Edit Message

```javascript
socket.emit("message:edit", {
  messageId: "msg-123",
  content: "Updated text",
});

socket.on("message:edited", (data) => {
  console.log("Message edited:", data.id);
});
```

### Delete Message

```javascript
socket.emit("message:delete", {
  messageId: "msg-123",
});

socket.on("message:deleted", (data) => {
  console.log("Message deleted:", data.id);
});
```

### Mark as Read

```javascript
socket.emit("message:read", {
  conversationId: "conv-123",
});

socket.on("message:read", (data) => {
  console.log("Read receipt sent");
});
```

### Typing Indicator

```javascript
// User started typing
socket.emit("typing:start", {
  conversationId: "conv-123",
});

socket.on("typing:started", (data) => {
  console.log(`${data.userName} is typing...`);
});

// User stopped typing
socket.emit("typing:stop", {
  conversationId: "conv-123",
});

socket.on("typing:stopped", (data) => {
  console.log("User stopped typing");
});
```

### Online Status

```javascript
socket.emit("user:online");
socket.emit("user:offline");

socket.on("user:online", (data) => {
  console.log("User came online:", data.userId);
});

socket.on("user:offline", (data) => {
  console.log("User went offline:", data.userId);
});
```

---

## 🔌 REST API Endpoints

### Contacts

```bash
# Get all contacts
GET /api/contacts
Response: { contacts: [...] }

# Add custom contact
POST /api/contacts
Body: { email: "user@example.com" }
Response: { id, contactType: "CUSTOM", ... }

# Remove contact
DELETE /api/contacts/:contactId
Response: { success: true }

# Block user
POST /api/contacts/block
Body: { userId: "user-123" }
Response: { blocked: true }

# Unblock user
DELETE /api/contacts/block
Body: { userId: "user-123" }
Response: { unblocked: true }

# Get blocked users
GET /api/contacts/blocked
Response: { blockedUsers: [...] }
```

### Conversations

```bash
# Get all conversations
GET /api/conversations
Response: { conversations: [...] }

# Create or get conversation
POST /api/conversations
Body: { otherUserId: "user-123" }
Response: { conversation: {...} }

# Get conversation with messages
GET /api/conversations/:conversationId?limit=50&offset=0
Response: { conversation: {...}, messages: [...] }

# Delete conversation
DELETE /api/conversations/:conversationId
Response: { success: true }
```

### Messages

```bash
# Get messages
GET /api/direct-messages/:conversationId/messages?limit=50&offset=0
Response: { messages: [...] }

# Send message
POST /api/direct-messages/:conversationId
Body: { content: "Hello!" }
Response: { id, content, createdAt, ... }

# Edit message
PUT /api/direct-messages/:messageId
Body: { content: "Updated text" }
Response: { id, content, isEdited: true, ... }

# Delete message
DELETE /api/direct-messages/:messageId
Response: { success: true }

# Search messages
GET /api/direct-messages/:conversationId/search?query=hello
Response: { messages: [...] }
```

---

## ⚛️ React Hook Usage

```typescript
import { useMessaging } from "@/hooks/useMessaging";

function MyComponent() {
  const {
    // State
    contacts,
    conversations,
    currentConversation,
    messages,
    typingUsers,
    isLoading,
    error,
    isConnected,
    canSendMessage,

    // Methods
    getContacts,
    addContact,
    blockUser,
    getConversations,
    selectConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
  } = useMessaging();

  // Get contacts on mount
  useEffect(() => {
    getContacts();
  }, [getContacts]);

  // Send message handler
  const handleSend = (text: string) => {
    if (currentConversation && canSendMessage) {
      sendMessage(text);
    }
  };

  // Render...
}
```

---

## 🎨 Component Props

### MessagesPage

```tsx
<MessagesPage />
// No props, uses useMessaging hook internally
```

### ChatWindow

```tsx
<ChatWindow />
// State from useMessaging hook
// Methods: sendMessage, editMessage, deleteMessage
```

### ConversationList

```tsx
<ConversationList
  onSelectConversation={(conversationId) => {
    // Handle selection
  }}
/>
```

### ContactList

```tsx
<ContactList
  onSelectContact={(userId) => {
    // Handle selection
  }}
/>
```

---

## 🔒 Authorization Rules

### Who Can Message?

```
ADMIN:   Can message anyone
MENTOR:  Can message mentees + other contacts + admins
MENTEE:  Can message mentor + group members + custom contacts + admins
```

### Who Gets Auto-Populated?

```
Mentor:
  ├─ All mentees in their groups (MENTEE type)
  └─ All admins (ADMIN type)

Mentee:
  ├─ Their mentor (MENTOR type)
  ├─ Other mentees in their group (GROUP_MEMBER type)
  └─ All admins (ADMIN type)

Admin:
  └─ Anyone (auto-added, ADMIN type)
```

### Blocking

```
Block User X:
  ├─ X cannot message you
  ├─ You can still message X (optional)
  └─ X cannot see read receipts
```

---

## 🐛 Common Issues & Fixes

### WebSocket Not Connecting

```
Check:
1. Token in localStorage: localStorage.getItem('token')
2. Backend running: curl http://localhost:5000
3. Environment variable: VITE_SOCKET_URL
4. Browser console for errors

Fix:
messagingService.connectWebSocket(token);
```

### Messages Not Sending

```
Check:
1. WebSocket connected: messagingService.isConnected()
2. Conversation selected: currentConversation !== null
3. User not blocked: !blockedUsers.includes(recipientId)
4. Message not empty: content.trim().length > 0

Fix:
const { canSendMessage } = useMessaging();
if (canSendMessage) {
  sendMessage(content);
}
```

### Real-time Updates Not Showing

```
Check:
1. Component subscribed to useMessaging hook
2. WebSocket connected
3. Event listener registered
4. Re-render triggered

Fix:
// Make sure hook is called
const { messages } = useMessaging();
// Messages will auto-update when new ones arrive
```

---

## 📊 Data Structures

### Contact

```typescript
interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  contactType: "MENTOR" | "MENTEE" | "GROUP_MEMBER" | "ADMIN" | "CUSTOM";
  addedAt: string;
  notes?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}
```

### Conversation

```typescript
interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  lastMessageAt?: string;
  participant1?: User;
  participant2?: User;
}
```

### DirectMessage

```typescript
interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  isEdited: boolean;
  isDeleted: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}
```

---

## 📚 File Locations

### Backend

- Controllers: `/backend/src/controllers/`
- Routes: `/backend/src/routes/`
- WebSocket: `/backend/src/websocket/`
- Schema: `/backend/prisma/schema.prisma`

### Frontend

- Services: `/frontend/src/services/messagingService.ts`
- Hooks: `/frontend/src/hooks/useMessaging.ts`
- Components: `/frontend/src/components/messaging/`

### Documentation

- Complete Summary: `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- Integration Guide: `INTEGRATION_GUIDE_PHASE_2_3.md`
- Phase Details: `PHASE_2_3_COMPLETE.md`
- API Reference: `MESSAGING_API_REFERENCE.md`

---

## ⚡ Performance Tips

### Optimize Message Loading

```typescript
// Use pagination
const messages = await messagingService.getMessages(
  conversationId,
  50, // limit
  0 // offset
);

// Implement infinite scroll
const handleLoadMore = () => {
  setOffset(offset + 50);
  // Load more messages...
};
```

### Debounce Typing Indicator

```typescript
import { debounce } from "lodash-es";

const debouncedTyping = debounce((convId) => {
  messagingService.typingStart(convId);
}, 300);

// In onChange
const handleInputChange = (value) => {
  setInputValue(value);
  debouncedTyping(currentConversation.id);
};
```

### Cache Contacts

```typescript
const contactCache = new Map();

const getContactsOptimized = async () => {
  if (contactCache.size > 0) {
    return Array.from(contactCache.values());
  }
  const contacts = await getContacts();
  contacts.forEach((c) => contactCache.set(c.id, c));
  return contacts;
};
```

---

## 🧪 Test Examples

### Manual Test

```
1. Open http://localhost:5173/messages
2. Click a contact
3. Type message
4. Click Send
5. Should appear in ChatWindow instantly
6. Open in another browser tab
7. Message should appear there too
8. Type in second browser
9. Should see typing indicator in first
10. Send from second browser
11. Should receive in first instantly
```

### Automated Test

```javascript
// WebSocket message flow
const token = "test-token";
messagingService.connectWebSocket(token);

messagingService.on("message:new", (data) => {
  assert(data.id !== undefined);
  assert(data.content !== undefined);
  console.log("✅ Message received");
});

messagingService.sendMessage("conv-123", "Test message");
```

---

## 🚀 Deployment Commands

### Build

```bash
cd backend && npm run build
cd frontend && npm run build
```

### Migrate Database

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Start Production

```bash
cd backend && npm start
cd frontend && npm run preview
```

---

## 📞 Quick Links

| Resource        | Link                                 |
| --------------- | ------------------------------------ |
| Full Summary    | `COMPLETE_IMPLEMENTATION_SUMMARY.md` |
| Integration     | `INTEGRATION_GUIDE_PHASE_2_3.md`     |
| Phase Details   | `PHASE_2_3_COMPLETE.md`              |
| API Docs        | `MESSAGING_API_REFERENCE.md`         |
| Troubleshooting | See section above                    |

---

**Everything you need to get started with messaging! 🚀**
