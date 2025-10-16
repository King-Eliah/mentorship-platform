import { User, Event, MentorGroup, Role, EventStatus, UserStatus } from '../types';

// Data transformation utilities
export class DataTransformers {
  static formatUserForDisplay(user: User) {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      displayRole: this.formatRole(user.role),
      statusBadge: this.getStatusBadge(user.status),
      joinedDate: new Date(user.createdAt).toLocaleDateString(),
      isOnline: this.calculateOnlineStatus(user.updatedAt),
    };
  }

  static formatEventForDisplay(event: Event) {
    return {
      ...event,
      formattedDate: new Date(event.scheduledAt).toLocaleDateString(),
      formattedTime: new Date(event.scheduledAt).toLocaleTimeString(),
      durationText: `${event.duration} minutes`,
      statusBadge: this.getEventStatusBadge(event.status),
      isUpcoming: new Date(event.scheduledAt) > new Date(),
      attendeeCount: event.attendees?.length || 0,
      spotsRemaining: (event.maxAttendees || 0) - (event.attendees?.length || 0),
    };
  }

  static formatGroupForDisplay(group: MentorGroup) {
    return {
      ...group,
      memberCount: group.members?.length || 0,
      spotsRemaining: (group.maxMembers || 0) - (group.members?.length || 0),
      createdDate: new Date(group.createdAt).toLocaleDateString(),
      isFull: (group.members?.length || 0) >= (group.maxMembers || 0),
    };
  }

  private static formatRole(role: Role): string {
    switch (role) {
      case Role.ADMIN: return 'Administrator';
      case Role.MENTOR: return 'Mentor';
      case Role.MENTEE: return 'Mentee';
      case Role.PENDING: return 'Pending Approval';
      default: return role;
    }
  }

  private static getStatusBadge(status: UserStatus) {
    const badges = {
      [UserStatus.ACTIVE]: { color: 'green', text: 'Active' },
      [UserStatus.PENDING]: { color: 'yellow', text: 'Pending' },
      [UserStatus.SUSPENDED]: { color: 'red', text: 'Suspended' },
      [UserStatus.REJECTED]: { color: 'gray', text: 'Rejected' },
    };
    return badges[status] || { color: 'gray', text: 'Unknown' };
  }

  private static getEventStatusBadge(status: EventStatus) {
    const badges = {
      [EventStatus.SCHEDULED]: { color: 'blue', text: 'Scheduled' },
      [EventStatus.COMPLETED]: { color: 'green', text: 'Completed' },
      [EventStatus.CANCELLED]: { color: 'red', text: 'Cancelled' },
    };
    return badges[status] || { color: 'gray', text: 'Unknown' };
  }

  private static calculateOnlineStatus(lastUpdated: string): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastUpdated) > fiveMinutesAgo;
  }
}

// Advanced filtering and sorting utilities
export class DataFilters {
  static filterUsers(users: User[], filters: {
    search?: string;
    role?: string;
    status?: string;
    isOnline?: boolean;
  }) {
    return users.filter(user => {
      const matchesSearch = !filters.search || 
        user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRole = !filters.role || filters.role === 'ALL' || user.role === filters.role;
      const matchesStatus = !filters.status || filters.status === 'ALL' || user.status === filters.status;
      const matchesOnline = filters.isOnline === undefined || 
        DataTransformers.formatUserForDisplay(user).isOnline === filters.isOnline;

      return matchesSearch && matchesRole && matchesStatus && matchesOnline;
    });
  }

  static sortUsers(users: User[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
    const sorted = [...users].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  static paginateData<T>(data: T[], page: number, pageSize: number) {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / pageSize),
      currentPage: page,
      totalItems: data.length,
      hasNext: endIndex < data.length,
      hasPrev: page > 0,
    };
  }
}

// Performance optimization utilities
export class DataOptimizers {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
}