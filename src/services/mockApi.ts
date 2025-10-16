import { User, Event, Message, Notification, DashboardStats, Role, EventType, EventStatus, MessageType, NotificationType } from '../types';

/**
 * Enhanced Mock API service for standalone frontend development
 * This provides utility functions for generating mock data and simulating API responses
 */
class MockApiService {

  constructor() {
    // No longer extending ApiService since we're standalone
  }

  // Utility method for simulating network delays
  static delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

  // Mock data generators - these can be used by any service for testing
  static generateMockUsers = (count: number): User[] => {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'Alex', 'Emma', 'David', 'Lisa', 'Tom', 'Anna', 'Chris', 'Maria', 'Paul', 'Jennifer', 'Mark', 'Amy'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor'];
    const skills = [
      'JavaScript, React, Node.js', 
      'Python, Django, Machine Learning', 
      'Java, Spring Boot, Microservices',
      'C#, .NET, Azure',
      'TypeScript, Angular, GraphQL',
      'PHP, Laravel, MySQL',
      'Go, Kubernetes, DevOps',
      'Ruby, Rails, PostgreSQL',
      'Data Science, R, Statistics',
      'UI/UX Design, Figma, Product Strategy'
    ];
    const experiences = [
      'Software Engineer',
      'Senior Developer', 
      'Team Lead',
      'Product Manager',
      'Data Scientist',
      'DevOps Engineer',
      'UI/UX Designer',
      'Full Stack Developer',
      'Backend Engineer',
      'Frontend Developer'
    ];
    const bios = [
      'Passionate about building scalable applications and mentoring junior developers.',
      'Experienced in full-stack development with a focus on user experience.',
      'Data enthusiast with expertise in machine learning and analytics.',
      'Product-focused engineer who enjoys solving complex technical challenges.',
      'Creative problem solver with a background in both design and development.',
      'DevOps specialist helping teams deliver software more efficiently.',
      'Mentor dedicated to helping others grow their technical and professional skills.',
      'Senior engineer with experience leading cross-functional teams.',
      'Full-stack developer passionate about clean code and best practices.',
      'Technical leader focused on building inclusive and productive teams.'
    ];

    return Array.from({ length: count }, (_, i) => {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const skillSet = skills[i % skills.length];
      const experience = experiences[i % experiences.length];
      const bio = bios[i % bios.length];
      
      return {
        id: `user-${i + 1}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        firstName,
        lastName,
        role: [Role.ADMIN, Role.MENTOR, Role.MENTEE][i % 3],
        isActive: Math.random() > 0.15, // 85% active users
        bio,
        skills: skillSet,
        experience: `${Math.floor(Math.random() * 8) + 2} years as ${experience}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Within last year
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Within last month
      };
    });
  };

