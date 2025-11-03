# Why You Don't See Notifications - Diagnostic Guide

**Date:** November 2, 2025

## 🎯 The Issue: "I don't see any notifications"

This is likely because:

1. **No test data** - You haven't sent messages/contact requests yet
2. **Servers not running** - Backend/frontend stopped
3. **Not logged in** - Notifications only show for authenticated users
4. **Need to refresh** - Page needs to reload to fetch new notifications

---

## ✅ Quick Fixes (Try These First)

### Fix 1: Make Sure Servers Are Running

**Terminal 1 - Start Backend:**

```bash
cd c:\Users\USER\Desktop\mentorship\backend
npm run dev
```

✅ Should see: `🚀 Server is running on port 5000`

**Terminal 2 - Start Frontend:**

```bash
cd c:\Users\USER\Desktop\mentorship\frontend
npm run dev
```

✅ Should see: `VITE v7.1.5 ready in XXX ms`

### Fix 2: Hard Refresh Frontend

```
Ctrl + Shift + R  (or Cmd+Shift+R on Mac)
```

This clears the browser cache and reloads everything.

### Fix 3: Verify You're Logged In

- Go to http://localhost:5173
- Check if you can see your name/profile in navbar
- If not logged in, login first

### Fix 4: Generate Test Data

**Option A: Send a Message**

1. Go to Messages page
2. Find or search for another user
3. Send them a message
4. They should receive a notification

**Option B: Send Contact Request**

1. Find another user
2. Click "Add" or "Connect" button
3. Send request
4. They should receive a notification

**Option C: Accept a Pending Request**

1. Go to your pending contact requests
2. Accept one
3. The requester should get a notification

---

## 🔍 Detailed Troubleshooting

### Step 1: Check if Backend is Creating Notifications

Look at backend terminal for these logs:

```
[POST /api/messages] User: {userId} sent message
[POST /api/contacts/{receiverId}/request] Request created
[PATCH /api/contacts/{requestId}/accept] Request accepted
```

If you see these, notifications were created.

### Step 2: Check if Frontend Can Fetch Notifications

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on notification bell or go to /notifications
4. Look for request: `GET http://localhost:5000/api/notifications`
5. Check the response - should show:

```json
{
  "notifications": [],
  "unreadCount": 0
}
```

If empty array → No notifications created yet
If has items → They should display on page

### Step 3: Check Browser Console for Errors

1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common errors:
   - `Cannot read property of undefined`
   - `API endpoint not found`
   - `Unauthorized`

### Step 4: Test API Directly

Use Postman or curl to test:

```bash
# Get your notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/notifications

# This should return:
# {
#   "notifications": [...],
#   "unreadCount": number
# }
```

---

## 🗂️ Where Notifications Appear

### 1. **Bell Icon (Navbar)**

- Location: Top right corner
- Shows red badge with unread count
- Click → Opens `/notifications`

### 2. **Notifications Page**

- URL: http://localhost:5173/notifications
- Shows full list of notifications
- Can mark as read
- Has "Mark All Read" button

### 3. **Dashboard Recent Messages Card**

- Location: Admin dashboard, 4-panel grid
- Shows 3 most recent messages received
- Only displays when you're logged in as admin
- Shows sender name, preview, time ago

---

## 🚀 Complete Testing Workflow

### Step 1: Start Both Servers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Step 2: Open Frontend

```
http://localhost:5173
```

### Step 3: Login

- Use your credentials
- See your name in navbar

### Step 4: Send a Test Message

1. Go to **Messages** page
2. Find another user (search by ID)
3. Send them a message
4. They should get a notification

### Step 5: View Notification (as recipient)

1. Recipient logs in
2. Sees bell icon with "1" badge
3. Clicks bell
4. Navigates to `/notifications`
5. Sees the message notification
6. Can click "Mark Read"

### Step 6: Check Recent Messages (Admin)

1. Admin logs in
2. Goes to dashboard
3. Sees **Recent Messages** card
4. Shows the message you just sent (if received)

---

## 📋 Verification Checklist

