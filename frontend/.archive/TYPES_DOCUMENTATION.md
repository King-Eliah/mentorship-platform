# 📝 Messaging Types - Complete Documentation

## Overview

Complete TypeScript type definitions for the messaging system, covering both frontend and backend.

**Location:**

- Frontend: `frontend/src/types/messaging.ts`
- Backend: `backend/src/types/messaging.ts`

**Total Types Defined:** 50+ interfaces and enums

---

## Frontend Types (`frontend/src/types/messaging.ts`)

### 1. Enums

#### ContactType

```typescript
enum ContactType {
  MENTOR = "MENTOR", // User is a mentor
  MENTEE = "MENTEE", // User is a mentee
  GROUP_MEMBER = "GROUP_MEMBER", // User is from same group
  ADMIN = "ADMIN", // User is an admin
  CUSTOM = "CUSTOM", // Manually added contact
}
```

#### MessageStatus

```typescript
enum MessageStatus {
  SENDING = "SENDING", // Message being sent
  SENT = "SENT", // Message sent to server
  DELIVERED = "DELIVERED", // Message delivered to recipient
  READ = "READ", // Message read by recipient
  FAILED = "FAILED", // Message failed to send
}
```

#### WebSocketEvent

```typescript
enum WebSocketEvent {
  // Message events
  MESSAGE_SEND = "message:send",
  MESSAGE_READ = "message:read",
  MESSAGE_EDIT = "message:edit",
  MESSAGE_DELETE = "message:delete",

  // Typing events
  TYPING_START = "typing:start",
  TYPING_STOP = "typing:stop",

  // Status events
  USER_ONLINE = "user:online",
  USER_OFFLINE = "user:offline",
  USER_DISCONNECT = "user:disconnect",

  // Connection events
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  CONNECT_ERROR = "connect_error",
}
```

### 2. Core Data Models

#### Contact

```typescript
interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  contactUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
  };
  contactType: ContactType;
  addedAt: string;
  notes?: string;
}
```

- Represents a user in the contact list
- Stores relationship with contact user
- Includes type classification

#### Conversation

```typescript
interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1?: User;
  participant2?: User;
  lastMessage?: DirectMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

- Represents a 1-on-1 conversation thread
- Stores both participant IDs
- Tracks last message and unread count

#### DirectMessage

```typescript
interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  messageType: string; // TEXT, IMAGE, FILE
  isEdited: boolean;
  isDeleted: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

- Represents a single message
- Tracks read status and edit history
- Stores original creation and update times

### 3. UI Models

#### ConversationGroup

```typescript
interface ConversationGroup {
  conversation: Conversation;
  otherParticipant: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl?: string;
    isOnline: boolean;
    lastSeenOnline?: string;
  };
  lastMessage?: DirectMessage;
  unreadCount: number;
  lastMessageTime: string;
}
```

- Processed conversation for UI display
- Includes computed `otherParticipant` info
- Pre-calculated UI values (lastMessageTime, etc.)

#### GroupedContacts

```typescript
interface GroupedContacts {
  mentor: Contact[];
  mentee: Contact[];
  groupMember: Contact[];
  admin: Contact[];
  custom: Contact[];
}
```

- Contacts organized by type
- Used for rendering organized contact list
- Enables quick filtering and display

#### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isOwn: boolean; // whether sent by current user
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
  readAt?: string;
  editedAt?: string;
}
```

- Message processed for UI display
- Includes `isOwn` flag for styling
- Contains `MessageStatus` enum value

#### UIContact

```typescript
interface UIContact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: ContactType;
  isOnline: boolean;
  status?: string;
}
```

- Simplified contact for UI rendering
- Pre-computed `name` and `isOnline`
- Ready for direct display

### 4. Request Types

#### CreateContactRequest

```typescript
interface CreateContactRequest {
  email: string;
  contactType?: ContactType;
  notes?: string;
}
```

- POST `/api/contacts`
- User provides email, type auto-detected if not provided

#### AddCustomContactRequest

```typescript
interface AddCustomContactRequest {
  email: string;
  notes?: string;
}
```

- Add custom contact by email
- Always sets `contactType` to CUSTOM

#### SendMessageRequest

```typescript
interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: string; // defaults to TEXT
}
```

- Send a new message
- Content must be non-empty, max 5000 chars

#### EditMessageRequest

```typescript
interface EditMessageRequest {
  messageId: string;
  content: string;
}
```

- Edit an existing message
- Only sender can edit
- Max 5 minute edit window

#### DeleteMessageRequest

```typescript
interface DeleteMessageRequest {
  messageId: string;
}
```

- Soft delete a message
- Only sender can delete
- Message content replaced with "[deleted]"

#### SearchMessagesRequest

```typescript
interface SearchMessagesRequest {
  query: string;
  conversationId?: string;
  limit?: number;
  offset?: number;
}
```

- Search messages by content
- Optional: limit to specific conversation
- Supports pagination

#### BlockUserRequest

```typescript
interface BlockUserRequest {
  userId: string;
}
```

- Block a user from messaging
- Blocks cannot message you

#### RemoveContactRequest

```typescript
interface RemoveContactRequest {
  contactId: string;
}
```

- Remove contact from list
- Doesn't delete messages, just removes relationship

### 5. Response Types

#### ApiResponse<T>

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}
```

- Generic API response wrapper
- Contains success flag, data, and optional errors

#### PaginatedResponse<T>

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

- Pagination metadata
- Used for message lists, conversations, etc.

#### GetContactsResponse

```typescript
interface GetContactsResponse {
  contacts: Contact[];
  groupedByType: GroupedContacts;
}
```

- Returns all contacts
- Pre-grouped by type for UI rendering

#### GetConversationsResponse

```typescript
interface GetConversationsResponse {
  conversations: ConversationGroup[];
  unreadCount: number;
}
```

- Returns all conversations
- Total unread count across all

#### GetMessagesResponse

```typescript
interface GetMessagesResponse {
  messages: DirectMessage[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

- Returns paginated messages
- Includes pagination metadata

### 6. WebSocket Event Payloads

#### MessageSendPayload

```typescript
interface MessageSendPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
}
```

- Emitted when message sent
- Received by: recipient only

#### MessageReadPayload

```typescript
interface MessageReadPayload {
  messageId: string;
  conversationId: string;
  readBy: string;
  readAt: string;
}
```

- Emitted when message read
- Received by: original sender

#### MessageEditPayload

```typescript
interface MessageEditPayload {
  messageId: string;
  conversationId: string;
  content: string;
  updatedAt: string;
}
```

- Emitted when message edited
- Received by: other participant

#### MessageDeletePayload

```typescript
interface MessageDeletePayload {
  messageId: string;
  conversationId: string;
  deletedAt: string;
}
```

- Emitted when message deleted
- Received by: other participant

#### TypingStartPayload / TypingStopPayload

```typescript
interface TypingStartPayload {
  conversationId: string;
  userId: string;
  userName: string;
}

interface TypingStopPayload {
  conversationId: string;
  userId: string;
}
```

- Typing indicator events
- Received by: other participant in conversation

#### UserOnlinePayload / UserOfflinePayload

```typescript
interface UserOnlinePayload {
  userId: string;
  userName: string;
  onlineAt: string;
}

interface UserOfflinePayload {
  userId: string;
  offlineAt: string;
}
```

- Status change events
- Received by: all users in contacts/conversations

### 7. State Management

#### MessagingState

```typescript
interface MessagingState {
  // Data
  contacts: Contact[];
  groupedContacts: GroupedContacts;
  conversations: ConversationGroup[];
  currentConversation: Conversation | null;
  currentConversationId: string | null;
  messages: DirectMessage[];
  typingUsers: TypingIndicator[];
  blockedUsers: string[];
  onlineUsers: Record<string, UserStatus>;

