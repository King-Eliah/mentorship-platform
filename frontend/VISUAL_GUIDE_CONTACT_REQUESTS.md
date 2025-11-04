# Contact Request System - Visual Guide

## User Interface Flow

### 1. Messages Page Tabs

```
┌─────────────────────────────────────────────┐
│  Messages                                   │
├─────────────────────────────────────────────┤
│  [Chats] [People] [Requests ⓘ 3]            │
│  Search...                                  │
├─────────────────────────────────────────────┤
│  Content based on active tab                │
└─────────────────────────────────────────────┘
```

### 2. People Tab View

```
┌─────────────────────────────────────────────┐
│  People Tab (Browse Users)                  │
├─────────────────────────────────────────────┤
│  👤 John Mentor          [Add]              │  ← Not connected
│  👤 Jane Mentee        [Pending] 🟨        │  ← Request sent
│  👤 Admin User         [Message]            │  ← Already contact
│  👤 Sarah Coach          [Add]              │  ← Not connected
│                                             │
│  Scroll for more users...                  │
└─────────────────────────────────────────────┘
```

### 3. Requests Tab View

```
┌─────────────────────────────────────────────┐
│  Requests Tab (3 pending)                   │
├─────────────────────────────────────────────┤
│  👤 Alice Smith                             │
│     Mentor - wants to add you              │
│     "Let's collaborate on projects"         │
│     [Decline]     [Accept]                 │
│  ───────────────────────────────────────────┤
│  👤 Bob Johnson                             │
│     Mentee - wants to add you              │
│     [Decline]     [Accept]                 │
│  ───────────────────────────────────────────┤
│  👤 Carol Davis                             │
│     Admin - wants to add you               │
│     [Decline]     [Accept]                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## State Flow Diagrams

### Contact Request Lifecycle

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   User A clicks "Add"       │
│   on User B in People tab   │
└──────┬──────────────────────┘
       │
       ▼ POST /api/contacts/request/send
┌─────────────────────────────┐
│   Request created           │
│   Status: PENDING           │
│   Stored in database        │
└──────┬──────────────────────┘
       │
       ├─────────────────────────┐
       │                         │
       ▼ (User A's view)         ▼ (User B's view)
   "Pending"              Shows in Requests tab
   badge visible          with badge count
       │                         │
       │                         ▼
       │                  User B clicks Accept
       │                         │
       │                         ▼ PATCH /api/contacts/request/{id}/accept
       │                  ┌──────────────────┐
       │                  │ Status: ACCEPTED │
       │                  │ Contacts created │
       │                  │ respondedAt set  │
       │                  └──────┬───────────┘
       │                         │
       ▼ (Re-query contacts)     ▼
   ┌──────────────────┐     ┌──────────────────┐
   │ User B visible   │     │ User A visible   │
   │ in contacts      │     │ in contacts      │
   │ Can message!     │     │ Can message!     │
   └──────────────────┘     └──────────────────┘
```

### Rejection Path

```
        ┌─────────────────────┐
        │ User B clicks       │
        │ "Decline"           │
        └──────┬──────────────┘
               │
               ▼ PATCH /api/contacts/request/{id}/reject
        ┌──────────────────────┐
        │ Status: REJECTED     │
        │ respondedAt set      │
        │ NO contact created   │
        └──────┬───────────────┘
               │
               ▼
        ┌──────────────────────┐
        │ Request disappears   │
        │ from Requests tab    │
        │ User A sees "Add"    │
        │ button again         │
        └──────────────────────┘
```

---

## Data Model Diagram

```
┌──────────────────────────┐
│         User             │
├──────────────────────────┤
│ id (UUID)                │
│ firstName                │
│ lastName                 │
│ email                    │
│ role                     │
│ blockedUsers[]           │
└────────┬──────────────┬──┘
         │              │
         │              │ (Relations)
         │              │
    ┌────▼──────────────▼──┐
    │ ContactRequest       │
    ├──────────────────────┤
    │ id (UUID)            │
    │ senderId ──────┐     │
    │ receiverId ─┐  │     │
    │ status      │  │     │
    │ message     │  │     │
    │ createdAt   │  │     │
    │ respondedAt │  │     │
    └─────────────┼──┼─────┘
                  │  │
           ┌──────┘  └──────┐
           │                │
      (FK ref)         (FK ref)
           │                │
           ▼                ▼
    ┌──────────────────────────┐
    │ contactRequestsSent      │ (Relation)
    │ contactRequestsReceived  │ (Relation)
    └──────────────────────────┘

    └─ Also related to Contact model
       when status = ACCEPTED
```

---

## API Request/Response Examples

### 1. Send Contact Request

**Request:**

```http
POST /api/contacts/request/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": "user-123",
  "message": "I'd love to connect!"
}
```

**Response (201):**

```json
{
  "id": "req-456",
  "senderId": "user-789",
  "receiverId": "user-123",
  "status": "PENDING",
  "message": "I'd love to connect!",
  "createdAt": "2024-11-20T10:30:00Z",
  "respondedAt": null,
  "sender": {
    "id": "user-789",
    "firstName": "Alice",
    "lastName": "Smith",
    "avatar": "https://...",
    "email": "alice@example.com",
    "role": "MENTOR"
  }
}
```

**Response (400) - Duplicate:**

```json
{
  "message": "Request already exists"
}
```

### 2. Get Pending Requests

**Request:**

