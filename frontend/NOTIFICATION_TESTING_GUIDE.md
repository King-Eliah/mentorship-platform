# Notification System - Testing & Troubleshooting

**Date:** November 2, 2025

## ✅ What to Check

### 1. Is the Backend Running?

Check if backend is running on port 5000:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# You should see:
# 🚀 Server is running on port 5000
# 📡 Environment: development
# 🔌 WebSocket server ready
```

### 2. Is the Frontend Running?

Check if frontend is running (usually on 5173 or 5174):

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev

# You should see:
# VITE v7.1.5 ready in 251 ms
# ➜ Local: http://localhost:5173/
```

### 3. Are You Logged In?

- ✅ Login to the app
- ✅ You should see your profile/name in the navbar

### 4. How to Generate Test Notifications

#### Method 1: Send a Direct Message

1. Go to Messages page
2. Start a conversation with another user
3. Send a message
4. **Backend should create a notification for the recipient**
5. Recipient should see:
   - Bell icon with unread count
   - Click bell → See notification on /notifications page

#### Method 2: Send Contact Request

1. Find another user
2. Click "Add" or "Connect" button
3. Send contact request
4. **Backend should create a notification for them**
5. They should see notification

#### Method 3: Accept Contact Request

1. Have a pending contact request
2. Accept it
3. **Backend should create a notification for the requester**
4. They should see notification

---

## 🔍 How to Debug

### Check Backend Logs

Look at the backend terminal for:

```
[POST /api/messages] User: {userId}  // Message sent
[PATCH /api/notifications/{id}/read]  // Read marked
```

### Check Frontend Console

Open browser dev tools (F12) and look for:

- API calls to `/api/notifications`
- Errors in console
- Network tab → check responses

### Test API Endpoints Directly

Using Postman or curl:

```bash
# 1. Get notifications
curl -H "Authorization: Bearer {YOUR_TOKEN}" \
  http://localhost:5000/api/notifications

# 2. Mark notification as read
curl -X PATCH \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  http://localhost:5000/api/notifications/{notificationId}/read

# 3. Mark all as read
curl -X PATCH \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  http://localhost:5000/api/notifications/all/read
```

---

## 📍 Where to Look for Notifications

### 1. Notification Bell

- **Location:** Top navbar (right side, next to profile)
- **Shows:** Red badge with unread count
- **Click:** Opens `/notifications` page

### 2. Notifications Page

- **URL:** http://localhost:5173/notifications
- **Shows:** Full list of all notifications
- **Features:**
  - Mark as read (individual)
  - Mark all read button
  - Time ago formatting
  - Blue highlight for unread

### 3. Dashboard Recent Messages

- **Location:** Admin Dashboard, right side card
- **Shows:** 3 most recent received messages
- **Features:**
  - Sender name
  - Message preview
  - Time ago
  - "View All" button

---

## ✅ Expected Behavior

### When Message is Sent

**Backend Flow:**

```
1. User A sends message to User B
2. messageController.sendMessage() is called
3. Message created in DB
4. Notification created for User B:
   - userId: User B's ID
   - type: MESSAGE
   - title: "New message from User A"
   - message: First 50 chars of message
   - isRead: false
```

**Frontend Flow:**

```
1. User B's bell icon updates (shows unread count)
2. User B can click bell
3. Navigates to /notifications
4. Sees notification in list
5. Can mark as read
6. Notification disappears or shows as read
```

### When Dashboard Loads

**Frontend Flow:**

```
1. Admin views dashboard
2. RecentMessages card fetches data
3. API call: GET /api/conversations
4. Extracts received messages only
5. Sorts by date (newest first)
6. Shows 3 most recent
7. Displays sender, preview, time ago
```

---

## 🛠️ If Still Not Seeing Notifications

### Step 1: Verify Backend is Creating Notifications

Check backend logs:

```
[POST /api/messages] User sends message
→ Check if notification is created in database
→ Query: SELECT * FROM "Notification" ORDER BY "createdAt" DESC LIMIT 5
```

### Step 2: Verify Frontend is Fetching

Check frontend console (F12 → Network tab):

```
GET /api/notifications → Should return 200 with notifications array
```

### Step 3: Check Browser Storage

In browser console:

```javascript
// Check if token is stored
console.log(localStorage.getItem("token"));

// Check if user ID is available
console.log(localStorage.getItem("userId"));
```

### Step 4: Hard Refresh Frontend

```
Ctrl + Shift + R  // Hard refresh (clear cache)
```

### Step 5: Check for Errors

Look for red errors in:

- Backend terminal
- Frontend console (F12)
- Network tab (API responses)

---

## 📋 Quick Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173/5174
- [ ] Logged in to app
- [ ] Can see navbar with bell icon
- [ ] Sent a test message (or have data in system)
- [ ] Bell shows unread count
- [ ] Clicking bell navigates to /notifications
- [ ] /notifications page shows list
- [ ] Mark as read button works
- [ ] Dashboard shows recent messages

---

## 🚀 URL Reference

- **Frontend:** http://localhost:5173 (or 5174)
- **Backend API:** http://localhost:5000
- **Notifications Page:** http://localhost:5173/notifications
- **Dashboard:** http://localhost:5173/dashboard
- **Messages:** http://localhost:5173/messages

---

## 📝 Recent Changes

1. ✅ Fixed route order (all/read before :id/read)
2. ✅ Changed from PUT to PATCH for consistency
3. ✅ Added getNotificationCount() method
4. ✅ Verified TypeScript - 0 errors on both

---

## 💡 Common Issues

### Issue 1: "No notifications showing"

**Solution:**

1. Do you have messages in the system?
2. Were they sent after the notification system was set up?
3. Try sending a new message
4. Hard refresh (Ctrl+Shift+R)

### Issue 2: "Bell doesn't show number"

**Solution:**

1. Check backend is creating notifications
2. Check frontend can fetch /api/notifications
3. Make sure you're logged in as the recipient

### Issue 3: "Clicking bell does nothing"

**Solution:**

1. Check browser console for errors
2. Make sure /notifications route exists
3. Check NotificationBell component is rendering

### Issue 4: "Recent Messages card is empty"

**Solution:**

1. You need to have received messages
2. Messages must be from other users (not sent by you)
3. Check if you're viewing as admin
4. Refresh the page

---

## 🔗 API Endpoints Summary

| Method | Endpoint                         | Purpose                               | Auth |
| ------ | -------------------------------- | ------------------------------------- | ---- |
| GET    | /api/notifications               | Get all notifications                 | ✅   |
| PATCH  | /api/notifications/:id/read      | Mark one as read                      | ✅   |
| PATCH  | /api/notifications/all/read      | Mark all as read                      | ✅   |
| DELETE | /api/notifications/:id           | Delete notification                   | ✅   |
| POST   | /api/messages                    | Send message (creates notification)   | ✅   |
| PATCH  | /api/contacts/{requestId}/accept | Accept request (creates notification) | ✅   |

---

## 📞 Still Need Help?

1. **Check backend logs** - Any errors when sending message?
2. **Check database** - Are notifications being created?
3. **Check frontend console** - Any API errors?
4. **Hard refresh** - Clear browser cache
5. **Check you're logged in** - Verify user is authenticated
