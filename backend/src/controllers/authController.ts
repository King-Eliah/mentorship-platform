import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../types';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailService';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, firstName, lastName, role, invitationCode } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // For MENTOR or ADMIN roles, require approved invitation code
    if (role === 'MENTOR' || role === 'ADMIN') {
      if (!invitationCode) {
        res.status(400).json({ 
          message: 'Invitation code required for mentor/admin registration' 
        });
        return;
      }

      const invitation = await prisma.invitationCode.findUnique({
        where: { code: invitationCode },
      });

      if (!invitation) {
        res.status(400).json({ message: 'Invalid invitation code' });
        return;
      }

      if (invitation.status !== 'APPROVED') {
        res.status(400).json({ 
          message: 'Invitation code not yet approved by admin' 
        });
        return;
      }

      if (invitation.email !== email) {
        res.status(400).json({ 
          message: 'Invitation code not valid for this email' 
        });
        return;
      }

      if (invitation.expiresAt && new Date() > invitation.expiresAt) {
        await prisma.invitationCode.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' },
        });
        res.status(400).json({ message: 'Invitation code expired' });
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'MENTEE',
      },
    });

    // Mark invitation code as used
    if (invitationCode && (role === 'MENTOR' || role === 'ADMIN')) {
      await prisma.invitationCode.update({
        where: { code: invitationCode },
        data: { 
          status: 'USED',
          usedBy: user.id,
        },
      });
    }

    // Create profile
    await prisma.profile.create({
      data: { userId: user.id },
    });

    // Create mentor profile if role is MENTOR
    if (user.role === 'MENTOR') {
      await prisma.mentorProfile.create({
        data: { userId: user.id },
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ message: 'Account is deactivated' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Log session
    await prisma.sessionLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        profile: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request invitation code (for mentor/admin)
export const requestInvitationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      res.status(400).json({ message: 'Email and role are required' });
      return;
    }

    if (role !== 'MENTOR' && role !== 'ADMIN') {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Check for existing pending/approved invitation
    const existingInvitation = await prisma.invitationCode.findFirst({
      where: {
        email,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingInvitation) {
      res.status(400).json({ 
        message: 'Invitation request already exists for this email' 
      });
      return;
    }

    // Generate unique code
    const code = crypto.randomBytes(16).toString('hex');

    // Create invitation request
    const invitation = await prisma.invitationCode.create({
      data: {
        code,
        email,
        role,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    res.status(201).json({
      message: 'Invitation request submitted. Awaiting admin approval.',
      invitationId: invitation.id,
    });
  } catch (error) {
    console.error('Request invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password - send reset link to email
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Security: Don't reveal whether email exists, but still return success
      res.status(200).json({ 
        message: 'If an account exists for that email, a password reset link will be sent.' 
      });
      return;
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiresAt,
      },
    });

    // Send email with reset link
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email sending fails
      // The token is already stored, user can request again
    }

    res.status(200).json({
      message: 'If an account exists for that email, a password reset link will be sent.',
      // In production, remove this debug line
      resetLink: process.env.NODE_ENV === 'development' ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}` : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password - validate token and update password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      await prisma.sessionLog.create({
        data: {
          userId: req.user.id,
          action: 'LOGOUT',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
