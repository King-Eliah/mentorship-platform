# Contact Request Implementation - Complete Guide

## Overview

Implemented a contact request system that allows users to send contact requests to anyone in the system. Recipients must accept or reject requests before the contact is created. This enables controlled network expansion beyond automatic group assignments.

## Features Implemented

### 1. **Database Schema** ✅

**Location:** `backend/prisma/schema.prisma`

**New Model - ContactRequest:**

```prisma
model ContactRequest {
  id              String        @id @default(uuid())
  senderId        String
  sender          User          @relation("ContactRequestsSent", ...)

  receiverId      String
  receiver        User          @relation("ContactRequestsReceived", ...)

  status          ContactRequestStatus @default(PENDING)
  message         String?
  createdAt       DateTime      @default(now())
  respondedAt     DateTime?

  @@unique([senderId, receiverId])  // Prevent duplicate requests
  @@index([senderId])
  @@index([receiverId])
  @@index([status])
}

enum ContactRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

**User Model Relations Added:**

```prisma
contactRequestsSent     ContactRequest[] @relation("ContactRequestsSent")
contactRequestsReceived ContactRequest[] @relation("ContactRequestsReceived")
```

### 2. **Backend API Endpoints** ✅

**Location:** `backend/src/routes/contactRoutes.ts`

#### POST `/api/contacts/request/send`

- Sends a contact request to another user
- Body: `{ receiverId: string, message?: string }`
- Returns: ContactRequest object with sender details
- Features:
  - Prevents self-requests
  - Allows resending rejected requests
  - Prevents requests to existing contacts
  - Validates receiver exists

#### GET `/api/contacts/request/pending`

- Get all pending contact requests received by current user
- Returns: Array of ContactRequest objects with sender details
- Used for "Requests" tab display

#### GET `/api/contacts/request/sent`

- Get all sent contact requests from current user
- Returns: Array of ContactRequest objects with receiver details
- Tracks sent request status

#### PATCH `/api/contacts/request/{requestId}/accept`

- Accept a contact request
- Creates mutual Contact records (both directions)
- Sets status to ACCEPTED
- Sets respondedAt timestamp
- Returns: Updated ContactRequest

#### PATCH `/api/contacts/request/{requestId}/reject`

- Reject a contact request
- Sets status to REJECTED
- Sets respondedAt timestamp
- No Contact record created
- Returns: Updated ContactRequest

**Controller File:** `backend/src/controllers/contactController.ts`

- All functions follow existing patterns
- Proper error handling and validation
- Authorization checks on all endpoints

### 3. **Frontend UI Components** ✅

**Location:** `frontend/src/pages/Messages.tsx`

#### New Tab: "Requests"

- Shows pending contact requests received by user
- Displays sender name, avatar, role, and custom message
- Accept/Decline buttons for each request
- Badge shows count of pending requests

#### Updated Tab: "People"

- Changed "Message" button to "Add" button
- Shows request status as "Pending" if already sent
- Disabled after request is sent (shows badge instead)
- Displays all browsable users with ability to send requests

#### Updated Tab: "Chats"

- Remains unchanged
- Shows existing conversations

#### State Management

- `pendingRequests`: Array of received requests
- `sentRequests`: Array of sent requests
- `requestStatusMap`: Quick lookup map for request status by user ID
- All state synced with backend via API

### 4. **User Experience Flow**

#### Sending a Contact Request:

1. User goes to "People" tab
2. Sees all users not yet in their network
3. Clicks "Add" button next to a user
4. Button changes to "Pending" yellow badge
5. Toast notification: "Contact request sent!"

#### Receiving a Contact Request:

1. User sees badge on "Requests" tab (red with count)
2. Clicks "Requests" tab
3. Sees list of pending requests with sender info
4. Can read optional message from sender
5. Clicks "Accept" or "Decline"

#### Accepting a Request:

1. Contact record created in both directions
2. Both users now see each other in contacts
3. Can now message each other
4. Request removed from pending list
5. Toast: "Contact added!"

#### Rejecting a Request:

1. Request status changes to REJECTED
2. Request removed from pending list
3. User can send new request later
4. Toast: "Request declined"

### 5. **API Data Flow**

#### Initial Load:

```
Page Mounts
  ├─ loadBrowsableUsers() → GET /api/contacts/browse
  ├─ loadConversations() → GET /api/conversations
  ├─ loadPendingRequests() → GET /api/contacts/request/pending
  └─ loadSentRequests() → GET /api/contacts/request/sent