  static generateMockEvents = (count: number): Event[] => {
    const titles = [
      'React Fundamentals Workshop',
      'Mentoring Best Practices',
      'Career Development Session',
      'Technical Interview Prep',
      'Leadership Skills Workshop',
      'Code Review Session'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `event-${i + 1}`,
      title: titles[i % titles.length],
      description: `Detailed description for ${titles[i % titles.length]}`,
      scheduledAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60 + Math.floor(Math.random() * 120),
      location: Math.random() > 0.5 ? `Room ${100 + i}` : 'Online',
      maxAttendees: 10 + Math.floor(Math.random() * 20),
      type: [EventType.WORKSHOP, EventType.SESSION, EventType.GROUP_SESSION][i % 3],
      status: [EventStatus.SCHEDULED, EventStatus.COMPLETED][Math.floor(Math.random() * 2)],
      organizerId: `user-${Math.floor(Math.random() * 10) + 1}`,
      groupId: Math.random() > 0.5 ? `group-${Math.floor(Math.random() * 5) + 1}` : undefined,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  static generateMockMessages = (count: number): Message[] => {
    const contents = [
      'Great session today! Thanks for the insights.',
      'Can we schedule a follow-up meeting next week?',
      'I\'ve completed the assignment you gave me.',
      'Looking forward to our next session.',
      'Could you review my project proposal?',
      'Thanks for the feedback on my presentation.'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `message-${i + 1}`,
      senderId: `user-${Math.floor(Math.random() * 10) + 1}`,
      recipientId: `user-${Math.floor(Math.random() * 10) + 1}`,
      content: contents[i % contents.length],
      type: MessageType.TEXT,
      isRead: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  static generateMockNotifications = (count: number): Notification[] => {
    const titles = [
      'New Message Received',
      'Event Reminder',
      'System Maintenance',
      'Feedback Request'
    ];

    const messages = [
      'You have received a new message from your mentor.',
      'Don\'t forget about your session tomorrow at 3 PM.',
      'System will be under maintenance tonight.',
      'Please provide feedback for your recent session.'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `notification-${i + 1}`,
      userId: `user-1`, // Current user
      type: [NotificationType.MESSAGE, NotificationType.EVENT, NotificationType.SYSTEM, NotificationType.FEEDBACK][i % 4],
      title: titles[i % titles.length],
      message: messages[i % messages.length],
      isRead: Math.random() > 0.4,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

    static generateDashboardStats = (): DashboardStats => ({
      totalUsers: Math.floor(Math.random() * 100) + 50,
      totalMentors: Math.floor(Math.random() * 30) + 10,
      totalMentees: Math.floor(Math.random() * 50) + 20,
      activeSessions: Math.floor(Math.random() * 20) + 5,
      completedSessions: Math.floor(Math.random() * 150) + 100,
      upcomingEvents: Math.floor(Math.random() * 10) + 3,
      // Legacy fields for backward compatibility
      activeMentors: Math.floor(Math.random() * 30) + 10,
      totalMessages: Math.floor(Math.random() * 1000) + 500,
      scheduledEvents: Math.floor(Math.random() * 10) + 3,
      messagesThisWeek: Math.floor(Math.random() * 50) + 10,
      messagesSent: Math.floor(Math.random() * 200) + 50,
      eventsAttended: Math.floor(Math.random() * 20) + 5,
    });

  // API endpoint simulation methods
  async simulateGetUsers(count: number = 10): Promise<User[]> {
    await MockApiService.delay(800);
    return MockApiService.generateMockUsers(count);
  }

  async simulateGetEvents(count: number = 5): Promise<Event[]> {
    await MockApiService.delay(600);
    return MockApiService.generateMockEvents(count);
  }

  async simulateGetMessages(count: number = 20): Promise<Message[]> {
    await MockApiService.delay(500);
    return MockApiService.generateMockMessages(count);
  }

  async simulateGetNotifications(count: number = 10): Promise<Notification[]> {
    await MockApiService.delay(400);
    return MockApiService.generateMockNotifications(count);
  }

  async simulateGetDashboardStats(): Promise<DashboardStats> {
    await MockApiService.delay(300);
    return MockApiService.generateDashboardStats();
  }

  // Error simulation methods
  async simulateNetworkError(): Promise<never> {
    await MockApiService.delay(5000);
    throw {
      message: 'Network error occurred',
      status: 0,
    };
  }

  async simulateServerError(): Promise<never> {
    await MockApiService.delay(1000);
    throw {
      message: 'Internal server error',
      status: 500,
    };
  }

  async simulateAuthError(): Promise<never> {
    await MockApiService.delay(500);
    throw {
      message: 'Authentication required',
      status: 401,
    };
  }

  async simulateValidationError(field: string = 'field'): Promise<never> {
    await MockApiService.delay(300);
    throw {
      message: `Validation error: ${field} is required`,
      status: 422,
    };
  }

  // Utility methods for testing API responses
  createMockApiResponse<T>(data: T, message?: string) {
    return { data, message };
  }

  createMockPaginatedResponse<T>(
    data: T[], 
    page: number = 1, 
    limit: number = 10, 
    total?: number
  ) {
    const actualTotal = total || data.length;
    return {
      data,
      pagination: {
        page,
        limit,
        total: actualTotal,
        totalPages: Math.ceil(actualTotal / limit),
        hasNext: page * limit < actualTotal,
        hasPrev: page > 1,
      },
      success: true,
    };
  }

  // File simulation methods
  createMockFile(name: string, content: string, type: string = 'text/plain'): File {
    const blob = new Blob([content], { type });
    return new File([blob], name, { type });
  }

  async simulateFileUpload(file: File, progressCallback?: (progress: number) => void): Promise<{
    url: string;
    filename: string;
    size: number;
  }> {
    // Simulate upload progress
    if (progressCallback) {
      for (let i = 0; i <= 100; i += 10) {
        await MockApiService.delay(100);
        progressCallback(i);
      }
    } else {
      await MockApiService.delay(2000);
    }

    return {
      url: `https://example.com/uploads/${file.name}`,
      filename: file.name,
      size: file.size,
    };
  }
}

// Export both the class and a singleton instance
export const mockApiService = new MockApiService();

// Maintain backward compatibility with the original mockApi export
export const mockApi = {
  delay: MockApiService.delay,
  generateMockUsers: MockApiService.generateMockUsers,
  generateMockEvents: MockApiService.generateMockEvents,
  generateMockMessages: MockApiService.generateMockMessages,
  generateMockNotifications: MockApiService.generateMockNotifications,
  generateDashboardStats: MockApiService.generateDashboardStats,
};

// Export the class for extending
export { MockApiService };