```http
GET /api/contacts/request/pending
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "requests": [
    {
      "id": "req-456",
      "senderId": "user-111",
      "status": "PENDING",
      "message": "Connect?",
      "createdAt": "2024-11-20T10:00:00Z",
      "sender": {
        "id": "user-111",
        "firstName": "Bob",
        "lastName": "Johnson"
      }
    },
    {
      "id": "req-457",
      "senderId": "user-222",
      "status": "PENDING",
      "createdAt": "2024-11-20T09:00:00Z",
      "sender": {
        "id": "user-222",
        "firstName": "Carol",
        "lastName": "Davis"
      }
    }
  ],
  "total": 2
}
```

### 3. Accept Request

**Request:**

```http
PATCH /api/contacts/request/req-456/accept
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "message": "Request accepted",
  "request": {
    "id": "req-456",
    "status": "ACCEPTED",
    "respondedAt": "2024-11-20T10:35:00Z"
  }
}
```

### 4. Reject Request

**Request:**

```http
PATCH /api/contacts/request/req-456/reject
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "message": "Request rejected",
  "request": {
    "id": "req-456",
    "status": "REJECTED",
    "respondedAt": "2024-11-20T10:35:00Z"
  }
}
```

---

## UI Component States

### Add Button States

```
┌──────────────────┐
│ [Add] (idle)     │  ← Initial state
└──────────────────┘
         │
         │ clicked
         ▼
┌──────────────────┐
│ [Add] (loading)  │  ← Disabled while sending
└──────────────────┘
         │
         ▼ success
┌──────────────────┐
│ Pending 🟨       │  ← Shows pending status
└──────────────────┘
```

### Badge States

```
Single Count:                Badge Color Codes:
[Requests 3]                 ┌─────────────────┐
     ↑                       │ 🔴 Red = Urgent │
   Count                     │ (pending count) │
                             │                 │
Hover effect:                │ 🟨 Yellow       │
[Requests]  →  [Requests]    │ (request sent)  │
           (grows slightly)   │                 │
                             │ 🟢 Green        │
                             │ (accepted)      │
                             └─────────────────┘
```

---

## User Journey Map

### User A (Sender)

```
Login
  │
  ▼
Messages page
  │
  ├─→ [Chats] tab
  │     (existing conversations)
  │
  ├─→ [People] tab ◄─── Start here!
  │     │
  │     ├─ Sees list of all users
  │     ├─ Finds "Jane Mentee"
  │     └─ Clicks "Add" button
  │           │
  │           ▼
  │     Button changes to "Pending"
  │     Toast: "Contact request sent!"
  │
  └─→ [Requests] tab
        (no incoming requests)
```

### User B (Receiver)

```
Login
  │
  ▼
Messages page
  │
  ├─→ [Chats] tab
  │
  ├─→ [People] tab
  │     (regular users)
  │
  └─→ [Requests] tab ◄─── Badge shows count!
        │
        ├─ Sees "Alice Smith" request
        ├─ Reads message: "I'd love to connect!"
        │
        ├─→ Clicks "Accept"
        │     │
        │     ▼
        │   Toast: "Contact added!"
        │   Alice now in Contacts
        │   Can message immediately
        │
        └─→ Clicks "Decline"
              │
              ▼
            Toast: "Request declined"
            Request removed from tab
            Alice can resend later
```

---

## Timeline Example

**10:00** - Alice sees Bob in People tab, clicks Add
→ Request created, Alice sees "Pending" badge

**10:05** - Bob opens Requests tab
→ Sees Alice's request with red badge (1)

**10:06** - Bob clicks Accept
→ Toast shows "Contact added!"
→ Alice appears in Bob's Contacts
→ Bob appears in Alice's Contacts

**10:10** - Alice clicks to message Bob
→ Opens conversation
→ Can send message immediately

---

## Validation Rules

```
✅ ALLOWED                          ❌ NOT ALLOWED
├─ Send to any user                 ├─ Send to self
├─ Send to users in other groups    ├─ Send to existing contact
├─ Resend after rejection           ├─ Send duplicate request
├─ Optional message                 ├─ Empty message (can be omitted)
└─ Multiple simultaneous requests   └─ Send to blocked users
    (between different pairs)           (future enhancement)
```

---

## Database Query Patterns

### Find All Pending Requests for User

```sql
SELECT * FROM "ContactRequest"
WHERE "receiverId" = {userId}
  AND "status" = 'PENDING'
ORDER BY "createdAt" DESC;
```

### Find Request Status Between Two Users

```sql
SELECT "status" FROM "ContactRequest"
WHERE ("senderId" = {userA} AND "receiverId" = {userB})
   OR ("senderId" = {userB} AND "receiverId" = {userA});
```

### Check if Users Can Connect

```sql
SELECT COUNT(*) FROM "Contact"
WHERE ("userId" = {userA} AND "contactUserId" = {userB})
   OR ("userId" = {userB} AND "contactUserId" = {userA});
```

---

## Performance Characteristics

```
Operation              Time     Database
─────────────────────────────────────────
Send Request          <500ms   INSERT 1 row
Get Pending           <300ms   SELECT 10-50 rows*
Accept Request        <500ms   UPDATE 1, INSERT 2 rows
Reject Request        <300ms   UPDATE 1 row
Load Requests Tab     <1s      GET pending + batch fetch senders

* Depends on number of pending requests
```
