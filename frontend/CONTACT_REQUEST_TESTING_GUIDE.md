# Contact Request System - Testing Guide

## Quick Start

### Prerequisites

- Backend running on port 5000
- Frontend running on port 5173
- Database migrated with ContactRequest model

### Test Scenario

#### Setup

1. Login as **User A (e.g., Mentor)**
2. Open a second browser/incognito and login as **User B (e.g., Mentee)**
3. Keep both windows side-by-side

#### Test 1: Send Contact Request

**User A's Browser:**

1. Navigate to Messages > People tab
2. Find User B in the list
3. Click "Add" button next to User B
4. Verify:
   - Button changes to yellow "Pending" badge
   - Toast shows: "Contact request sent!"
   - Backend state updated

#### Test 2: Receive Contact Request

**User B's Browser:**

1. Refresh or wait for next poll
2. Go to Messages > Requests tab
3. Verify:
   - See red badge with count on "Requests" tab
   - User A appears in list
   - Shows User A's name, role
   - If message was added, see it

#### Test 3: Accept Request

**User B's Browser:**

1. On User A's request, click "Accept"
2. Verify:
   - Request disappears from list
   - Toast shows: "Contact added!"
   - Badge count decreases

**User A's Browser:**

1. Go to People tab
2. Refresh
3. Verify:
   - User B now shows message button instead of "Add"
   - Can now message User B

#### Test 4: Message After Accept

**User A's Browser:**

1. In People tab, click message icon next to User B
2. Start a conversation
3. Send a message
4. Verify message appears

**User B's Browser:**

1. Check Chats tab
2. Verify conversation appears with User A
3. See the message from User A

#### Test 5: Reject Request

**Setup:** Send another request from User A to different User C

**User C's Browser:**

1. See request in Requests tab
2. Click "Decline"
3. Verify:
   - Request disappears
   - Toast shows: "Request declined"
   - Badge count decreases

**User A's Browser:**

1. Go to People tab
2. Find User C
3. Verify "Add" button is back (not pending)
4. Can send request again

#### Test 6: Edge Cases

**Cannot send to self:**

- Try to find own user in People tab
- Verify not in list or "Add" button disabled

**Cannot send to existing contact:**

- Find someone already in contacts
- Verify "Add" button not shown or disabled

**Duplicate Prevention:**

- Send request to User X
- Close browser without refreshing
- Try to send request to User X again
- Verify error: "Request already exists"

**Permissions:**

- Try to accept request not meant for you
- Try to reject request sent by you
- Verify 403 Forbidden error

#### Test 7: UI Responsiveness

**Mobile:**

1. On mobile device/responsive view
2. Go to Messages > People
3. Verify "Add" button is clickable
4. Verify "Requests" tab visible
5. Verify request list scrolls properly

**Dark Mode:**

1. Toggle dark mode
2. Verify all elements visible
3. Verify badges stand out
4. Verify text readable

#### Test 8: Data Persistence

**Restart Backend:**

1. Kill backend process
2. Restart it
3. Query pending requests
4. Verify requests still there in database

**Restart Frontend:**

1. Close browser
2. Reopen and login
3. Check "Requests" tab
4. Verify pending requests still visible

## API Testing (cURL/Postman)

### 1. Send Request

```bash
curl -X POST http://localhost:5000/api/contacts/request/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "USER_ID",
    "message": "I'd like to connect!"
  }'
```

Response:

```json
{
  "id": "req_id",
  "senderId": "your_id",
  "receiverId": "user_id",
  "status": "PENDING",
  "message": "I'd like to connect!",
  "createdAt": "2024-11-20T...",
  "sender": { ... }
}
```

### 2. Get Pending Requests

```bash
curl -X GET http://localhost:5000/api/contacts/request/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "requests": [ ... ],
  "total": 2
}
```

### 3. Accept Request

```bash
curl -X PATCH http://localhost:5000/api/contacts/request/{REQUEST_ID}/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Reject Request

```bash
curl -X PATCH http://localhost:5000/api/contacts/request/{REQUEST_ID}/reject \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Debug Checklist

- [ ] Check browser console for errors
- [ ] Check network tab for failed API calls
- [ ] Verify token is being sent in Authorization header
- [ ] Check backend logs for server errors
- [ ] Verify database has ContactRequest table
- [ ] Verify Prisma client is updated (npx prisma generate)
- [ ] Verify routes are registered in express app
- [ ] Check if auth middleware is working
- [ ] Verify permissions on accept/reject endpoints

## Performance Considerations

- Requests load on page mount and when tab changes
- Polling doesn't include requests (separate endpoints)
- requestStatusMap provides O(1) lookup for status
- Indexes on senderId, receiverId prevent slow queries
- Unique constraint prevents duplicates at database level

## Known Limitations

1. **No real-time notifications** - Requests appear on next page refresh
2. **No request expiration** - Pending requests stay indefinitely
3. **No bulk operations** - Accept/reject one at a time
4. **No archived requests** - Only active requests shown
5. **No request history** - Past requests not displayed