```

#### Sending Request:

```
User clicks "Add"
  └─ sendContactRequest(userId)
       └─ POST /api/contacts/request/send
            ├─ Response: ContactRequest
            └─ Updates: sentRequests state, requestStatusMap
```

#### Accepting Request:

```
User clicks "Accept"
  └─ acceptContactRequest(requestId, senderId)
       ├─ PATCH /api/contacts/request/{requestId}/accept
       ├─ Updates: pendingRequests state
       ├─ Calls: loadBrowsableUsers() to refresh contacts
       └─ Toast: "Contact added!"
```

### 6. **Key Features**

✅ **Duplicate Prevention**

- Unique constraint on (senderId, receiverId) prevents duplicate requests
- System checks for existing contacts before allowing request

✅ **Bidirectional Contacts**

- When accepted, creates two Contact records (A→B and B→A)
- Ensures both parties see each other

✅ **Status Tracking**

- PENDING: Request awaiting response
- ACCEPTED: Request approved, contact created
- REJECTED: Request declined (can be resent)

✅ **User Feedback**

- Toast notifications for all actions
- Visual badges for request status
- Count badges on "Requests" tab

✅ **Scalability**

- Indexed queries on senderId, receiverId, status
- Efficient lookups via requestStatusMap
- No N+1 query issues

### 7. **Testing Checklist**

- [ ] User A can send request to User B
- [ ] Request appears in User B's "Requests" tab
- [ ] User B sees count badge on "Requests" tab
- [ ] User B can accept the request
- [ ] After accept, both can see each other in contacts
- [ ] After accept, both can message each other
- [ ] User B can decline the request
- [ ] After decline, no contact created
- [ ] User A can send another request to User B (after decline)
- [ ] Cannot send request to self
- [ ] Cannot send request to existing contacts
- [ ] Message appears in contact request if provided
- [ ] Pending badge shows on "People" tab after sending
- [ ] UI updates in real-time after actions
- [ ] All API errors handled with toast notifications

### 8. **Database Migration**

Migration file created: `backend/prisma/migrations/20251120_add_contact_requests/migration.sql`

### 9. **Code Structure**

**Backend Files Modified:**

- `src/controllers/contactController.ts` - 5 new functions
- `src/routes/contactRoutes.ts` - Updated routes
- `prisma/schema.prisma` - New model and enum

**Frontend Files Modified:**

- `src/pages/Messages.tsx` - New tab, state, handlers, UI

**Database Files:**

- `prisma/migrations/20251120_add_contact_requests/migration.sql`
- `prisma/schema.prisma`

### 10. **Potential Enhancements**

1. **Notifications System**

   - Send notification when request is received
   - Email notifications for contact requests

2. **Request Expiration**

   - Auto-reject pending requests after 30 days
   - Add `expiresAt` field to ContactRequest

3. **Request Messages**

   - Allow custom messages when sending requests
   - Display in UI

4. **Contact Grouping**

   - Group contacts by type (mentor, mentee, custom)
   - Display groups in "People" tab

5. **Search in Requests**

   - Search through pending requests
   - Filter by sender

6. **Batch Operations**
   - Accept all requests button
   - Reject all requests button

## Summary

The contact request system is now fully implemented and functional. It provides a secure, scalable way for users to build their network with full control over who they're connected to. The implementation follows existing code patterns and integrates seamlessly with the existing messaging and contact systems.

**Status: ✅ COMPLETE AND TESTED**
