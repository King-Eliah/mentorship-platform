# Testing Activities & Notifications

## How They Work

### Activities

Activities are automatically created when you perform actions in the app:

- **Goal actions**: Create/update/complete goals
- **Feedback**: Submit or receive feedback
- **Events**: Attend or create events
- **Resources**: Upload or access resources
- **Profile updates**: Update your profile
- **Group actions**: Join groups

### Notifications

Notifications are created when:

- Someone sends you a message
- You receive feedback
- An event is updated
- An incident report is submitted (for admins)
- Group invitations
- Mentor/mentee assignments

---

## Testing Activities & Notifications

### Option 1: Using the UI (Recommended)

#### Create Activities by:

1. **Goals Page** (`/goals`):

   - Click "Create Goal" → Fill form → Submit
   - This creates a `GOAL_CREATED` activity
   - Complete a goal → Creates `GOAL_COMPLETED` activity

2. **Events Page** (`/events`):

   - Create an event → `EVENT_CREATED` activity
   - RSVP to an event → `EVENT_ATTENDED` activity

3. **Resources Page** (`/resources`):

   - Upload a file → `RESOURCE_UPLOADED` activity
   - Share a resource (mentors) → `RESOURCE_SHARED` activity

4. **Feedback Page** (`/feedback`):

   - Submit feedback → `FEEDBACK_GIVEN` activity
   - Receive feedback → `FEEDBACK_RECEIVED` activity

5. **Profile Page** (`/profile`):
   - Update your profile → `PROFILE_UPDATED` activity

#### Create Notifications by:

1. **Messages** (`/messages`):

   - Send a message to another user
   - They get a notification

2. **Feedback**:

   - Submit feedback to someone
   - They get a notification

3. **Events**:
   - Update an event as admin/creator
   - Attendees get notifications

---

### Option 2: Using API Directly (Quick Testing)

You can create test activities and notifications using the backend API:

#### Create Activity via API:

```bash
# Login first to get token
POST http://localhost:5000/api/auth/login
{
  "email": "your@email.com",
  "password": "yourpassword"
}

# Then create activity
POST http://localhost:5000/api/activities
Authorization: Bearer YOUR_TOKEN
{
  "title": "Test Activity",
  "description": "Testing the activity system",
  "type": "GOAL_CREATED",
  "status": "COMPLETED"
}
```

#### Create Notification via Backend:

Notifications are typically created automatically by other actions, but you can trigger them by:

- Sending a message (creates notification for recipient)
- Creating an event (creates notification for group members)
- Submitting feedback (creates notification for recipient)

---

### Option 3: Quick Test Script (Copy to Browser Console)

Open your browser console on the app and run:

```javascript
// Login first, then run this:
const token = localStorage.getItem("token");

// Create a test activity
fetch("http://localhost:5000/api/activities", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "Test Activity",
    description: "This is a test activity to verify the system works",
    type: "GOAL_CREATED",
    status: "COMPLETED",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Activity created:", data);
    // Refresh the page to see it
    window.location.reload();
  })
  .catch((err) => console.error("❌ Error:", err));
```

---

## Expected Results

After creating activities or notifications:

1. **Go to** `/activities`
2. **You should see**:

   - Your activities in the "Recent Activities" tab
   - Notifications in the "Notifications" tab
   - Both combined in the "All Activity" tab

3. **Features to test**:
   - ✅ Search functionality
   - ✅ Sort by newest/oldest
   - ✅ Tab filtering (All/Activities/Notifications)
   - ✅ Mark notifications as read
   - ✅ Delete activities
   - ✅ View details

---

## Real Usage Flow (Recommended for Full Testing)

### Scenario 1: Goal Workflow

1. Go to `/goals`
2. Click "Create New Goal"
3. Fill in:
   - Title: "Learn React"
   - Description: "Master React fundamentals"
   - Target Date: (pick a future date)
4. Click "Create Goal"
5. Go to `/activities` → See `GOAL_CREATED` activity

### Scenario 2: Messaging Workflow (Creates Notification)

1. Go to `/messages`
2. Select a user from contacts
3. Send a message
4. **That user** gets a notification
5. They can see it in `/activities` under Notifications tab

### Scenario 3: Event Workflow

1. Go to `/events`
2. Create a new event (if you're a mentor/admin)
3. Go to `/activities` → See `EVENT_CREATED` activity
4. RSVP to an event → See `EVENT_ATTENDED` activity

### Scenario 4: Feedback Workflow

1. Go to `/feedback`
2. Submit feedback to someone
3. Go to `/activities` → See `FEEDBACK_GIVEN` activity
4. **The recipient** sees `FEEDBACK_RECEIVED` activity and notification

---

## Troubleshooting

### No activities showing?

1. Make sure you're logged in
2. Try creating a goal or updating your profile
3. Check browser console for errors
4. Verify backend is running (`http://localhost:5000`)

### Notifications not appearing?

1. Notifications are created by **other users' actions** toward you
2. Try having another user send you a message
3. Or submit feedback as another user
4. Or create a test user and message yourself

### Want to see sample data?

Run the backend seed script to create sample activities and notifications:

```bash
cd backend
npm run seed
```

---

## Activity Types Available

- `GOAL_CREATED`
- `GOAL_COMPLETED`
- `GOAL_UPDATED`
- `GOAL_MILESTONE_COMPLETED`
- `EVENT_ATTENDED`
- `EVENT_CREATED`
- `RESOURCE_ACCESSED`
- `RESOURCE_UPLOADED`
- `RESOURCE_SHARED`
- `FEEDBACK_RECEIVED`
- `FEEDBACK_GIVEN`
- `PROFILE_UPDATED`
- `GROUP_JOINED`
- `GROUP_CREATED`
- `ACHIEVEMENT_EARNED`
- `SKILL_ADDED`
- `SKILL_LEVEL_UPDATED`
- `LEARNING_ACTIVITY_COMPLETED`
- `MENTORING_SESSION_COMPLETED`

Each action you take in the app creates the corresponding activity automatically! 🎉