  // UI state
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingConversations: boolean;
  error: string | null;

  // Connection state
  isConnected: boolean;
  canSendMessage: boolean;

  // Pagination
  currentPage: number;
  totalMessages: number;
  hasMoreMessages: boolean;
}
```

- Complete React hook state
- Used by `useMessaging` hook
- Tracks all messaging data and UI state

### 8. Filter Types

#### MessageFilter

```typescript
interface MessageFilter {
  conversationId?: string;
  senderId?: string;
  startDate?: string;
  endDate?: string;
  isRead?: boolean;
  isDeleted?: boolean;
}
```

#### ConversationFilter

```typescript
interface ConversationFilter {
  participantId?: string;
  unreadOnly?: boolean;
  sortBy?: "recent" | "oldest" | "alphabetical";
}
```

#### ContactFilter

```typescript
interface ContactFilter {
  type?: ContactType;
  searchQuery?: string;
  sortBy?: "name" | "dateAdded" | "type";
}
```

---

## Backend Types (`backend/src/types/messaging.ts`)

### 1. WebSocket Types

#### AuthenticatedSocket

```typescript
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}
```

- Extended Socket.IO socket with user info
- Available after JWT authentication

#### WebSocketEventHandler

```typescript
type WebSocketEventHandler = (
  socket: AuthenticatedSocket,
  io: any,
  data?: any
) => Promise<void>;
```

- Event handler function signature
- Used for all 9 message handlers

### 2. Payload Types (From Client)

#### ClientMessagePayload

```typescript
interface ClientMessagePayload {
  conversationId: string;
  content: string;
  messageType?: string;
}
```

#### ClientReadPayload

```typescript
interface ClientReadPayload {
  conversationId: string;
  messageId: string;
}
```

#### ClientEditPayload

```typescript
interface ClientEditPayload {
  messageId: string;
  conversationId: string;
  content: string;
}
```

#### ClientDeletePayload

```typescript
interface ClientDeletePayload {
  messageId: string;
  conversationId: string;
}
```

#### ClientTypingPayload

```typescript
interface ClientTypingPayload {
  conversationId: string;
  isTyping: boolean;
}
```

### 3. Service Response Types

#### ContactServiceResponse

```typescript
interface ContactServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}
```

#### ConversationServiceResponse

```typescript
interface ConversationServiceResponse {
  success: boolean;
  conversation?: ConversationWithParticipants;
  error?: string;
}
```

#### MessageServiceResponse

```typescript
interface MessageServiceResponse {
  success: boolean;
  message?: DirectMessageWithSender;
  messages?: DirectMessageWithSender[];
  error?: string;
}
```

### 4. Custom Entity Types

#### ContactWithUser

```typescript
interface ContactWithUser {
  id: string;
  userId: string;
  contactUserId: string;
  contactType: string;
  addedAt: Date;
  notes?: string;
  contactUser?: User;
  user?: User;
}
```

- Contact with related User objects

#### ConversationWithParticipants

```typescript
interface ConversationWithParticipants {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: Date;
  updatedAt: Date;
  participant1?: User;
  participant2?: User;
  messages?: DirectMessageWithSender[];
}
```

- Conversation with participant and message details

#### DirectMessageWithSender

```typescript
interface DirectMessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  isEdited: boolean;
  isDeleted: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
}
```

- Message with sender details

### 5. Authorization Types

#### AuthorizationResult

```typescript
interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
}
```

#### ContactAuthContext

```typescript
interface ContactAuthContext {
  userId: string;
  targetUserId: string;
  role?: string;
}
```

#### MessageAuthContext

```typescript
interface MessageAuthContext {
  userId: string;
  conversationId: string;
  role?: string;
}
```

### 6. Notification Types

#### MessageNotification

```typescript
interface MessageNotification {
  type: "message:new" | "message:edit" | "message:delete" | "message:read";
  conversationId: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  content?: string;
  timestamp: string;
}
```

#### StatusNotification

```typescript
interface StatusNotification {
  type: "user:online" | "user:offline";
  userId: string;
  userName: string;
  timestamp: string;
}
```

#### TypingNotification

```typescript
interface TypingNotification {
  type: "typing:start" | "typing:stop";
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: string;
}
```

### 7. Error Classes

```typescript
class AppError extends Error {
  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, unknown>
  );
}

