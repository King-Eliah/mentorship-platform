# MentorConnect Platform

A modern, full-featured mentorship platform built with React, TypeScript, and Tailwind CSS.

---

## 📑 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [User Roles & Access](#-user-roles--access)
- [Group Management System](#-group-management-system)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Testing](#-testing)
- [Environment Setup](#-environment-setup)

---

## 🚀 Features

### Core Functionality

- **User Management** - Role-based access (Admin, Mentor, Mentee)
- **Dashboard** - Personalized dashboards for all user roles with analytics
- **Group Management** - Admin creates and manages mentoring groups
- **Events** - Create, manage, and join mentorship events
- **Goals** - Set and track personal and professional goals
- **Resources** - Upload, download, and manage learning resources
- **Messaging** - Real-time communication between users
- **Notifications** - Real-time notification system
- **Profile** - User profile management with skills and bio
- **Feedback Center** - Submit and manage feedback with admin responses
- **Incident Reporting** - Report and track safety/conduct incidents

### Advanced Features

- **File Upload/Download** - Real implementation using browser APIs
- **Analytics** - Comprehensive charts and statistics
- **Search & Filters** - Global search and advanced filtering
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Mobile-first, fully responsive UI
- **Toast Notifications** - User-friendly feedback system
- **Modal System** - Professional confirmation and detail modals
- **Skeleton Loading** - Smooth loading states
- **Admin Communication** - Reply to feedback and resolve incidents

---

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd mentorship-platform-main
```

### 2. Install dependencies

```bash
npm install
```

This will install all required packages including:

- React 18.x
- TypeScript 5.x
- Vite 7.x
- Tailwind CSS
- React Query (@tanstack/react-query)
- Lucide React (icons)
- React Hot Toast (notifications)
- React Router DOM
- Chart.js & React-Chartjs-2

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 👥 User Roles & Access

### Test Accounts

The platform comes with pre-configured test accounts:

| Role       | Email              | Features                                              |
| ---------- | ------------------ | ----------------------------------------------------- |
| **Admin**  | admin@example.com  | Full system access, group management, user management |
| **Mentor** | mentor@example.com | View assigned mentees, track progress, messaging      |
| **Mentee** | mentee@example.com | View group, mentor, peers, set goals, join events     |

> **Note:** Password field can be left empty or use any value (mock authentication)

---

## 🎯 Group Management System

### Overview

The Group Management System allows administrators to create and manage mentoring groups with automatic or manual mentee assignment.

### Admin Features (Access: My Mentees)

#### Manual Group Creation

1. Click "Create Manual Group"
2. Enter group name and description
3. Select one mentor
4. Select multiple mentees
5. Set max members (optional)
6. Click "Create Group"

#### Random Group Creation

1. Click "Create Random Groups"
2. Set mentees per mentor (e.g., 3)
3. Choose "Use all mentors" or select specific mentors
4. Choose "Use all mentees" or select specific mentees
5. Click "Create Random Groups"
6. System automatically distributes mentees evenly

#### Group Management

- View all groups in dashboard
- See statistics (total groups, available mentors/mentees, active groups)
- View group details (members, mentor, description)
- Delete groups with confirmation

### Mentor Features (Access: My Mentees)

- Grid view of all assigned mentees
- Mentee statistics:
  - Active/completed goals count
  - Events joined/upcoming
  - Resources accessed
- Click "View Details" for full goal list
- Message any mentee directly
- Track progress metrics

### Mentee Features (Access: My Group)

- View assigned mentor (profile, skills, bio)
- See all peer mentees in group
- Search members by name, email, or ID
- Message mentor and peers
- View group information and status
- Quick actions and navigation

---

## 🛠️ Tech Stack

### Frontend Framework

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 7** - Build tool and dev server

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom CSS** - Additional styling

### State Management

- **React Context API** - Global state (Auth, Theme, Loading)
- **@tanstack/react-query** - Server state management
- **React Hooks** - Component state

### Routing

- **React Router DOM v6** - Client-side routing

### UI Components

- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Chart.js** - Data visualization
- **React-Chartjs-2** - React wrapper for Chart.js

### Testing

- **Vitest** - Unit testing framework
- **@testing-library/react** - Component testing
- **jsdom** - DOM simulation

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite Plugin React** - React fast refresh

---

## 📁 Project Structure

```
mentorship-platform-main/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   │   └── GroupManagement.tsx
│   │   ├── auth/               # Authentication components
│   │   ├── chat/               # Chat/messaging components
│   │   ├── dashboardNew/       # Dashboard widgets
│   │   ├── events/             # Event components
│   │   ├── groups/             # Group components
│   │   ├── layout/             # Layout components (Sidebar, Header)
│   │   ├── notifications/      # Notification components
│   │   ├── profile/            # Profile components
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── ThemeContext.tsx    # Dark/Light mode
│   │   └── LoadingContext.tsx  # Loading state
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useGroups.ts
│   │   ├── useEvents.ts
│   │   └── useNotifications.ts
│   │
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── MyMentees.tsx       # Admin & Mentor view
│   │   ├── MyGroup.tsx         # Mentee view
│   │   ├── GoalsPage.tsx       # Goals management
│   │   ├── EventsPage.tsx      # Events management
│   │   └── ...
│   │
│   ├── services/               # API service layer
│   │   ├── api.ts              # API configuration
│   │   ├── authService.ts      # Auth API calls
│   │   ├── groupService.ts     # Group API calls
│   │   ├── eventService.ts     # Event API calls
│   │   ├── frontendService.ts  # Mock backend service
│   │   └── ...
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Main types
│   │   ├── goals.ts            # Goal types
│   │   └── ...
│   │
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── .gitignore
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML template
├── package.json                # Dependencies
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── vitest.config.ts            # Vitest configuration
```

---

## 📜 Available Scripts

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate test coverage
npm run test:coverage
```

---

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Structure

Tests are located in `src/test/` directory:

```
src/test/
├── analytics/          # Analytics tests
├── auth/              # Authentication tests
├── fileUpload/        # File upload tests
├── messaging/         # Messaging tests
├── resources/         # Resource tests
├── setup.ts           # Test setup
└── test-utils.tsx     # Testing utilities
```

---

## 🌍 Environment Setup

### Mock Data Mode (Default)

The application uses `frontendService.ts` as a mock backend with in-memory data storage. This allows full functionality without a backend server.

**Pre-configured data:**

- 7 users (1 admin, 2 mentors, 4 mentees)
- 1 sample group
- Sample events, goals, and resources

### Backend Integration (Future)

To connect to a real backend:

1. Update service files in `src/services/` to call real API endpoints
2. Configure API base URL in `src/services/api.ts`
3. Remove mock data from `frontendService.ts`
4. Implement authentication token handling

**Required API Endpoints:**

```
GET    /api/groups              - Get all groups (admin)
GET    /api/groups/my           - Get user's groups
GET    /api/groups/:id          - Get specific group
POST   /api/groups              - Create group
POST   /api/groups/create-random - Create random groups
PUT    /api/groups/:id          - Update group
DELETE /api/groups/:id          - Delete group
GET    /api/groups/available-users - Get available users
```

---

## 🔑 Key Features Details

### Authentication

- Mock authentication system
- Role-based access control
- Protected routes
- Session persistence

### Dark Mode

- System-wide dark mode toggle
- Persistent theme selection
- Tailwind dark: classes
- Smooth transitions

### Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Flexible layouts
- Touch-friendly UI

### File Management

- Upload files (documents, images)
- Download resources
- File type validation
- Size limits
- Preview support

### Real-time Features

- Toast notifications
- Live data updates
- WebSocket support (ready)
- Optimistic UI updates

---

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          /* your colors */
        },
        secondary: {
          /* your colors */
        },
      },
    },
  },
};
```

### Add New Routes

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`:

```typescript
<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link in `src/components/layout/Sidebar.tsx`

### Add New Service

1. Create service file in `src/services/`
2. Define API methods
3. Add to `src/services/index.ts` exports
4. Use in components with React Query

---

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy:

```bash
# Kill process on port (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Or use different port
npm run dev -- --port 3000
```

### Build Errors

```bash
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

### Type Errors

```bash
# Check TypeScript errors
npx tsc --noEmit
```

---

## 📝 Navigation & User Flow

### Admin User Flow

```
Login (admin@example.com)
  → Dashboard
  → Sidebar: My Mentees
  → Group Management Interface
    ├─ Create Manual Groups
    ├─ Create Random Groups
    ├─ View All Groups
    └─ Delete Groups
```

### Mentor User Flow

```
Login (mentor@example.com)
  → Dashboard
  → Sidebar: My Mentees
  → Mentee List View
    ├─ View Mentee Stats
    ├─ View Details
    └─ Message Mentees
```

### Mentee User Flow

```
Login (mentee@example.com)
  → Dashboard
  → Sidebar: My Group
  → Group View
    ├─ View Mentor
    ├─ View Peer Mentees
    ├─ Search Members
    └─ Message Group Members
```

---

## 🚀 Quick Start Guide

### For First-Time Users

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Login with test account:**

   - Admin: admin@example.com
   - Mentor: mentor@example.com
   - Mentee: mentee@example.com

4. **Explore features:**
   - **Admin**: Go to "My Mentees" to manage groups
   - **Mentor**: Go to "My Mentees" to see mentee list
   - **Mentee**: Go to "My Group" to see your group

---

## 📊 Project Statistics

- **Components**: 50+ React components
- **Pages**: 15+ page routes
- **Services**: 8 API service layers
- **Custom Hooks**: 10+ React hooks
- **Context Providers**: 6 global contexts
- **Type Definitions**: Comprehensive TypeScript types
- **Test Coverage**: Unit tests included

---

## 🔧 Configuration Files

| File                 | Purpose                     |
| -------------------- | --------------------------- |
| `vite.config.ts`     | Vite build configuration    |
| `tsconfig.json`      | TypeScript compiler options |
| `tailwind.config.js` | Tailwind CSS customization  |
| `eslint.config.js`   | ESLint rules                |
| `vitest.config.ts`   | Vitest test configuration   |
| `postcss.config.js`  | PostCSS plugins             |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- React Team for React 18
- Tailwind Labs for Tailwind CSS
- TanStack for React Query
- Lucide for icon library
- All open-source contributors

---

**Built with ❤️ by the MentorConnect Team**
