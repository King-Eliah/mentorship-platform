# MentorConnect - Mentorship Platform

A comprehensive full-stack mentorship platform connecting mentors and mentees with real-time communication, event management, goal tracking, and administrative tools.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Recent Updates](#-recent-updates)
- [Environment Setup](#-environment-setup)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Features

### For All Users

- ✅ **User Authentication** - Secure login/signup with JWT tokens and password reset
- ✅ **Role-Based Access** - Three roles: Admin, Mentor, Mentee
- ✅ **Personalized Dashboard** - Role-specific dashboards with analytics and insights
- ✅ **Profile Management** - Customizable profiles with skills, bio, and experience
- ✅ **Real-Time Notifications** - Instant updates with bell icon, dropdown, and detailed views
- ✅ **Dark/Light Mode** - Full theme support with persistent preferences
- ✅ **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ✅ **Real-Time Messaging** - Direct messaging with online status and typing indicators
- ✅ **Contact Management** - Add contacts, send requests, accept/decline invitations

### For Mentees

- 🎓 **Find Mentors** - Browse and connect with experienced mentors
- 📅 **Join Events** - Participate in workshops, webinars, and networking sessions
- 🎯 **Goal Tracking** - Set and track personal/professional development goals with status updates
- 📚 **Learning Resources** - Access shared documents, videos, and links
- 💬 **Real-Time Messaging** - Communicate with mentors and peers
- 📝 **Feedback System** - Provide feedback and receive responses
- 🆘 **Incident Reporting** - Report issues with priority levels and file attachments
- ❓ **Request Help** - Flag goals as needing assistance

### For Mentors

- 👥 **Manage Mentees** - View and interact with assigned mentees
- 🎪 **Create Events** - Host workshops, mentoring sessions, and webinars
- 📤 **Share Resources** - Upload documents, videos, and useful links with descriptions
- 📊 **Track Progress** - Monitor mentee goals and engagement
- 👨‍👩‍👧‍👦 **Group Management** - Manage mentoring groups
- 💡 **Respond to Feedback** - Address mentee concerns and suggestions

### For Admins

- 👤 **User Management** - Full CRUD operations with pre-filled edit forms
  - View all users in card or table view
  - Edit user details (first name, last name, email, role, status)
  - Delete users with confirmation dialogs
  - Bulk actions (activate, deactivate, delete)
- 📊 **Analytics Dashboard** - Comprehensive insights with charts and statistics
- 📅 **Event Oversight** - Monitor and manage all platform events
- 👨‍👩‍👧‍👦 **Group Administration** - Create random or manual mentorship groups
- 📝 **Feedback Management** - Review and respond to user feedback
- 🚨 **Incident Handling** - Manage incident reports with resolution tracking
- 📜 **Session Logs** - Monitor user activity and login history
- 🔔 **System Notifications** - Send announcements to all users
- 🛡️ **Admin Actions** - Disable/enable users, change roles (all 3 options), with confirmation modals

---

## 🏗️ Tech Stack

### Frontend

| Technology           | Version | Purpose                 |
| -------------------- | ------- | ----------------------- |
| **React**            | 18.3.1  | UI Framework            |
| **TypeScript**       | 5.6.2   | Type Safety             |
| **Vite**             | 7.1.5   | Build Tool              |
| **Tailwind CSS**     | 3.4.1   | Styling                 |
| **React Query**      | 5.0+    | State Management        |
| **React Router**     | 6.28.0  | Routing                 |
| **Socket.io Client** | 4.8.1   | Real-time Communication |
| **Recharts**         | 2.13.3  | Data Visualization      |
| **Lucide React**     | Latest  | Icons                   |
| **React Hot Toast**  | 2.4.1   | Notifications           |
| **Axios**            | 1.7.7   | HTTP Client             |

### Backend

| Technology            | Version     | Purpose          |
| --------------------- | ----------- | ---------------- |
| **Node.js**           | 18+         | Runtime          |
| **Express**           | 4.21.1      | Web Framework    |
| **TypeScript**        | 5.6.3       | Type Safety      |
| **PostgreSQL**        | 14+         | Database         |
| **Prisma**            | 6.0.1       | ORM              |
| **Socket.io**         | 4.8.1       | WebSockets       |
| **JWT**               | 9.0.2       | Authentication   |
| **bcrypt**            | 5.1.1       | Password Hashing |
| **Multer**            | 1.4.5-lts.1 | File Upload      |
| **express-validator** | 7.2.0       | Input Validation |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 14.0.0

# Optional (recommended)
Git
VS Code or your preferred IDE
```

### 1. Clone the Repository

```bash
git clone https://github.com/King-Eliah/mentorship-platform.git
cd mentorship-platform
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL="postgresql://user:password@localhost:5432/mentorship"
# JWT_SECRET="your-secure-secret-key-change-in-production"
# PORT=5000

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data (optional)
npx prisma db seed

# Start the backend development server
npm run dev
```

The backend will start on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create environment file (optional, uses defaults if not present)
cp .env.example .env

# Edit .env if needed
# VITE_API_URL=http://localhost:5000
# VITE_WS_URL=ws://localhost:5000

# Start the frontend development server
npm run dev
```

The frontend will start on **http://localhost:5173** (or 5174 if 5173 is in use)

### 4. Access the Application

Open your browser and navigate to **http://localhost:5173**

#### Default Login Credentials

**Admin Account:**

- Email: `admin@mentorconnect.com`
- Password: `admin123`

**Mentor Account:**

- Email: `mentor@mentorconnect.com`
- Password: `mentor123`

**Mentee Account:**

- Email: `mentee@mentorconnect.com`
- Password: `mentee123`

---

## 📦 Project Structure

```
mentorship/
├── frontend/                      # React TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── admin/            # Admin-specific components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── messaging/        # Messaging and chat components
│   │   │   ├── dashboardNew/     # Dashboard widgets
│   │   │   ├── events/           # Event management components
│   │   │   ├── groups/           # Group components
│   │   │   ├── layout/           # Layout (Header, Sidebar, Footer)
│   │   │   ├── notifications/    # Notification components
│   │   │   └── ui/               # Base UI (Button, Modal, Card, etc.)
│   │   ├── context/              # React Context providers
│   │   │   ├── AuthContext.tsx   # Authentication state
│   │   │   └── ThemeContext.tsx  # Theme management
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts        # Authentication hook
│   │   │   ├── useNotifications.ts # Notifications hook
│   │   │   └── useWebSocket.ts   # WebSocket hook
│   │   ├── pages/                # Page components
│   │   │   ├── ActivityAndNotificationsPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EventsPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── MessagesPage.tsx
│   │   │   ├── UsersManagement.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── ...
│   │   ├── services/             # API service layer
│   │   │   ├── api.ts            # Axios instance
│   │   │   ├── authService.ts    # Auth API calls
│   │   │   ├── userService.ts    # User API calls
│   │   │   └── ...
│   │   ├── types/                # TypeScript definitions
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   ├── public/                   # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                       # Express TypeScript Backend
│   ├── src/
│   │   ├── config/               # Configuration
│   │   │   └── database.ts       # Database connection
│   │   ├── controllers/          # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── eventController.ts
│   │   │   ├── goalController.ts
│   │   │   ├── messageController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── feedbackController.ts
│   │   │   ├── incidentReportController.ts
│   │   │   └── ...
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── auth.ts           # JWT authentication
│   │   │   └── errorHandler.ts   # Error handling
│   │   ├── routes/               # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── ...
│   │   ├── services/             # Business logic
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # Utility functions
│   │   ├── websocket/            # Socket.io handlers
│   │   │   └── socketHandlers.ts
│   │   └── server.ts             # Application entry
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── seed.ts               # Database seeding
│   │   └── migrations/           # Database migrations
│   ├── uploads/                  # User-uploaded files
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
└── README.md                     # This file
```

---

## 📚 API Documentation

### Authentication

```http
POST   /auth/register              # Register new user
POST   /auth/login                 # Login user
POST   /auth/logout                # Logout user
GET    /auth/me                    # Get current user
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset password with token
```

### Users

```http
GET    /users                      # Get all users (Admin)
GET    /users/search               # Search users (authenticated)
GET    /users/:id                  # Get user by ID
PUT    /users/:id                  # Update user profile
PUT    /users/:id/password         # Change password
DELETE /users/:id                  # Delete user (Admin)
GET    /users/mentees              # Get user's mentees (Mentor)
GET    /users/mentor               # Get user's mentor (Mentee)
```

### Admin User Management

```http
GET    /admin/users                # Get all users with filters
POST   /admin/users                # Create user manually
PUT    /admin/users/:id/status     # Update user status
GET    /activities/user/:userId    # Get user activities
```

### Events

```http
GET    /events                     # Get all events (with filters)
POST   /events                     # Create event
GET    /events/:id                 # Get event by ID
PUT    /events/:id                 # Update event
DELETE /events/:id                 # Delete event
POST   /events/:id/join            # Join event
POST   /events/:id/leave           # Leave event
GET    /events/:id/participants    # Get event participants
```

### Goals

```http
GET    /goals                      # Get user goals
POST   /goals                      # Create goal
GET    /goals/:id                  # Get goal by ID
PUT    /goals/:id                  # Update goal
DELETE /goals/:id                  # Delete goal
PUT    /goals/:id/status           # Update goal status
```

### Resources

```http
GET    /resources                  # Get all resources
POST   /resources                  # Create/upload resource
GET    /resources/:id              # Get resource by ID
DELETE /resources/:id              # Delete resource
POST   /resources/:id/download     # Track download
GET    /resources/shared           # Get shared resources
```

### Messages

```http
GET    /messages/conversations     # Get all conversations
GET    /messages/:userId           # Get messages with specific user
POST   /messages                   # Send message
DELETE /messages/:id               # Delete message
PUT    /messages/:id/read          # Mark message as read
```

### Notifications

```http
GET    /notifications              # Get user notifications
PUT    /notifications/:id/read     # Mark notification as read
PUT    /notifications/read-all     # Mark all as read
DELETE /notifications/:id          # Delete notification
POST   /notifications              # Create notification (Admin)
```

### Feedback

```http
GET    /feedback                   # Get all feedback (Admin)
POST   /feedback                   # Submit feedback
GET    /feedback/:id               # Get feedback by ID
PUT    /feedback/:id/respond       # Respond to feedback (Admin)
DELETE /feedback/:id               # Delete feedback
```

### Incident Reports

```http
GET    /incidents                  # Get all incidents (Admin)
POST   /incidents                  # Submit incident report
GET    /incidents/:id              # Get incident by ID
PUT    /incidents/:id/resolve      # Resolve incident (Admin)
DELETE /incidents/:id              # Delete incident (Admin)
```

### Groups

```http
GET    /groups                     # Get all groups
POST   /groups                     # Create group (Admin)
POST   /groups/random              # Create random groups (Admin)
GET    /groups/:id                 # Get group by ID
PUT    /groups/:id                 # Update group (Admin)
DELETE /groups/:id                 # Delete group (Admin)
GET    /groups/:id/members         # Get group members
```

### Activities

```http
GET    /activities                 # Get recent activities
GET    /activities/user/:userId    # Get user-specific activities
POST   /activities                 # Log activity
```

---

## 🆕 Recent Updates

### Version 2.0.0 - November 2025

#### ✨ New Features

1. **Enhanced User Management**

   - ✅ Edit user modal now pre-fills all fields with current user data
   - ✅ Separate update flow vs create flow
   - ✅ Toast notifications for successful updates
   - ✅ Form validation for required fields
   - ✅ Auto-refresh user list after updates

2. **Improved Admin Actions**

   - ✅ Shortened button labels ("Delete" instead of "Remove User")
   - ✅ "Change Role" modal shows all 3 options (Mentor, Mentee, Admin)
   - ✅ Current role is disabled and marked in the selector
   - ✅ Confirmation modals for all admin actions (disable, role change, delete)
   - ✅ Appropriate modal variants (danger/warning/info)
   - ✅ Equal-width responsive buttons on mobile

3. **Enhanced Notification System**

   - ✅ Bell icon with unread count badge
   - ✅ Dropdown notification list with quick actions
   - ✅ Full notification detail modal
   - ✅ Bulk selection mode with checkboxes
   - ✅ Delete selected notifications
   - ✅ Mark as read/unread functionality
   - ✅ "Mark All as Read" with loading indicator
   - ✅ Auto-refresh after actions

4. **Messaging Improvements**

   - ✅ Contact request system
   - ✅ Real-time message delivery
   - ✅ Online status indicators
   - ✅ Typing indicators
   - ✅ Message dropdown in header
   - ✅ Unread message count

5. **Incident Reporting**

   - ✅ Priority levels (Low, Medium, High, Critical)
   - ✅ File attachment support
   - ✅ Admin notifications for new incidents (SYSTEM type)
   - ✅ Resolution tracking
   - ✅ Status updates

6. **Goal Management**

   - ✅ "Need Help" flag for goals
   - ✅ Status tracking (Not Started, In Progress, Completed, On Hold)
   - ✅ Progress visualization
   - ✅ Mentor visibility of mentee goals

7. **Resource Sharing**
   - ✅ Upload documents, videos, and links
   - ✅ Download tracking
   - ✅ File type validation
   - ✅ Preview support for images and PDFs
   - ✅ Shared resources visibility for mentees

#### 🐛 Bug Fixes

- Fixed notification infinite loading loop
- Fixed badge positioning in notification bell
- Resolved incident attachment upload issues
- Fixed resource preview for large files
- Corrected mobile responsiveness on login/signup
- Fixed light mode button styling issues
- Resolved server restart notification type issue
- Fixed mentees not seeing shared resources

#### 🎨 UI/UX Improvements

- Mobile-optimized layouts across all pages
- Dark mode consistency
- Improved form validation feedback
- Better loading states
- Enhanced error messages
- Cleaner modal designs
- Responsive tables with horizontal scroll
- Card/table view toggle for user management

---

## 🔧 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mentorship"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# CORS (optional)
FRONTEND_URL="http://localhost:5173"

# File Upload (optional)
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR="uploads"
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# Optional
VITE_APP_NAME="MentorConnect"
VITE_APP_VERSION="2.0.0"
```

### Database Setup

1. **Install PostgreSQL** (if not already installed)

```bash
# macOS
brew install postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14

# Windows
# Download from https://www.postgresql.org/download/windows/
```

2. **Create Database**

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mentorship;

# Create user (optional)
CREATE USER mentorship_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mentorship TO mentorship_user;

# Exit
\q
```

3. **Run Migrations**

```bash
cd backend
npx prisma migrate dev
```

4. **Seed Database** (optional)

```bash
npx prisma db seed
```

---

## 🚢 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. **Build the application**

```bash
cd backend
npm run build
```

2. **Set environment variables** in your hosting platform

3. **Run database migrations**

```bash
npx prisma migrate deploy
```

4. **Start the server**

```bash
npm start
```

### Frontend Deployment (Vercel/Netlify)

1. **Build for production**

```bash
cd frontend
npm run build
```

2. **Configure build settings**

```yaml
# Vercel
Build Command: npm run build
Output Directory: dist
Install Command: npm install

# Netlify
Build Command: npm run build
Publish Directory: dist
```

3. **Set environment variables**

```env
VITE_API_URL=https://your-backend-api.com
VITE_WS_URL=wss://your-backend-api.com
```

### Recommended Hosting Providers

| Service          | Backend       | Frontend         | Database      |
| ---------------- | ------------- | ---------------- | ------------- |
| **Railway**      | ✅            | ✅               | ✅ PostgreSQL |
| **Render**       | ✅            | ✅               | ✅ PostgreSQL |
| **Vercel**       | ⚠️ Serverless | ✅               | ❌            |
| **Netlify**      | ⚠️ Functions  | ✅               | ❌            |
| **Heroku**       | ✅            | ✅               | ✅ PostgreSQL |
| **AWS**          | ✅ EC2/ECS    | ✅ S3+CloudFront | ✅ RDS        |
| **DigitalOcean** | ✅ Droplet    | ✅ App Platform  | ✅ Managed DB |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Run in watch mode
npm run test:coverage       # Generate coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                    # Run all tests
npm run test:ui             # Run with Vitest UI
npm run test:coverage       # Generate coverage report
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Password reset flow
- [ ] Profile updates
- [ ] Event creation and joining
- [ ] Goal CRUD operations
- [ ] Resource upload and download
- [ ] Real-time messaging
- [ ] Notification delivery
- [ ] Incident report submission
- [ ] Admin user management with edit
- [ ] Admin role changes (all 3 options)
- [ ] Dark/light mode toggle
- [ ] Mobile responsiveness
- [ ] WebSocket connection stability

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**

```bash
git clone https://github.com/your-username/mentorship-platform.git
cd mentorship-platform
```

2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**

- Follow TypeScript best practices
- Write clean, readable code
- Add comments where necessary
- Update tests if applicable

4. **Commit your changes**

```bash
git commit -m "Add amazing feature"
```

5. **Push to your fork**

```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**

- Provide a clear description
- Reference any related issues
- Include screenshots for UI changes

### Code Style Guidelines

- **TypeScript**: Use strict mode, avoid `any` types
- **React**: Use functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint configuration provided

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

- **King-Eliah** - Lead Developer & Maintainer
- **Contributors** - See [GitHub Contributors](https://github.com/King-Eliah/mentorship-platform/graphs/contributors)

---

## 🙏 Acknowledgments

- React and TypeScript communities
- Prisma ORM team
- Tailwind CSS creators
- Socket.io maintainers
- All open-source contributors

---

## 📞 Support

### Get Help

- 📧 Email: support@mentorconnect.com
- 💬 Discord: [Join our server](https://discord.gg/mentorconnect)
- 📖 Documentation: [Full docs](https://docs.mentorconnect.com)
- 🐛 Issues: [GitHub Issues](https://github.com/King-Eliah/mentorship-platform/issues)

### Frequently Asked Questions

**Q: Can I use this for my organization?**
A: Yes! This is open-source and free to use.

**Q: How do I reset the admin password?**
A: Run `npx prisma studio` and update the password hash manually, or use the forgot password feature.

**Q: Can I deploy this to Vercel?**
A: Yes for the frontend. The backend needs a traditional Node.js host like Railway or Render.

**Q: Is there a mobile app?**
A: Not yet, but it's on the roadmap! The web app is fully responsive though.

---

## 🗺️ Roadmap

### Q1 2026

- [ ] Mobile app (React Native)
- [ ] Video calling integration (WebRTC)
- [ ] Calendar integration (Google Calendar, Outlook)

### Q2 2026

- [ ] AI-powered mentor matching
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)

### Q3 2026

- [ ] Advanced search with filters
- [ ] Email notifications
- [ ] SMS notifications (optional)

### Q4 2026

- [ ] Payment integration (for premium features)
- [ ] Certificate generation
- [ ] Public API for integrations

### Future Ideas

- Integration with learning platforms (Udemy, Coursera)
- Gamification (badges, points, leaderboards)
- Community forums
- Mentorship marketplace
- White-label solution for organizations

---

## 📊 Project Stats

- **Total Files**: 200+
- **Lines of Code**: 50,000+
- **Components**: 100+
- **API Endpoints**: 60+
- **Database Tables**: 15+
- **Languages**: TypeScript, JavaScript
- **Frameworks**: React, Express, Prisma
- **Last Updated**: November 2025

---

## 🔗 Links

- **Repository**: [github.com/King-Eliah/mentorship-platform](https://github.com/King-Eliah/mentorship-platform)
- **Live Demo**: Coming soon
- **Documentation**: Coming soon
- **Changelog**: See commit history

---

**Built with ❤️ by the MentorConnect Team**

_Empowering mentorship, one connection at a time._
