# Notification System - Visual Guide

**Date:** November 2, 2025

---

## 🔔 What the Notification Bell Looks Like

### Before: Dropdown

```
[🔔₃] <- Click → Shows dropdown with notifications
```

### Now: Page Link

```
[🔔₃] <- Click → Navigates to /notifications page
```

The bell shows:

- **Icon:** 🔔 notification bell
- **Badge:** Red circle with number (unread count)
- **Example:** [🔔₅] means 5 unread notifications

---

## 📋 Notifications Page Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Notifications              Mark All Read (5)           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ● New message from John Doe              2 minutes ago  │
│   "Hey, how's the project going?"                       │
│                                      [Mark Read]        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ● Contact request from Sarah Smith       1 hour ago    │
│   "Sarah Smith sent you a contact request"             │
│                                      [Mark Read]        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   New group message in Project Team      3 hours ago   │
│   "Meeting notes uploaded in resources"                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [More notifications...]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘

● = Unread (blue dot indicator)
  = Read (no dot)
```

---

## 📱 Dashboard Recent Messages Card

```
┌─────────────────────────────────────┐
│  📨 Recent Messages   View All      │
├─────────────────────────────────────┤
│                                     │
│  John Doe                  2m ago   │
│  "Hey, did you get my email about  │
│   the project?"                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Sarah Smith              45m ago   │
│  "Thanks for the feedback on my    │
│   proposal."                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Team Lead               2h ago    │
│  "Next sprint planning meeting    │
│   is scheduled for tomorrow."     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 User Flow: Receiving a Message

### Step 1: Send Message

```
User A (Frontend)          User A (Backend)
    │                          │
    ├─ Types message    ──→    ├─ GET /api/messages
    │                          │
    ├─ Clicks send      ──→    ├─ POST /api/messages
    │                          │
    │                          ├─ Create message in DB
    │                          │
    │                          ├─ Create notification for User B
    │                          │   (userId: userB_id)
    │                          │   (type: MESSAGE)
    │                          │   (isRead: false)
    │                          │
    │                    ←──   ├─ Return success
```

### Step 2: Recipient Sees Notification

```
User B (Frontend)                   User B (Backend)
    │                                   │
    ├─ Polls: GET /api/notif  ─→     ├─ Query notifications
    │                                   │   WHERE userId = userB_id
    │                                   │   AND isRead = false
    │                                   │
    │                          ←─    ├─ Return {
    │                                   │   "notifications": [
    │                                   │     {title: "New message"}
    │                                   │   ],
    │                                   │   "unreadCount": 1
    │                                   │ }
    │
    ├─ Bell shows "1"
    │
    ├─ User clicks bell
    │
    ├─ Shows /notifications page
    │  with notification list
```

### Step 3: Mark as Read

```
User B Clicks "Mark Read"
    │
    ├─ PATCH /api/notifications/{id}/read
    │
    ├─ Backend: update notification
    │   SET isRead = true
    │
    ├─ Frontend: remove from unread list
    │  or show as read (grayed out)
    │
    └─ Bell badge disappears (0 unread)
```

---

## 🎯 When Notifications Are Created

### 1. Direct Message Sent

```
Trigger: messageController.sendMessage()
│
├─ Create Notification
│  ├─ userId: recipient_id
│  ├─ type: MESSAGE
│  ├─ title: "New message from John Doe"
│  ├─ message: "First 50 chars of message..."
│  └─ isRead: false
```

### 2. Group Message Posted

```
Trigger: messageController.sendMessage(groupId)
│
├─ Get all group members
│  (except the sender)
│
├─ For each member:
│  └─ Create Notification
│     ├─ userId: member_id
│     ├─ type: GROUP
│     ├─ title: "New message in ProjectTeam"
│     ├─ message: "John posted: 'Update...'"
│     └─ isRead: false
```

### 3. Contact Request Sent

```
Trigger: contactController.sendContactRequest()
│
├─ Create Notification
│  ├─ userId: recipient_id
│  ├─ type: SYSTEM
│  ├─ title: "Contact request from John Doe"
│  ├─ message: "John Doe sent you a request"
│  └─ isRead: false
```

### 4. Contact Request Accepted

```
Trigger: contactController.acceptContactRequest()
│
├─ Create Notification
│  ├─ userId: requester_id
│  ├─ type: SYSTEM
│  ├─ title: "Contact request accepted"
│  ├─ message: "Sarah accepted your request"
│  └─ isRead: false
```

---

## 📊 Database Storage

### Notification Table

