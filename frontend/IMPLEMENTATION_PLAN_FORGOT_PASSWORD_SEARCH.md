# Implementation Plan: Forgot Password & Global Search

## 1. FORGOT PASSWORD IMPLEMENTATION

### Current State

- Frontend has UI but it's simulated (no backend calls)
- Backend has NO forgot password endpoint
- No email service configured

### What We Need to Implement

#### A. Backend: Password Reset Service

1. **New endpoint: POST /api/auth/forgot-password**

   - Takes email as input
   - Finds user by email
   - Generates reset token (valid for 24 hours)
   - Stores token in database (hashed)
   - Sends reset email with link to frontend

2. **New endpoint: POST /api/auth/reset-password**

   - Takes token and new password
   - Validates token is not expired
   - Updates user password
   - Invalidates token

3. **Database Schema Updates**
   - Add `resetToken: String?` to User model
   - Add `resetTokenExpiresAt: DateTime?` to User model

#### B. Frontend: Forgot Password Flow

1. **Forgot Password Page**

   - User enters email
   - Calls backend to send reset email
   - Shows confirmation message
   - Provides link to check email

2. **Reset Password Page** (NEW)
   - User gets token from email link
   - Page at `/reset-password/:token`
   - Shows form to enter new password
   - Validates password strength
   - Calls backend to reset password
   - Redirects to login on success

---

## 2. GLOBAL SEARCH IMPLEMENTATION

### Current State

- Component exists with mock data
- Searches across mock users, events, messages
- No backend API integration

### What We Need to Implement

#### A. Backend: Search Endpoints

1. **GET /api/search**
   - Takes query parameter: `?q=searchterm`
   - Returns filtered results: users, events, messages
   - Limits results to improve performance
   - Respects user permissions (don't expose private info)

#### B. Frontend: Replace Mock Data

1. **Update GlobalSearch component**
   - Replace mock data with API calls
   - Call backend search endpoint
   - Display real results
   - Handle loading/error states

---

## IMPLEMENTATION ORDER

### Phase 1: Forgot Password Backend

- [ ] Add database fields (resetToken, resetTokenExpiresAt)
- [ ] Create forgot-password endpoint
- [ ] Create reset-password endpoint
- [ ] Add email service (nodemailer or similar)

### Phase 2: Forgot Password Frontend

- [ ] Update ForgotPassword.tsx to call backend
- [ ] Create ResetPassword.tsx page for token verification
- [ ] Add route for /reset-password/:token
- [ ] Add email verification UI

### Phase 3: Global Search Backend

- [ ] Create search endpoint (/api/search)
- [ ] Implement search logic for users, events, messages
- [ ] Add pagination and result limiting

### Phase 4: Global Search Frontend

- [ ] Replace mock data with API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test search functionality

---

## DETAILED SPECIFICATIONS

### Forgot Password User Flow

```
1. User on login page clicks "Forgot Password"
   ↓
2. Taken to /forgot-password page
   ↓
3. Enters email address
   ↓
4. Backend receives request:
   - Finds user by email
   - Generates random reset token
   - Sets token expiry to 24 hours
   - Sends email with reset link:
     http://localhost:5173/reset-password/{token}
   - Returns success message
   ↓
5. Frontend shows: "Check your email for reset link"
   ↓
6. User clicks link in email
   ↓
7. Redirected to /reset-password/:token
   ↓
8. Backend validates token:
   - Token exists?
   - Token not expired?
   - User still exists?
   ↓
9. If valid, show password reset form:
   - New password field (must be strong)
   - Confirm password field
   - "Reset Password" button
   ↓
10. User enters new password
    ↓
11. Backend validates:
    - Passwords match?
    - Password strong enough?
    - Token still valid?
    ↓
12. Backend updates password:
    - Hash new password
    - Save to user
    - Clear resetToken and resetTokenExpiresAt
    ↓
13. Frontend shows success message
    ↓
14. Redirect to login page after 2 seconds
```

### Global Search User Flow

```
1. User types in search box in navbar
   ↓
2. Frontend debounces input (300ms)
   ↓
3. Calls /api/search?q={query}
   ↓
4. Backend searches:
   - Users (by name, email)
   - Events (by title, location)
   - Messages (by content, sender)
   ↓
5. Returns results grouped by type (max 3 each)
   ↓
6. Frontend displays in dropdown:
   - Users section with user cards
   - Events section with event cards
   - Messages section with message previews
   ↓
7. User clicks on result
   ↓
8. Navigates to relevant page:
   - User → /users/{userId}
   - Event → /events with event highlighted
   - Message → /messages with conversation open
   ↓
9. Search clears, dropdown closes
```

---

## DATABASE SCHEMA CHANGES

### Add to User model:

```prisma
resetToken      String?         // Password reset token
resetTokenExpiresAt DateTime?   // When token expires
```

### Migration command:

```bash
npx prisma migrate dev --name add_password_reset_fields
```

---

## API ENDPOINTS

### Password Reset

- `POST /api/auth/forgot-password`

  - Body: `{ email: string }`
  - Returns: `{ message: string }`

- `POST /api/auth/reset-password`
  - Body: `{ token: string, newPassword: string }`
  - Returns: `{ message: string }`

### Search

- `GET /api/search?q={query}`
  - Query params: `q` (search term), `limit` (optional)
  - Returns: `{ users: [], events: [], messages: [] }`

---

## COMPONENTS TO CREATE/UPDATE

### New Components

- `frontend/src/pages/ResetPassword.tsx` - Password reset page

### Update Components

- `frontend/src/pages/ForgotPassword.tsx` - Connect to backend
- `frontend/src/components/ui/GlobalSearch.tsx` - Replace mock with API
- `frontend/src/App.tsx` - Add /reset-password/:token route

### New Services

- `frontend/src/services/authService.ts` - Add forgotPassword, resetPassword methods
- `frontend/src/services/searchService.ts` - Add search method

---

## PRIORITIES

**Priority 1 (Must Have):**

- ✅ Forgot Password backend endpoint
- ✅ Forgot Password frontend flow
- ✅ Reset Password backend endpoint
- ✅ Reset Password frontend page

**Priority 2 (Should Have):**

- ✅ Global Search backend endpoint
- ✅ Global Search frontend integration

**Priority 3 (Nice to Have):**

- Email templates
- Search result caching
- Search history

---

## NEXT STEPS

Ready to start implementing? I recommend:

1. **Start with Forgot Password Backend** (20 mins)

   - Add database fields
   - Create endpoints
   - Test with Postman

2. **Add Email Service** (15 mins)

   - Configure nodemailer
   - Create email templates

3. **Implement Forgot Password Frontend** (30 mins)

   - Update ForgotPassword.tsx
   - Create ResetPassword.tsx
   - Add route

4. **Implement Global Search Backend** (20 mins)

   - Create search endpoint
   - Add search logic

5. **Update Global Search Frontend** (20 mins)
   - Replace mock data
   - Add real API calls

**Total Estimated Time: ~2 hours**

Which should we start with?
