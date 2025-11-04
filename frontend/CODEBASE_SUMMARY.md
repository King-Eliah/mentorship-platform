# Mentorship Platform - Codebase Summary

## Overview

This is a comprehensive mentorship platform built with:

- **Backend**: Node.js + Express + TypeScript + PostgreSQL (Prisma ORM)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Real-time**: WebSocket messaging system with 2-second polling fallback

## Project Structure

```
mentorship/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/    # Business logic handlers
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Reusable business logic
│   │   ├── middleware/     # Express middleware (auth, logging)
│   │   ├── types/          # TypeScript interfaces
│   │   ├── websocket/      # WebSocket handlers
│   │   └── server.ts       # Express app setup
│   └── prisma/             # Database schema & migrations
├── frontend/                # React SPA application
│   ├── src/
│   │   ├── pages/          # Full-page components
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (auth, global state)
│   │   ├── services/       # API service calls
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript interfaces
│   └── public/             # Static assets
└── docs/                    # Documentation (this directory)
```

## Key Features

### ✅ Contact & Messaging System

- **Add contacts** - Send contact requests to other users in the system
- **Accept/Reject requests** - Manage incoming contact requests
- **Direct messaging** - Real-time 1-on-1 conversations
- **Contact display** - Added contacts show as "Added" button in People tab
- **Search by User ID** - Find and add any user in the system

### ✅ Real-Time Messaging

- 2-second polling for message updates
- Unread message counts per conversation
- Auto-mark messages as read
- Message persistence with read status tracking
- Conversation list with last message preview

### ✅ User Management

- Role-based access (ADMIN, MENTOR, MENTEE)
- User profiles with avatar upload
- Email verification
- Password reset with email token
- Session tracking and activity logs

### ✅ Group System

- Create and manage groups
- Group-based messaging permissions
- Mentor groups with mentor-mentee assignments

### ✅ Goals & Tracking

- Create, update, and track goals
- Goal status management
- Help request system for mentors to assist
- Goal visibility controls

### ✅ Resources & Sharing

- Upload and manage resources
- Share resources with specific users
- Download resource attachments

### ✅ Incident Reports

- Create and track incident reports
- Attach files to incidents
- Status tracking and notifications

## Build Status

✅ **Backend**: 0 TypeScript errors
✅ **Frontend**: 0 TypeScript errors
✅ **Both builds** pass successfully

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset

### Contacts & Requests

- `GET /api/contacts/browse` - Get browsable users (not in contacts)
- `GET /api/contacts/search/:userId` - Search user by ID
- `POST /api/contacts/request/send` - Send contact request
- `GET /api/contacts/request/pending` - Get pending requests
- `GET /api/contacts/request/sent` - Get sent requests
- `PATCH /api/contacts/request/:id/accept` - Accept request
- `PATCH /api/contacts/request/:id/reject` - Reject request
- `GET /api/contacts` - Get all contacts

### Messaging

- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create/get conversation
- `GET /api/conversations/:id` - Get conversation details
- `GET /api/direct-messages/:conversationId` - Get messages
- `POST /api/direct-messages/:conversationId` - Send message
- `PATCH /api/direct-messages/:id/read` - Mark as read
- `DELETE /api/direct-messages/:id` - Delete message

### Goals

- `GET /api/goals` - List user goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `PATCH /api/goals/:id/status` - Update status
- `PATCH /api/goals/:id/help` - Request/clear help

### Resources

- `GET /api/resources` - List resources
- `POST /api/resources` - Upload resource
- `DELETE /api/resources/:id` - Delete resource
- `POST /api/shared-resources` - Share resource
- `GET /api/shared-resources` - Get shared resources

## Environment Setup

### Backend

```bash
cd backend
npm install
# Create .env file with:
# DATABASE_URL=postgresql://user:password@localhost:5432/mentorship_db
# JWT_SECRET=your_secret_key
# EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS (for email functionality)
npm run dev   # Start development server
npm run build # Build for production
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # Start Vite dev server
npm run build # Build for production
npm run preview # Preview production build
```

## Database

The app uses PostgreSQL with Prisma ORM. Key models:

- **User** - Application users with roles and profiles
- **Contact** - Established relationships between users
- **ContactRequest** - Pending/accepted/rejected contact requests
- **Conversation** - Direct messaging between two users
- **DirectMessage** - Individual messages with read status
- **Goal** - User goals with status tracking
- **Resource** - Uploaded files and documents
- **SharedResource** - Resources shared between users
- **Group** - User groups with members
- **MentorGroup** - Mentor-mentee assignments
- **IncidentReport** - Incident tracking with attachments

## Key Documentation

- **CONTACT_REQUEST_IMPLEMENTATION.md** - Detailed contact system setup
- **MESSAGING_SYSTEM_GUIDE.md** - Messaging feature documentation
- **IMPLEMENTATION_PLAN.md** - Complete implementation roadmap
- **VISUAL_GUIDE_NEW_FEATURES.md** - UI/UX changes visualization

## Recent Improvements (Nov 2, 2025)

### Cleanup Phase

✅ Removed debug console.log statements
✅ Cleaned up error messages  
✅ Fixed Prisma client generation issues
✅ Consolidated 74 documentation files to essential guides only
✅ Verified all builds with 0 TypeScript errors

### Fixes Applied

✅ Fixed messaging validation for added contacts
✅ Added contact relationship check in validateCanMessage()
✅ Resolved Contact/ContactRequest model binding
✅ Cleaned up database migration conflicts

## Testing

Run tests with:

```bash
cd backend && npm test
cd frontend && npm test
```

## Deployment

### Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Production

```bash
# Build both applications
cd backend && npm run build
cd frontend && npm run build

# Deploy using your hosting platform
```

## Contributing

1. Keep TypeScript strict - no `any` types without good reason
2. Add console.error() for actual errors, not debug logging
3. Test all changes before committing
4. Update documentation when adding features

## Common Issues & Solutions

**Q: Prisma client not generating?**
A: Run `npm install` to regenerate node_modules

**Q: TypeScript errors about undefined properties?**
A: Rebuild TypeScript: `npx tsc --noEmit`

**Q: Can't message added contacts?**
A: This was fixed in conversationController.ts validateCanMessage() function

**Q: Database connection issues?**
A: Check DATABASE_URL in .env and ensure PostgreSQL is running

## Support

For detailed documentation, see the files in the root directory:

- `.archive/` - Archived documentation (historical)
- `QUICK_*.md` - Quick reference guides
- `FINAL_*.md` - Completion reports
- `IMPLEMENTATION_*.md` - Implementation details

---

**Last Updated**: November 2, 2025
**Status**: ✅ Production Ready
**Build Status**: All systems passing (0 errors)