```sql
Notification
├─ id: UUID (primary key)
├─ userId: UUID (who receives)
├─ type: ENUM (MESSAGE, GROUP, SYSTEM, etc)
├─ title: VARCHAR (e.g., "New message from John")
├─ message: VARCHAR (e.g., "Hey, how are you?")
├─ link: VARCHAR (optional, for click action)
├─ isRead: BOOLEAN (default: false)
└─ createdAt: TIMESTAMP

Indexes:
├─ ON userId (fast: find user's notifications)
├─ ON isRead (fast: find unread)
└─ ON createdAt (fast: sort by date)
```

---

## 🔗 API Endpoint Flows

### GET /api/notifications

```
Request:
  GET http://localhost:5000/api/notifications
  Headers: { Authorization: "Bearer TOKEN" }

Response (200 OK):
{
  "notifications": [
    {
      "id": "abc123",
      "userId": "user123",
      "type": "MESSAGE",
      "title": "New message from John",
      "message": "Hello, how are you?",
      "link": null,
      "isRead": false,
      "createdAt": "2025-11-02T10:30:00Z"
    },
    {
      "id": "def456",
      "userId": "user123",
      "type": "SYSTEM",
      "title": "Contact request accepted",
      "message": "Sarah accepted your request",
      "link": null,
      "isRead": true,
      "createdAt": "2025-11-02T09:15:00Z"
    }
  ],
  "unreadCount": 3
}
```

### PATCH /api/notifications/:id/read

```
Request:
  PATCH http://localhost:5000/api/notifications/abc123/read
  Headers: { Authorization: "Bearer TOKEN" }

Response (200 OK):
{
  "notification": {
    "id": "abc123",
    "userId": "user123",
    "type": "MESSAGE",
    "title": "New message from John",
    "message": "Hello, how are you?",
    "isRead": true,  ← CHANGED TO TRUE
    "createdAt": "2025-11-02T10:30:00Z"
  }
}
```

### PATCH /api/notifications/all/read

```
Request:
  PATCH http://localhost:5000/api/notifications/all/read
  Headers: { Authorization: "Bearer TOKEN" }

Response (200 OK):
{
  "message": "All notifications marked as read"
}
```

---

## 🖼️ Navbar Layout

### Before

```
[🔔] [👤 Profile]
```

### Now

```
[🔔₃] [👤 Profile]
  ↓
  Clicking bell navigates to /notifications
  (no dropdown on click)
```

---

## 📲 Mobile Layout

```
┌─────────────────────────┐
│ Dashboard              │ ← Bell icon top right
│ [Home] [Messages] [🔔₃]│
├─────────────────────────┤
│                         │
│ Recent Messages         │ ← Responsive card
│ ┌───────────────────┐   │
│ │ John Doe   5m ago │   │
│ │ "Hey there!"      │   │
│ ├───────────────────┤   │
│ │ Sarah      1h ago │   │
│ │ "Thanks"          │   │
│ └───────────────────┘   │
│                         │
└─────────────────────────┘
```

---

## 🎨 Color Scheme

### Light Mode

- **Background:** White
- **Border:** Light gray
- **Text:** Dark gray
- **Unread badge:** Red
- **Unread highlight:** Light blue background

### Dark Mode

- **Background:** Dark gray
- **Border:** Medium gray
- **Text:** Light gray/white
- **Unread badge:** Red (same)
- **Unread highlight:** Medium blue background

---

## ⏱️ Time Formatting

```
Notification created: 2025-11-02 10:30:00
Current time: 2025-11-02 10:32:15

Display: "2 minutes ago"

Examples:
├─ 30 seconds ago    → "Just now"
├─ 5 minutes ago     → "5m ago"
├─ 1 hour ago        → "1h ago"
├─ 3 hours ago       → "3h ago"
├─ 1 day ago         → "1d ago"
└─ 5 days ago        → "Nov 2"
```

---

## 🎯 Test Scenario

### Scenario: User A Sends Message to User B

**Timeline:**

```
10:00 AM
  User A: Writes message "Hey, how's it going?"
          Clicks Send

↓ Backend processes (1 second)

10:00:01 AM
  Backend: Creates message in DB
           Creates notification for User B
           ├─ userId: User B's ID
           ├─ type: MESSAGE
           ├─ title: "New message from User A"
           ├─ message: "Hey, how's it going?"
           └─ isRead: false

↓ Frontend polls (every 2-5 seconds)

10:00:05 AM
  User B's app polls /api/notifications
           Sees new notification
           Shows bell: [🔔₁]

User B: Sees bell with "1"
        Clicks bell

↓ Navigation

10:00:06 AM
  User B: On /notifications page
          Sees notification in list
          Clicks "Mark Read"

↓ API call

10:00:07 AM
  Backend: Updates notification
           SET isRead = true

  Frontend: Notification no longer shows as unread
            Bell badge disappears: [🔔]
```

---

**All systems ready! Send a test message to see notifications in action.** ✅
