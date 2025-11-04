export enum Role {
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  MENTEE = 'MENTEE',
  PENDING = 'PENDING'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export enum InviteCodeType {
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN'
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum EventType {
  WORKSHOP = 'workshop',
  SESSION = 'session',
  GROUP_SESSION = 'group_session'
}

export enum GroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED'
}

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  EVENT = 'EVENT',
  SYSTEM = 'SYSTEM',
  FEEDBACK = 'FEEDBACK'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  isActive: boolean;
  bio?: string;
  skills?: string;
  experience?: string;
  avatarUrl?: string;
  inviteCode?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  maxAttendees?: number;
  currentAttendees?: number;
  type: EventType;
  status: EventStatus;
  organizerId: string;
  organizer?: User;
  groupId?: string;
  attendees?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorGroup {
  id: string;
  name: string;
  description?: string;
  mentorId: string;
  mentor?: User;
  mentorName?: string;
  maxMembers: number;
  isActive: boolean;
  status?: string;
  members?: User[];
  menteeIds?: string[];
  mentees?: User[];
  sharedSkills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  mentorId: string;
  menteeIds: string[];
  maxMembers?: number;
}

export interface CreateGroupsRandomRequest {
  menteesPerMentor: number;
  mentorIds?: string[]; // Optional: specify which mentors, or use all available
  menteeIds?: string[]; // Optional: specify which mentees, or use all available
}

export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  recipientId?: string;
  recipient?: User;
  groupId?: string;
  group?: MentorGroup;
  content: string;
  type: MessageType;
  isRead: boolean;
  createdAt: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'learning-materials' | 'templates' | 'guides' | 'tools' | 'other';
  fileName: string;
  originalFileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  fileData?: string; // Base64 encoded file data
  fileUrl?: string; // Alternative URL for file
  fileType?: string; // MIME type
}

export interface DashboardStats {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  activeSessions: number;
  completedSessions: number;
  upcomingEvents: number;
  // Legacy fields for backward compatibility
  activeMentors?: number;
  totalMessages?: number;
  scheduledEvents?: number;
  messagesThisWeek?: number;
  messagesSent?: number;
  eventsAttended?: number;
}

// Main type exports
export * from './goals';
export * from './skills';
export * from './learning';
export * from './activities';

// Resolve naming conflicts
export type { ActivityFilters as LearningActivityFilters } from './learning';


export interface InviteCode {
  id: string;
  code: string;
  type: InviteCodeType;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  usedBy?: string;
  usedAt?: string;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
}

export interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  requestedRole: Role;
  bio?: string;
  skills?: string;
  experience?: string;
  inviteCode?: string;
  status: UserStatus;
  createdAt: string;
  rejectionReason?: string;
}

export interface AdminApprovalRequest {
  userId: string;
  action: 'approve' | 'reject';
  assignedRole?: Role;
  rejectionReason?: string;
}