Use this to verify everything is working:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173 or 5174
- [ ] Logged in to application
- [ ] Can see navbar with bell icon
- [ ] Another user exists or can create one
- [ ] Sent a test message successfully
- [ ] Recipient's bell shows unread count
- [ ] Recipient can click bell
- [ ] Notifications page shows notification
- [ ] Can mark notification as read
- [ ] Dashboard shows recent message (if admin)
- [ ] Hard refresh shows fresh data
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## ⚙️ What Changed Today

1. ✅ Fixed route ordering in backend (`/all/read` before `/:id/read`)
2. ✅ Changed from PUT to PATCH for consistency
3. ✅ Added missing `getNotificationCount()` method
4. ✅ Updated frontend service to match backend routes
5. ✅ Fixed RecentMessages component data fetching
6. ✅ Both applications build with 0 TypeScript errors

---

## 🔗 Key Files

**Backend Notification Logic:**

- `backend/src/controllers/messageController.ts` - Creates notification on message
- `backend/src/controllers/contactController.ts` - Creates notification on contact event
- `backend/src/controllers/notificationController.ts` - Marks as read, fetches

**Frontend Notification Display:**

- `frontend/src/components/notifications/NotificationBell.tsx` - Bell icon
- `frontend/src/pages/NotificationsPage.tsx` - Notifications list page
- `frontend/src/components/dashboardNew/RecentMessages.tsx` - Dashboard card

**API Routes:**

- `backend/src/routes/notificationRoutes.ts` - Notification endpoints
- Connected in `backend/src/server.ts` as `/api/notifications`

---

## 💡 Important Notes

1. **Notifications require messages/events** - They won't appear without data
2. **You need 2 users** - To send/receive messages and test
3. **Backend creates them** - Frontend just displays them
4. **Polling or WebSocket** - Frontend fetches every 2-5 seconds
5. **Proper authentication** - Token must be valid and in Authorization header
6. **Database must be connected** - If DB is down, no notifications stored

---

## 🎓 Learning: How It Works

### Data Flow When Message is Sent

```
User A Types Message → Clicks Send
            ↓
frontend/src/pages/Messages.tsx
            ↓
Calls: messageService.sendMessage(receiverId, message)
            ↓
POST /api/messages
            ↓
backend/src/controllers/messageController.ts:sendMessage()
            ↓
1. Creates Message in database
2. Calls prisma.notification.create()
   - userId: User B's ID
   - type: MESSAGE
   - title: "New message from User A"
   - message: "message content"
   - isRead: false
            ↓
Response: { message: {...}, success: true }
            ↓
User B's Frontend:
1. Polls GET /api/notifications every 2 seconds
2. Sees new notification in response
3. Updates bell icon with unread count "1"
4. Can click bell to see all notifications
```

### Data Flow When User Views Notifications

```
User Clicks Bell Icon
            ↓
navigate('/notifications')
            ↓
NotificationsPage Component Loads
            ↓
useNotifications Hook
            ↓
GET /api/notifications
            ↓
backend/src/controllers/notificationController.ts:getNotifications()
            ↓
Returns:
{
  "notifications": [...],
  "unreadCount": 5
}
            ↓
Frontend displays:
- List of notifications
- Mark as read buttons
- Time ago formatting
```

---

## ❓ FAQ

**Q: Why don't I see any notifications?**
A: You probably haven't sent/received any messages yet. Try sending a test message.

**Q: How do I send a test message?**
A: Go to Messages page, find another user, send them a message.

**Q: Do both servers need to be running?**
A: Yes - backend creates notifications, frontend displays them.

**Q: How long does it take to show?**
A: Usually instant, but frontend polls every 2-5 seconds.

**Q: Can I clear/delete notifications?**
A: Yes - delete button in the code, or mark as read to hide.

**Q: What if I still don't see anything?**
A:

1. Hard refresh (Ctrl+Shift+R)
2. Check browser console for errors
3. Check backend terminal for logs
4. Make sure database is connected
5. Try sending a new message

---

## 🎯 Next Steps

1. **Start both servers** (if not already running)
2. **Login to app**
3. **Send a test message** to another user
4. **Check notification bell** for unread count
5. **Click bell** to see notifications page
6. **Try "Mark as Read"** button
7. **Check dashboard** for recent messages

If you still don't see anything after these steps, **check the troubleshooting section** or **look at browser console for errors**.

---

**Status: Ready to Test ✅**

All systems implemented and build is passing. Notifications will appear once you have test data (messages, contact requests, etc.).
