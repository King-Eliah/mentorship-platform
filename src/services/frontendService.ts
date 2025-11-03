import { User, Event, Message, Notification, DashboardStats, Role, EventType, EventStatus, MessageType, NotificationType, MentorGroup, UserStatus } from '../types';
import { 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest, 
  GoalFilters, 
  GoalStats,
  GoalStatus,
  GoalCategory,
  GoalPriority
} from '../types/goals';
import { 
  UserSkill, 
  SkillCategory, 
  SkillLevel
} from '../types/skills';
import { 
  LearningActivity, 
  ActivityType, 
  ActivityStatus,
  ActivityPriority,
  ActivityFeedback,
  LearningPath,
  CreateLearningActivityRequest
} from '../types/learning';
import { 
  RecentActivity, 
  RecentActivityType
} from '../types/activities';

// Mock data storage (in a real app, this would be replaced with proper state management)
class MockDataStore {
  private static users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'System Administrator with full access privileges',
      skills: 'Management, System Administration, Leadership',
      experience: '5+ years',
      avatarUrl: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      email: 'mentor@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: Role.MENTOR,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'Senior Software Engineer and experienced mentor',
      skills: 'JavaScript, TypeScript, React, Node.js, Leadership',
      experience: '8 years',
      avatarUrl: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      email: 'mentee@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.MENTEE,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'Junior developer eager to learn and grow',
      skills: 'JavaScript, HTML, CSS, React (learning)',
      experience: '1 year',
      avatarUrl: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      email: 'mentor2@example.com',
      firstName: 'Michael',
      lastName: 'Chen',
      role: Role.MENTOR,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'Full-stack developer with passion for teaching',
      skills: 'Python, Django, React, PostgreSQL',
      experience: '6 years',
      avatarUrl: '',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      id: '5',
      email: 'mentee2@example.com',
      firstName: 'Emily',
      lastName: 'Davis',
      role: Role.MENTEE,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'Aspiring frontend developer',
      skills: 'HTML, CSS, JavaScript',
      experience: '6 months',
      avatarUrl: '',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    },
    {
      id: '6',
      email: 'mentee3@example.com',
      firstName: 'Alex',
      lastName: 'Rodriguez',
      role: Role.MENTEE,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'Computer Science student',
      skills: 'Java, Python, Data Structures',
      experience: '1 year',
      avatarUrl: '',
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z'
    },
    {
      id: '7',
      email: 'mentee4@example.com',
      firstName: 'Lisa',
      lastName: 'Wong',
      role: Role.MENTEE,
      status: UserStatus.ACTIVE,
      isActive: true,
      bio: 'Career changer learning web development',
      skills: 'HTML, CSS, JavaScript basics',
      experience: '3 months',
      avatarUrl: '',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ];

  private static goals: Goal[] = [
    {
      id: 'goal-1',
      title: 'Master React Hooks',
      description: 'Learn and master all React hooks including useState, useEffect, useContext, and custom hooks',
      category: GoalCategory.SKILL_DEVELOPMENT,
      priority: GoalPriority.HIGH,
      status: GoalStatus.IN_PROGRESS,
      progress: 65,
      dueDate: '2024-12-31T23:59:59Z',
      createdAt: '2024-10-01T00:00:00Z',
      updatedAt: '2024-10-15T12:00:00Z',
      userId: '3',
      mentorId: '2',
      assignedBy: '2',
      relatedSkills: ['React', 'JavaScript', 'Frontend Development'],
      milestones: [
        {
          id: 'milestone-1',
          title: 'Complete useState tutorial',
          description: 'Understand and practice useState hook',
          targetDate: '2024-10-20T00:00:00Z',
          completed: true,
          completedAt: '2024-10-18T15:30:00Z',
          order: 1
        },
        {
          id: 'milestone-2',
          title: 'Master useEffect',
          description: 'Learn useEffect hook and its dependencies',
          targetDate: '2024-11-10T00:00:00Z',
          completed: false,
          order: 2
        },
        {
          id: 'milestone-3',
          title: 'Build custom hooks',
          description: 'Create reusable custom hooks for common functionality',
          targetDate: '2024-12-01T00:00:00Z',
          completed: false,
          order: 3
        }
      ],
      isPublic: true
    },
    {
      id: 'goal-2',
      title: 'Complete TypeScript Certification',
      description: 'Obtain official TypeScript certification to demonstrate expertise',
      category: GoalCategory.CERTIFICATION,
      priority: GoalPriority.MEDIUM,
      status: GoalStatus.NOT_STARTED,
      progress: 0,
      dueDate: '2025-03-31T23:59:59Z',
      createdAt: '2024-09-15T00:00:00Z',
      updatedAt: '2024-09-15T00:00:00Z',
      userId: '3',
      relatedSkills: ['TypeScript', 'JavaScript', 'Programming'],
      milestones: [],
      isPublic: false
    }
  ];

  private static skills: UserSkill[] = [
    {
      id: 'skill-1',
      userId: '3',
      skillId: 'react',
      skill: {
        id: 'react',
        name: 'React',
        category: SkillCategory.TECHNICAL,
        description: 'Modern JavaScript library for building user interfaces',
        level: SkillLevel.INTERMEDIATE,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      currentLevel: SkillLevel.INTERMEDIATE,
      targetLevel: SkillLevel.ADVANCED,
      progress: 65,
      lastAssessedAt: '2024-10-01T00:00:00Z',
      assessedBy: '2',
      endorsements: [],
      learningResources: [],
      relatedGoals: ['goal-1'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-10-01T00:00:00Z'
    }
  ];

  private static learningActivities: LearningActivity[] = [
    {
      id: 'activity-1',
      userId: '3',
      type: ActivityType.VIDEO_COURSE,
      title: 'Advanced React Patterns',
      description: 'Learn advanced React patterns including render props, HOCs, and compound components',
      status: ActivityStatus.IN_PROGRESS,
      priority: ActivityPriority.HIGH,
      progress: 45,
      startedAt: '2024-10-10T09:00:00Z',
      dueDate: '2024-11-10T23:59:59Z',
      estimatedDuration: 480, // 8 hours
      actualDuration: 216, // 3.6 hours completed
      timeSpent: 216,
      relatedSkills: ['React', 'JavaScript'],
      relatedGoals: ['goal-1'],
      tags: ['react', 'patterns', 'advanced'],
      createdAt: '2024-10-10T09:00:00Z',
      updatedAt: '2024-10-15T14:30:00Z'
    }
  ];

  private static recentActivities: RecentActivity[] = [
    {
      id: 'activity-recent-1',
      userId: '3',
      userName: 'John Doe',
      userRole: 'MENTEE',
      type: RecentActivityType.GOAL_CREATED,
      title: 'Created new goal: Master React Hooks',
      description: 'John created a new learning goal focused on mastering React hooks',
      timestamp: '2024-10-15T10:30:00Z',
      relatedEntityId: 'goal-1',
      relatedEntityType: 'goal',
      metadata: { goalCategory: 'SKILL_DEVELOPMENT', priority: 'HIGH' },
      isPublic: true,
      iconType: 'target',
      color: 'blue'
    },
    {
      id: 'activity-recent-2',
      userId: '3',
      userName: 'John Doe',
      userRole: 'MENTEE',
      type: RecentActivityType.LEARNING_ACTIVITY_STARTED,
      title: 'Started learning activity: Advanced React Patterns',
      description: 'John began a new video course on advanced React patterns',
      timestamp: '2024-10-10T09:15:00Z',
      relatedEntityId: 'activity-1',
      relatedEntityType: 'resource',
      isPublic: true,
      iconType: 'play',
      color: 'green'
    }
  ];

  private static events: Event[] = [
    {
      id: '1',
      title: 'React Fundamentals Workshop',
      description: 'Learn the basics of React development',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      location: 'Online',
      maxAttendees: 20,
      currentAttendees: 5,
      type: EventType.WORKSHOP,
      status: EventStatus.SCHEDULED,
      organizerId: '2',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  private static messages: Message[] = [
    {
      id: '1',
      senderId: '2',
      recipientId: '3',
      content: 'Welcome to the mentoring program!',
      type: MessageType.TEXT,
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  private static notifications: Notification[] = [
    {
      id: '1',
      userId: '3',
      type: NotificationType.MESSAGE,
      title: 'New Message',
      message: 'You have a new message from your mentor',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  private static groups: MentorGroup[] = [
    {
      id: '1',
      name: 'Web Development Cohort',
      description: 'Learning modern web development with React and Node.js',
      mentorId: '2',
      mentor: undefined, // Will be populated dynamically
      mentorName: 'Sarah Johnson',
      maxMembers: 10,
      isActive: true,
      menteeIds: ['3', '5'],
      members: undefined, // Will be populated dynamically
      mentees: undefined, // Will be populated dynamically
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  static getUsers() { return [...this.users]; }
  static getUser(id: string) { return this.users.find(u => u.id === id); }
  static getUserByEmail(email: string) { return this.users.find(u => u.email === email); }
  static addUser(user: User) { this.users.push(user); }
  static getUserById(id: string) { return this.users.find(u => u.id === id); }

  // Track current user in mock environment (mirrors auth localStorage)
  private static currentUserId: string | null = null;
  static setCurrentUser(userId: string | null) { this.currentUserId = userId; }
  static getCurrentUser() { return this.currentUserId ? this.users.find(u => u.id === this.currentUserId) : null; }
  
  static updateUser(id: string, updates: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index >= 0) {
      this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date().toISOString() };
    }
  }

  static getEvents() { return [...this.events]; }
  static getEvent(id: string) { return this.events.find(e => e.id === id); }
  static addEvent(event: Event) { this.events.push(event); }
  static updateEvent(id: string, updates: Partial<Event>) {
    const index = this.events.findIndex(e => e.id === id);
    if (index >= 0) {
      this.events[index] = { ...this.events[index], ...updates, updatedAt: new Date().toISOString() };
    }
  }

  static getMessages() { return [...this.messages]; }
  static getMessage(id: string) { return this.messages.find(m => m.id === id); }
  static getMessagesByUser(userId: string) {
    return this.messages.filter(m => m.senderId === userId || m.recipientId === userId);
  }
  static addMessage(message: Message) { this.messages.push(message); }

  static getNotifications() { return [...this.notifications]; }
  static getNotificationsByUser(userId: string) {
    return this.notifications.filter(n => n.userId === userId);
  }
  static addNotification(notification: Notification) { this.notifications.push(notification); }
  static markNotificationAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) notification.isRead = true;
  }

  static getGroups() { 
    return this.groups.map(g => this.populateGroupMembers(g)); 
  }
  static getGroup(id: string) { 
    const group = this.groups.find(g => g.id === id);
    return group ? this.populateGroupMembers(group) : undefined;
  }
  static addGroup(group: MentorGroup) { this.groups.push(group); }
  static updateGroup(id: string, updates: Partial<MentorGroup>) {
    const index = this.groups.findIndex(g => g.id === id);
    if (index >= 0) {
      this.groups[index] = { ...this.groups[index], ...updates, updatedAt: new Date().toISOString() };
    }
  }
  static deleteGroup(id: string) {
    const index = this.groups.findIndex(g => g.id === id);
    if (index >= 0) {
      this.groups.splice(index, 1);
    }
  }
  static getGroupsByMentor(mentorId: string) {
    return this.groups.filter(g => g.mentorId === mentorId).map(g => this.populateGroupMembers(g));
  }
  static getGroupsByMentee(menteeId: string) {
    return this.groups.filter(g => g.menteeIds?.includes(menteeId) || g.members?.some(m => m.id === menteeId))
      .map(g => this.populateGroupMembers(g));
  }
  
  private static populateGroupMembers(group: MentorGroup): MentorGroup {
    const mentor = this.users.find(u => u.id === group.mentorId);
    const mentees = (group.menteeIds || []).map(id => this.users.find(u => u.id === id)).filter(Boolean) as User[];
    
    return {
      ...group,
      mentor,
      mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : group.mentorName,
      members: mentees,
      mentees: mentees
    };
  }

  // Goal data methods
  static getGoals() { return [...this.goals]; }
  static getGoal(id: string) { return this.goals.find(g => g.id === id); }
  static addGoal(goal: Goal) { this.goals.push(goal); }
  static updateGoal(id: string, updates: Partial<Goal>) {
    const index = this.goals.findIndex(g => g.id === id);
    if (index !== -1) {
      this.goals[index] = { ...this.goals[index], ...updates, updatedAt: new Date().toISOString() };
      return this.goals[index];
    }
    return undefined;
  }
  static deleteGoal(id: string) {
    const index = this.goals.findIndex(g => g.id === id);
    if (index !== -1) {
      this.goals.splice(index, 1);
      return true;
    }
    return false;
  }

  // Skills data methods
  static getUserSkills(userId: string) { return this.skills.filter(s => s.userId === userId); }
  static addUserSkill(skill: UserSkill) { this.skills.push(skill); }

  // Learning activities data methods
  static getLearningActivities(userId?: string) {
    return userId ? this.learningActivities.filter(a => a.userId === userId) : [...this.learningActivities];
  }
  static addLearningActivity(activity: LearningActivity) { this.learningActivities.push(activity); }
  
  static updateLearningActivity(activityId: string, updates: Partial<LearningActivity>): LearningActivity {
    const index = this.learningActivities.findIndex(a => a.id === activityId);
    if (index === -1) {
      throw new Error('Learning activity not found');
    }
    
    const updatedActivity = {
      ...this.learningActivities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.learningActivities[index] = updatedActivity;
    return updatedActivity;
  }

  // Recent activities data methods
  static getRecentActivities(limit?: number) {
    const activities = [...this.recentActivities].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? activities.slice(0, limit) : activities;
  }
  static addRecentActivity(activity: RecentActivity) {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 100) {
      this.recentActivities = this.recentActivities.slice(0, 100);
    }
  }
  static deleteRecentActivity(activityId: string) {
    const index = this.recentActivities.findIndex(a => a.id === activityId);
    if (index !== -1) {
      this.recentActivities.splice(index, 1);
      return true;
    }
    return false;
  }
}

/**
 * Unified Frontend Service for standalone development
 * Provides all the functionality needed for the frontend with mock data
 */
class FrontendService {
  // Utility method for simulating network delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication methods
  async login(email: string) {
    await this.delay(800);
    
    const user = MockDataStore.getUserByEmail(email);
    if (!user) {
      throw new Error(`No account found with email: ${email}. Use admin@example.com, mentor@example.com, or mentee@example.com`);
    }

    // Store auth data in localStorage
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(user));
    // Track in mock store for services that need current user context
    MockDataStore.setCurrentUser(user.id);
    
    return { user, token: 'mock-jwt-token' };
  }

  async signup(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    requestedRole?: Role;
    inviteCode?: string;
    bio?: string;
    skills?: string;
    experience?: string;
  }) {
    await this.delay(1000);
    
    const existingUser = MockDataStore.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate invite codes for mentor/admin roles
    if (userData.inviteCode) {
      // Mock invite code validation
      const validCodes = ['MENTOR-ABC123', 'ADMIN-XYZ789'];
      if (!validCodes.includes(userData.inviteCode)) {
        throw new Error('Invalid invite code. Please check your code and try again.');
      }
      
      // Check if code matches requested role
      if (userData.requestedRole === Role.MENTOR && !userData.inviteCode.startsWith('MENTOR-')) {
        throw new Error('This invite code is not valid for mentor registration.');
      }
      if (userData.requestedRole === Role.ADMIN && !userData.inviteCode.startsWith('ADMIN-')) {
        throw new Error('This invite code is not valid for admin registration.');
      }
    }

    // Determine user status and role
    let userStatus = UserStatus.ACTIVE;
    let assignedRole = userData.role;

    // If mentor/admin role requested with valid invite code, approve immediately
    if (userData.inviteCode && (userData.requestedRole === Role.MENTOR || userData.requestedRole === Role.ADMIN)) {
      assignedRole = userData.requestedRole;
      userStatus = UserStatus.ACTIVE;
    } 
    // If mentee registration or no invite code, require approval
    else if (userData.requestedRole === Role.MENTEE || !userData.inviteCode) {
      assignedRole = Role.PENDING;
      userStatus = UserStatus.PENDING;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: assignedRole,
      status: userStatus,
      isActive: userStatus === UserStatus.ACTIVE,
      bio: userData.bio || `New ${userData.requestedRole?.toLowerCase() || 'mentee'} user`,
      skills: userData.skills || 'To be updated',
      experience: userData.experience || 'To be updated',
      avatarUrl: '',
      inviteCode: userData.inviteCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    MockDataStore.addUser(newUser);
    
    // Only store auth data if user is active (approved)
    if (userStatus === UserStatus.ACTIVE) {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(newUser));
    }

    return { user: newUser, token: userStatus === UserStatus.ACTIVE ? 'mock-jwt-token' : null };
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    MockDataStore.setCurrentUser(null);
  }

  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  }

  // User management methods
  async getUsers() {
    await this.delay(500);
    return MockDataStore.getUsers();
  }

  async getUser(id: string) {
    await this.delay(300);
    const user = MockDataStore.getUser(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateUser(id: string, updates: Partial<User>) {
    await this.delay(500);
    MockDataStore.updateUser(id, updates);
    return MockDataStore.getUser(id)!;
  }

  // Event management methods
  async getEvents() {
    await this.delay(600);
    return MockDataStore.getEvents();
  }

  async getEvent(id: string) {
    await this.delay(300);
    const event = MockDataStore.getEvent(id);
    if (!event) throw new Error('Event not found');
    return event;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
    await this.delay(800);
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    MockDataStore.addEvent(newEvent);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>) {
    await this.delay(500);
    MockDataStore.updateEvent(id, updates);
    return MockDataStore.getEvent(id)!;
  }

  // Messaging methods
  async getMessages(userId?: string) {
    await this.delay(500);
    if (userId) {
      return MockDataStore.getMessagesByUser(userId);
    }
    return MockDataStore.getMessages();
  }

  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt'>) {
    await this.delay(400);
    const newMessage: Message = {
      ...messageData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    MockDataStore.addMessage(newMessage);
    return newMessage;
  }

  // Notification methods
  async getNotifications(userId: string) {
    await this.delay(400);
    return MockDataStore.getNotificationsByUser(userId);
  }

  async markNotificationAsRead(id: string) {
    await this.delay(200);
    MockDataStore.markNotificationAsRead(id);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay(300);
    const users = MockDataStore.getUsers();
    const events = MockDataStore.getEvents();
    const messages = MockDataStore.getMessages();
    
    return {
      totalUsers: users.length,
      totalMentors: users.filter(u => u.role === Role.MENTOR).length,
      totalMentees: users.filter(u => u.role === Role.MENTEE).length,
      activeSessions: Math.floor(Math.random() * 10) + 5,
      completedSessions: Math.floor(Math.random() * 50) + 20,
      upcomingEvents: events.filter(e => e.status === EventStatus.SCHEDULED).length,
      // Legacy fields for backward compatibility
      activeMentors: users.filter(u => u.role === Role.MENTOR && u.isActive).length,
      totalMessages: messages.length,
      scheduledEvents: events.filter(e => e.status === EventStatus.SCHEDULED).length,
      messagesThisWeek: Math.floor(Math.random() * 25) + 5,
      messagesSent: Math.floor(Math.random() * 100) + 20,
      eventsAttended: Math.floor(Math.random() * 15) + 3,
    };
  }

  // Group methods
  async getGroups() {
    await this.delay(500);
    return MockDataStore.getGroups();
  }

  async getGroup(id: string) {
    await this.delay(300);
    const group = MockDataStore.getGroup(id);
    if (!group) throw new Error('Group not found');
    return group;
  }

  async getMyGroups() {
    await this.delay(400);
    const currentUser = MockDataStore.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    if (currentUser.role === Role.MENTOR) {
      return MockDataStore.getGroupsByMentor(currentUser.id);
    } else if (currentUser.role === Role.MENTEE) {
      return MockDataStore.getGroupsByMentee(currentUser.id);
    }
    
    return [];
  }

  async createGroup(groupData: {
    name: string;
    description?: string;
    mentorId: string;
    menteeIds: string[];
    maxMembers?: number;
  }) {
    await this.delay(800);
    
    const mentor = MockDataStore.getUser(groupData.mentorId);
    const mentees = groupData.menteeIds.map(id => MockDataStore.getUser(id)).filter(Boolean) as User[];
    
    const newGroup: MentorGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: groupData.name,
      description: groupData.description,
      mentorId: groupData.mentorId,
      mentor: mentor,
      mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : undefined,
      maxMembers: groupData.maxMembers || 10,
      isActive: true,
      menteeIds: groupData.menteeIds,
      members: mentees,
      mentees: mentees,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MockDataStore.addGroup(newGroup);
    return newGroup;
  }

  async createGroupsRandomly(request: {
    menteesPerMentor: number;
    mentorIds?: string[];
    menteeIds?: string[];
  }) {
    await this.delay(1000);
    
    const allUsers = MockDataStore.getUsers();
    const mentors = request.mentorIds 
      ? request.mentorIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[]
      : allUsers.filter(u => u.role === Role.MENTOR && u.status === UserStatus.ACTIVE);
    
    const mentees = request.menteeIds
      ? request.menteeIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[]
      : allUsers.filter(u => u.role === Role.MENTEE && u.status === UserStatus.ACTIVE);
    
    // Shuffle mentees for random assignment
    const shuffledMentees = [...mentees].sort(() => Math.random() - 0.5);
    
    const createdGroups: MentorGroup[] = [];
    let menteeIndex = 0;
    
    for (const mentor of mentors) {
      const groupMentees: User[] = [];
      
      for (let i = 0; i < request.menteesPerMentor && menteeIndex < shuffledMentees.length; i++) {
        groupMentees.push(shuffledMentees[menteeIndex]);
        menteeIndex++;
      }
      
      if (groupMentees.length > 0) {
        const newGroup: MentorGroup = {
          id: Math.random().toString(36).substr(2, 9),
          name: `${mentor.firstName} ${mentor.lastName}'s Group`,
          description: `Mentoring group led by ${mentor.firstName} ${mentor.lastName}`,
          mentorId: mentor.id,
          mentor: mentor,
          mentorName: `${mentor.firstName} ${mentor.lastName}`,
          maxMembers: request.menteesPerMentor + 1,
          isActive: true,
          menteeIds: groupMentees.map(m => m.id),
          members: groupMentees,
          mentees: groupMentees,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        MockDataStore.addGroup(newGroup);
        createdGroups.push(newGroup);
      }
    }
    
    return createdGroups;
  }

  async updateGroup(groupId: string, groupData: Partial<{
    name: string;
    description?: string;
    mentorId: string;
    menteeIds: string[];
    maxMembers?: number;
  }>) {
    await this.delay(600);
    
    const group = MockDataStore.getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const updates: Partial<MentorGroup> = {
      ...groupData,
      members: groupData.menteeIds ? groupData.menteeIds.map(id => MockDataStore.getUser(id)).filter(Boolean) as User[] : group.members,
      mentees: groupData.menteeIds ? groupData.menteeIds.map(id => MockDataStore.getUser(id)).filter(Boolean) as User[] : group.mentees,
    };
    
    MockDataStore.updateGroup(groupId, updates);
    return MockDataStore.getGroup(groupId)!;
  }

  async deleteGroup(groupId: string) {
    await this.delay(500);
    MockDataStore.deleteGroup(groupId);
    return { success: true };
  }

  async joinGroup(groupId: string) {
    await this.delay(400);
    const currentUser = MockDataStore.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const group = MockDataStore.getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const currentMembers = group.menteeIds || [];
    if (!currentMembers.includes(currentUser.id)) {
      MockDataStore.updateGroup(groupId, {
        menteeIds: [...currentMembers, currentUser.id],
        members: [...(group.members || []), currentUser],
        mentees: [...(group.mentees || []), currentUser]
      });
    }
    
    return { success: true };
  }

  async leaveGroup(groupId: string) {
    await this.delay(400);
    const currentUser = MockDataStore.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const group = MockDataStore.getGroup(groupId);
    if (!group) throw new Error('Group not found');
    
    const currentMembers = group.menteeIds || [];
    MockDataStore.updateGroup(groupId, {
      menteeIds: currentMembers.filter(id => id !== currentUser.id),
      members: (group.members || []).filter(m => m.id !== currentUser.id),
      mentees: (group.mentees || []).filter(m => m.id !== currentUser.id)
    });
    
    return { success: true };
  }

  async getGroupActivity(groupId: string) {
    await this.delay(400);
    // Mock group activity data
    return {
      groupId,
      totalMessages: Math.floor(Math.random() * 100),
      totalEvents: Math.floor(Math.random() * 20),
      lastActivity: new Date().toISOString()
    };
  }

  async getAvailableUsers() {
    await this.delay(300);
    const allUsers = MockDataStore.getUsers();
    return allUsers.filter(u => u.status === UserStatus.ACTIVE);
  }

  // Analytics methods (returns real usage data)
  async getAnalytics() {
    await this.delay(600);
    
    try {
      // Import analytics service
      const { analyticsService } = await import('./analyticsService');
      
      // Get real data from store
      const users = MockDataStore.getUsers();
      const goals = MockDataStore.getGoals();
      const activities = MockDataStore.getRecentActivities();
      
      // Generate real analytics
      const realAnalytics = await analyticsService.generateRealAnalytics(users, goals, activities);
      
      return realAnalytics;
    } catch (error) {
      console.error('Failed to generate real analytics:', error);
      
      // Fallback to mock data
      return {
        userGrowth: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toISOString(),
          mentors: Math.floor(Math.random() * 20) + 10,
          mentees: Math.floor(Math.random() * 50) + 25
        })),
        sessionActivity: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
          sessions: Math.floor(Math.random() * 15) + 5
        })),
        engagement: {
          averageSessionDuration: 45,
          messagesSent: Math.floor(Math.random() * 1000) + 500,
          eventsAttended: Math.floor(Math.random() * 200) + 100
        }
      };
    }
  }

  // Goal service methods
  async simulateGetGoals(userId: string, filters?: GoalFilters): Promise<Goal[]> {
    await this.delay(400);
    let goals = MockDataStore.getGoals().filter(goal => goal.userId === userId);
    
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        goals = goals.filter(goal => filters.status!.includes(goal.status));
      }
      if (filters.category && filters.category.length > 0) {
        goals = goals.filter(goal => filters.category!.includes(goal.category));
      }
      if (filters.priority && filters.priority.length > 0) {
        goals = goals.filter(goal => filters.priority!.includes(goal.priority));
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        goals = goals.filter(goal => 
          goal.title.toLowerCase().includes(search) ||
          goal.description.toLowerCase().includes(search)
        );
      }
    }
    
    return goals;
  }

  async simulateGetGoalById(goalId: string): Promise<Goal> {
    await this.delay(300);
    const goal = MockDataStore.getGoal(goalId);
    if (!goal) throw new Error('Goal not found');
    return goal;
  }

  async simulateCreateGoal(goalData: CreateGoalRequest): Promise<Goal> {
    await this.delay(600);
    
    // Get the current user information for activity creation
    const currentUser = MockDataStore.getCurrentUser(); // We'll need to add this method
    const targetUser = goalData.assignToUserId ? MockDataStore.getUserById(goalData.assignToUserId) : currentUser;
    
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: goalData.title,
      description: goalData.description,
      category: goalData.category,
      priority: goalData.priority,
      status: GoalStatus.NOT_STARTED,
      progress: 0,
      dueDate: goalData.dueDate,
      userId: goalData.assignToUserId || currentUser?.id || '3', // Use current user ID
      mentorId: goalData.assignToUserId ? currentUser?.id : undefined, // If assigned, current user is the assigner
      assignedBy: goalData.assignToUserId ? currentUser?.id : undefined,
      relatedSkills: goalData.relatedSkills,
      milestones: goalData.milestones.map((m, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: m.title,
        description: m.description,
        targetDate: m.targetDate,
        completed: false,
        order: index + 1
      })),
      isPublic: goalData.isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MockDataStore.addGoal(goal);
    
    // Add recent activity with proper user attribution
    const activityTitle = goalData.assignToUserId 
      ? `Assigned goal "${goal.title}" to ${targetUser?.firstName} ${targetUser?.lastName}`
      : `Created new goal: ${goal.title}`;
    
    const activityDescription = goalData.assignToUserId
      ? `A new ${goal.category.toLowerCase().replace('_', ' ')} goal was assigned by ${currentUser?.firstName} ${currentUser?.lastName}`
      : `A new ${goal.category.toLowerCase().replace('_', ' ')} goal was created`;

    MockDataStore.addRecentActivity({
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || '1', // Use current user ID for activity
      userName: (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown User'),
      userRole: currentUser?.role || 'ADMIN',
      type: RecentActivityType.GOAL_CREATED,
      title: activityTitle,
      description: activityDescription,
      timestamp: new Date().toISOString(),
      relatedEntityId: goal.id,
      relatedEntityType: 'goal',
      metadata: { 
        goalCategory: goal.category, 
        priority: goal.priority,
        assignedTo: goalData.assignToUserId,
        targetUserName: targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : undefined
      },
      isPublic: goal.isPublic,
      iconType: 'target',
      color: 'blue'
    });
    
    return goal;
  }

  async simulateUpdateGoal(goalId: string, updates: UpdateGoalRequest): Promise<Goal> {
    await this.delay(400);
    const updated = MockDataStore.updateGoal(goalId, updates as Partial<Goal>);
    if (!updated) throw new Error('Goal not found');
    return updated;
  }

  async simulateDeleteGoal(goalId: string): Promise<void> {
    await this.delay(300);
    const deleted = MockDataStore.deleteGoal(goalId);
    if (!deleted) throw new Error('Goal not found');
  }

  async simulateUpdateGoalProgress(goalId: string, progress: number, milestoneId?: string): Promise<Goal> {
    await this.delay(400);
    const goal = MockDataStore.getGoal(goalId);
    if (!goal) throw new Error('Goal not found');
    const actor = MockDataStore.getCurrentUser();
    
    if (milestoneId) {
      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        milestone.completed = true;
        milestone.completedAt = new Date().toISOString();
        
        // Add recent activity for milestone completion
        MockDataStore.addRecentActivity({
          id: Math.random().toString(36).substr(2, 9),
          userId: actor?.id || goal.userId,
          userName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown User',
          userRole: actor?.role || 'MENTEE',
          type: RecentActivityType.GOAL_MILESTONE_COMPLETED,
          title: `Completed milestone: ${milestone.title}`,
          description: `Milestone completed for goal "${goal.title}"`,
          timestamp: new Date().toISOString(),
          relatedEntityId: goal.id,
          relatedEntityType: 'goal',
          isPublic: goal.isPublic,
          iconType: 'check-circle',
          color: 'green'
        });
      }
    }
    
    const updated = MockDataStore.updateGoal(goalId, { 
      progress,
      status: progress === 100 ? GoalStatus.COMPLETED : GoalStatus.IN_PROGRESS,
      completedAt: progress === 100 ? new Date().toISOString() : undefined
    });
    
    if (updated && progress === 100) {
      // Add recent activity for goal completion
      MockDataStore.addRecentActivity({
        id: Math.random().toString(36).substr(2, 9),
        userId: actor?.id || updated.userId,
        userName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown User',
        userRole: actor?.role || 'MENTEE',
        type: RecentActivityType.GOAL_COMPLETED,
        title: `Completed goal: ${updated.title}`,
        description: `Successfully completed ${updated.category.toLowerCase().replace('_', ' ')} goal`,
        timestamp: new Date().toISOString(),
        relatedEntityId: updated.id,
        relatedEntityType: 'goal',
        isPublic: updated.isPublic,
        iconType: 'trophy',
        color: 'yellow'
      });
    }
    
    return updated!;
  }

  async simulateCompleteGoal(goalId: string): Promise<Goal> {
    return this.simulateUpdateGoalProgress(goalId, 100);
  }

  async simulateGetGoalStats(userId: string): Promise<GoalStats> {
    await this.delay(300);
    const goals = MockDataStore.getGoals().filter(goal => goal.userId === userId);
    const completed = goals.filter(goal => goal.status === GoalStatus.COMPLETED);
    const inProgress = goals.filter(goal => goal.status === GoalStatus.IN_PROGRESS);
    const overdue = goals.filter(goal => {
      const dueDate = new Date(goal.dueDate);
      const now = new Date();
      return dueDate < now && goal.status !== GoalStatus.COMPLETED;
    });
    
    return {
      total: goals.length,
      completed: completed.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
      completionRate: goals.length > 0 ? (completed.length / goals.length) * 100 : 0,
      averageDaysToComplete: 30, // Mock data
      goalsThisMonth: goals.filter(goal => {
        const created = new Date(goal.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      goalsCompletedThisMonth: completed.filter(goal => {
        if (!goal.completedAt) return false;
        const completedDate = new Date(goal.completedAt);
        const now = new Date();
        return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
      }).length
    };
  }

  async simulateGetMentorAssignedGoals(mentorId: string): Promise<Goal[]> {
    await this.delay(400);
    return MockDataStore.getGoals().filter(goal => goal.mentorId === mentorId);
  }

  async simulateGetPublicGoals(filters?: GoalFilters): Promise<Goal[]> {
    await this.delay(400);
    let goals = MockDataStore.getGoals().filter(goal => goal.isPublic);
    
    if (filters) {
      if (filters.category && filters.category.length > 0) {
        goals = goals.filter(goal => filters.category!.includes(goal.category));
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        goals = goals.filter(goal => 
          goal.title.toLowerCase().includes(search) ||
          goal.description.toLowerCase().includes(search)
        );
      }
    }
    
    return goals;
  }

  // Skills service methods
  async simulateGetUserSkills(userId: string): Promise<UserSkill[]> {
    await this.delay(300);
    return MockDataStore.getUserSkills(userId);
  }

  // Learning activities service methods
  async simulateGetLearningActivities(userId: string): Promise<LearningActivity[]> {
    await this.delay(400);
    return MockDataStore.getLearningActivities(userId);
  }

  // Learning Activities simulation methods
  async simulateCreateLearningActivity(activityData: CreateLearningActivityRequest): Promise<LearningActivity> {
    await this.delay(500);
    
    const newActivity: LearningActivity = {
      id: Math.random().toString(36).substr(2, 9),
      userId: '1', // Current user
      type: activityData.type,
      title: activityData.title,
      description: activityData.description,
      status: ActivityStatus.NOT_STARTED,
      priority: ActivityPriority.MEDIUM,
      progress: 0,
      estimatedDuration: activityData.estimatedDuration,
      timeSpent: 0,
      relatedSkills: activityData.relatedSkills,
      relatedGoals: activityData.relatedGoals,
      resourceId: activityData.resourceId,
      eventId: activityData.eventId,
      tags: activityData.tags,
      dueDate: activityData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MockDataStore.addLearningActivity(newActivity);
    
    // Create recent activity
    MockDataStore.addRecentActivity({
      id: Math.random().toString(36).substr(2, 9),
      userId: '1',
      userName: 'John Doe',
      userRole: 'Mentee',
      type: RecentActivityType.LEARNING_ACTIVITY_CREATED,
      title: `Started learning activity: ${newActivity.title}`,
      description: `New ${newActivity.type.toLowerCase()} activity added to learning plan`,
      timestamp: new Date().toISOString(),
      relatedEntityId: newActivity.id,
      relatedEntityType: 'resource',
      metadata: {
        activityType: newActivity.type,
        estimatedDuration: newActivity.estimatedDuration
      },
      isPublic: true,
      iconType: 'book',
      color: 'blue'
    });
    
    return newActivity;
  }

  async simulateUpdateLearningActivity(activityId: string, updates: Partial<LearningActivity>): Promise<LearningActivity> {
    await this.delay(400);
    return MockDataStore.updateLearningActivity(activityId, updates);
  }

  async simulateCompleteLearningActivity(activityId: string, feedback?: ActivityFeedback): Promise<LearningActivity> {
    await this.delay(400);
    
    const completedActivity = MockDataStore.updateLearningActivity(activityId, {
      status: ActivityStatus.COMPLETED,
      progress: 100,
      completedAt: new Date().toISOString(),
      feedback,
      updatedAt: new Date().toISOString()
    });
    
    // Create recent activity
    MockDataStore.addRecentActivity({
      id: Math.random().toString(36).substr(2, 9),
      userId: '1',
      userName: 'John Doe',
      userRole: 'Mentee',
      type: RecentActivityType.LEARNING_COMPLETED,
      title: `Completed: ${completedActivity.title}`,
      description: `Successfully completed ${completedActivity.type.toLowerCase()} activity`,
      timestamp: new Date().toISOString(),
      relatedEntityId: completedActivity.id,
      relatedEntityType: 'resource',
      metadata: {
        activityType: completedActivity.type,
        rating: feedback?.rating
      },
      isPublic: true,
      iconType: 'check-circle',
      color: 'green'
    });
    
    return completedActivity;
  }

  async simulateGetLearningPaths(): Promise<LearningPath[]> {
    await this.delay(300);
    
    // Return sample learning paths
    return [
      {
        id: 'path-1',
        title: 'Frontend Development Mastery',
        description: 'Complete path to become a frontend expert',
        category: 'Technical',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: 2400, // 40 hours
        activities: ['act-1', 'act-2', 'act-3'],
        prerequisites: ['skill-1'],
        outcomes: ['React Expert', 'TypeScript Pro'],
        isPublic: true,
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // Recent activities service methods
  async simulateGetRecentActivities(limit?: number): Promise<RecentActivity[]> {
    await this.delay(300);
    return MockDataStore.getRecentActivities(limit);
  }

  async simulateDeleteActivity(activityId: string): Promise<void> {
    await this.delay(200);
    MockDataStore.deleteRecentActivity(activityId);
  }
}

// Export a singleton instance
export const frontendService = new FrontendService();
export default frontendService;
