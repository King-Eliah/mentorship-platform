# Email Configuration Guide

## Overview

The mentorship platform now has full email support for password reset functionality. Users can request password resets through the "Forgot Password" page, and they'll receive a secure email link to reset their password.

## Features

- **Secure Token Generation**: 32-byte random tokens hashed with SHA256
- **Token Expiration**: Reset tokens expire in 1 hour
- **Multiple Email Providers**: Support for Gmail, generic SMTP, and test accounts
- **Production Ready**: Professional HTML email templates with fallback plain text
- **Development Friendly**: Test email accounts with preview URLs in development mode

## Setup Instructions

### Option 1: Gmail (Recommended for Development/Production)

#### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Follow the prompts to enable 2FA

#### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Copy the 16-character password shown

#### Step 3: Configure Environment

1. Open `backend/.env`
2. Set the following:

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=MentorConnect
```

#### Step 4: Test

```bash
npm run dev
# In development, the reset link will be logged to console
# Also check spam/promotions folder for test emails
```

### Option 2: Generic SMTP Provider

If using another email provider (SendGrid, Mailgun, AWS SES, etc.):

```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@provider.com
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME=MentorConnect
```

### Option 3: Development Only (Test Accounts)

In development mode without email credentials configured, the system will:

1. Create a temporary Ethereal Email test account
2. Log the reset link to console
3. Provide a preview URL to view the email

```bash
# No EMAIL_USER or EMAIL_PASSWORD needed
NODE_ENV=development
```

## Testing Password Reset Flow

### Manual Testing

1. **Start the application:**

   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

2. **Trigger password reset:**

   - Navigate to `/forgot-password`
   - Enter a user's email address
   - Click "Send Reset Link"

3. **Check the reset link:**

   - **Development (Gmail)**: Check the user's inbox/spam folder for email
   - **Development (No config)**: Check backend console for reset link and preview URL
   - **Production**: Check user's inbox for professional reset email

4. **Reset password:**
   - Click the link in the email (or use the development link)
   - Enter new password
   - Click "Reset Password"

### API Testing with cURL

```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Response (development):
{
  "message": "If an account exists for that email, a password reset link will be sent.",
  "resetLink": "http://localhost:5173/reset-password/abc123def456..."
}

# Reset password (you need the token from the reset link)
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"abc123def456...",
    "newPassword":"newPassword123"
  }'
```

## Email Template

The password reset email includes:

- Professional header with MentorConnect branding
- Clear call-to-action button
- Fallback clickable link
- Security notice about link expiration
- Instructions if they didn't request the reset
- Footer with copyright

## Security Considerations

1. **Token Security**:

   - Tokens are 32 random bytes (256 bits)
   - Only the SHA256 hash is stored in the database
   - Plain tokens only appear in the email link

2. **Token Expiration**:

   - Reset tokens expire in 1 hour
   - Expired tokens are rejected on the reset endpoint
   - Users can request new reset links anytime

3. **Email Privacy**:

   - The forgot-password endpoint doesn't reveal if an email exists (always returns success)
   - This prevents email enumeration attacks

4. **SMTP Security**:
   - Use `EMAIL_SECURE=true` for port 465 (implicit TLS)
   - Use `EMAIL_SECURE=false` for port 587 (explicit STARTTLS)
   - Never commit real credentials to git (use `.env` instead of `.env.example`)

## Troubleshooting

### Emails not sending in development

1. Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
2. For Gmail: Verify App Password (not regular password) is used
3. For Gmail: Check 2FA is enabled
4. Look for error messages in the backend console
5. Check spam/promotions folder in Gmail

### "Password reset email sent" but no email received

1. Check spam/promotions folder
2. In development mode, check the backend console for the reset link
3. Verify the `EMAIL_USER` email is actually configured
4. For production, check email provider's bounce/delivery reports

### "Object literal may only specify known properties" errors

- Run `npm run prisma:generate` in the backend to regenerate the Prisma client

### Port/Connection errors

- Verify SMTP host and port are correct
- Check that firewall allows outbound SMTP connections
- For Gmail: May need to allow "Less secure apps" or use App Password

## Production Deployment

### Before going live:

1. **Use Production Email Provider**:

   - Gmail (limited to ~50 emails/hour)
   - SendGrid, Mailgun, AWS SES for high volume
   - Your corporate email server

2. **Security Checklist**:

   - ✅ Use strong `JWT_SECRET`
   - ✅ Set `NODE_ENV=production`
   - ✅ Use real email service (not test accounts)
   - ✅ Set proper `FRONTEND_URL` (no localhost)
   - ✅ Enable HTTPS on frontend
   - ✅ Use database backups

3. **Configuration**:

   ```bash
   NODE_ENV=production
   EMAIL_SERVICE=gmail  # or your provider
   EMAIL_USER=noreply@yourdomain.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM_NAME=MentorConnect
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Rate Limiting** (Optional Future Enhancement):
   - Consider implementing rate limiting on forgot-password endpoint
   - Current: No rate limit (vulnerable to email enumeration via timing attacks)
   - Future: Add rate limiter (e.g., max 5 requests per IP per hour)

## Code Files

- **Backend Email Service**: `backend/src/utils/emailService.ts`
- **Auth Controller**: `backend/src/controllers/authController.ts` (forgotPassword, resetPassword functions)
- **Frontend Reset Page**: `frontend/src/pages/ResetPassword.tsx`
- **Frontend Forgot Page**: `frontend/src/pages/ForgotPassword.tsx`
- **Database Schema**: `backend/prisma/schema.prisma` (User model with resetToken fields)

## References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [OWASP Password Reset Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
