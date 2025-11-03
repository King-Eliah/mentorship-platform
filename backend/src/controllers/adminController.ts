import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate invitation code
export const generateInvitationCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, email, expiresInDays } = req.body;

    // Validate required fields
    if (!role) {
      res.status(400).json({ message: 'Role is required' });
      return;
    }

    // Validate email is provided
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Generate unique code
    const code = `${role}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Calculate expiration date
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Create invitation code with APPROVED status
    const invitation = await prisma.invitationCode.create({
      data: {
        code,
        role,
        email,
        status: 'APPROVED',
        expiresAt,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ 
      invitation: {
        id: invitation.id,
        code: invitation.code,
        role: invitation.role,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        createdAt: invitation.createdAt,
      }
    });
  } catch (error) {
    console.error('Generate invitation code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all invitation requests
export const getInvitationRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    const invitations = await prisma.invitationCode.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve invitation request
export const approveInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const invitation = await prisma.invitationCode.findUnique({
      where: { id },
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    if (invitation.status !== 'PENDING') {
      res.status(400).json({ message: 'Invitation already processed' });
      return;
    }

    const updated = await prisma.invitationCode.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user?.id,
      },
    });

    res.json({
      message: 'Invitation approved',
      invitation: updated,
    });
  } catch (error) {
    console.error('Approve invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject invitation request
export const rejectInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const invitation = await prisma.invitationCode.findUnique({
      where: { id },
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    if (invitation.status !== 'PENDING') {
      res.status(400).json({ message: 'Invitation already processed' });
      return;
    }

    const updated = await prisma.invitationCode.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: req.user?.id,
      },
    });

    res.json({
      message: 'Invitation rejected',
      invitation: updated,
    });
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          profile: true,
          mentorProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    // Support both new status enum and legacy isActive boolean
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'Status or isActive field required' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: `User ${isActive !== undefined ? (isActive ? 'activated' : 'deactivated') : 'status updated'} successfully`,
      user,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user manually (admin only)
export const createUserManually = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName, email, role, status } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      res.status(400).json({ 
        message: 'firstName, lastName, email, and role are required' 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    // Generate random password (12 characters: mixed case, numbers, symbols)
    const randomPassword = crypto
      .randomBytes(9)
      .toString('base64')
      .replace(/[^a-zA-Z0-9!@#$%^&*]/g, '')
      .substring(0, 12);

    // Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        status: status || 'ACTIVE',
        isActive: status !== 'SUSPENDED' && status !== 'REJECTED',
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      generatedPassword: randomPassword,
      passwordNote: 'Please save this password and share it with the user securely. The user must change it on first login.',
    });
  } catch (error) {
    console.error('Create user manually error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get platform statistics
export const getAnalytics = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalMentors,
      totalMentees,
      totalAdmins,
      totalEvents,
      totalGroups,
      activeUsers,
      pendingInvitations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.user.count({ where: { role: 'MENTEE' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.event.count(),
      prisma.group.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.invitationCode.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        mentors: totalMentors,
        mentees: totalMentees,
        admins: totalAdmins,
        active: activeUsers,
      },
      events: {
        total: totalEvents,
      },
      groups: {
        total: totalGroups,
      },
      invitations: {
        pending: pendingInvitations,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