class ValidationError extends AppError {}
class AuthorizationError extends AppError {}
class NotFoundError extends AppError {}
class ConflictError extends AppError {}
```

- Custom error classes extending Error
- Include status code and optional details
- Used throughout services and controllers

### 8. Utility Types

#### PaginationOptions

```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}
```

#### PaginatedResult<T>

```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

#### UserConnectionInfo

```typescript
interface UserConnectionInfo {
  userId: string;
  socketId: string;
  userEmail: string;
  connectedAt: number;
  isOnline: boolean;
}
```

---

## Usage Examples

### Frontend

```typescript
// Import all types
import {
  Contact,
  Conversation,
  DirectMessage,
  ContactType,
  MessageStatus,
  WebSocketEvent,
  CreateContactRequest,
  SendMessageRequest,
  MessagingState,
} from "@/types/messaging";

// Use in component
const [contacts, setContacts] = useState<Contact[]>([]);
const [currentConversation, setCurrentConversation] =
  useState<Conversation | null>(null);

// Use in requests
const createContact = async (request: CreateContactRequest) => {
  const response = await api.post<ApiResponse<Contact>>(
    "/api/contacts",
    request
  );
  return response.data;
};

// Use in WebSocket
socket.on(WebSocketEvent.MESSAGE_SEND, (payload: MessageSendPayload) => {
  // Handle incoming message
});
```

### Backend

```typescript
// Import types
import {
  AuthenticatedSocket,
  WebSocketEventHandler,
  ClientMessagePayload,
  MessageServiceResponse,
  ValidationError,
  AuthorizationError,
} from "@/types/messaging";

// Handler implementation
const handleMessageSend: WebSocketEventHandler = async (
  socket,
  io,
  data: ClientMessagePayload
) => {
  try {
    // Validate input
    if (!data.content) {
      throw new ValidationError("Content is required");
    }

    // Check authorization
    if (!socket.userId) {
      throw new AuthorizationError();
    }

    // Create message...
  } catch (error) {
    // Handle error
  }
};
```

---

## Type Safety Benefits

✅ **Full IntelliSense Support**

- IDE autocomplete for all properties
- Parameter suggestions
- Return type awareness

✅ **Compile-Time Checking**

- Catch type errors before runtime
- Prevent undefined/null errors
- Enforce required properties

✅ **Self-Documenting Code**

- Types serve as documentation
- Clear property names and purpose
- Usage examples in interface

✅ **Maintainability**

- Easy refactoring with type checking
- Breaking changes detected at compile
- Easier for team collaboration

---

## Integration Checklist

- [x] Frontend types created (`messaging.ts`)
- [x] Backend types created (`messaging.ts`)
- [x] Frontend types exported in `index.ts`
- [x] Backend types exported in `index.ts`
- [x] All enums defined
- [x] All interfaces defined
- [x] WebSocket event types defined
- [x] Request/response types defined
- [x] Error classes defined
- [x] Documentation complete

---

## Summary

**Total Type Definitions: 50+**

**Frontend:**

- 3 enums
- 15 interfaces
- 8 request types
- 5 response types
- 5 WebSocket payload types
- 3 UI model types

**Backend:**

- 8 interface types
- 3 service response types
- 5 client payload types
- 5 custom entity types
- 5 error classes
- 5 utility types

**All types are exported and ready to use in both frontend and backend!** ✨
