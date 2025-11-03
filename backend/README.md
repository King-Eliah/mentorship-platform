# Mentorship Platform - Backend API

Backend API for the Mentorship Platform built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io
- **Validation:** express-validator

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── websocket/      # Socket.io handlers
│   └── server.ts       # Entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── uploads/            # File uploads
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your configuration.

3. **Set up PostgreSQL database:**

   - Create a new database called `mentorship_db`
   - Update `DATABASE_URL` in `.env` with your credentials

4. **Run Prisma migrations:**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)
- `npm run db:seed` - Seed the database with sample data

## 🔌 API Endpoints (To be implemented)

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users (Admin)

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event

### Groups

- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Goals

- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Resources

- `GET /api/resources` - Get all resources
- `POST /api/resources` - Upload resource
- `DELETE /api/resources/:id` - Delete resource

### Analytics (Admin)

- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/users` - Get user analytics
- `GET /api/analytics/events` - Get event analytics

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/mentorship_db"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 🗄️ Database Schema

The database includes the following main models:

- **User** - User accounts with role-based access (Admin, Mentor, Mentee)
- **Profile** - Extended user profile information
- **MentorProfile** - Mentor-specific information
- **Event** - Events and workshops
- **Group** - Communities and groups
- **Goal** - User goals and objectives
- **Activity** - Learning activities
- **Message** - Messaging system
- **Notification** - User notifications
- **Resource** - Shared resources
- **Feedback** - User feedback
- **IncidentReport** - Incident reporting system
- **SessionLog** - Activity tracking

## 🔄 Next Steps

1. Install all dependencies
2. Set up PostgreSQL database
3. Configure environment variables
4. Run database migrations
5. Implement authentication routes
6. Implement remaining API endpoints
7. Add input validation
8. Add proper error handling
9. Set up WebSocket event handlers
10. Write tests

## 📚 Documentation

API documentation will be available at `/api/docs` (Swagger UI - to be implemented)

## 🤝 Contributing

(Add contributing guidelines)

## 📄 License

MIT
