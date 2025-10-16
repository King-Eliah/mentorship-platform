// Business validation rules and utilities
export class ValidationRules {
  static email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  }

  static password(value: string): string | null {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    return null;
  }

  static required(value: any, fieldName: string = 'Field'): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  }

  static minLength(value: string, min: number, fieldName: string = 'Field'): string | null {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  }

  static maxLength(value: string, max: number, fieldName: string = 'Field'): string | null {
    if (value && value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  }

  static phoneNumber(value: string): string | null {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (value && !phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  }

  static url(value: string): string | null {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
}

// Business rules for different entities
export class BusinessRules {
  static canUserCreateEvent(userRole: string): boolean {
    return ['ADMIN', 'MENTOR'].includes(userRole);
  }

  static canUserManageUsers(userRole: string): boolean {
    return userRole === 'ADMIN';
  }

  static canUserJoinGroup(userRole: string, groupType?: string): boolean {
    if (userRole === 'ADMIN') return true;
    if (groupType === 'MENTOR_ONLY') return userRole === 'MENTOR';
    return true;
  }

  static getMaxEventAttendees(eventType: string): number {
    switch (eventType) {
      case 'WORKSHOP': return 50;
      case 'SESSION': return 10;
      case 'GROUP_SESSION': return 20;
      default: return 25;
    }
  }

  static canUserEditEvent(userId: string, event: any, userRole: string): boolean {
    return userRole === 'ADMIN' || event.organizerId === userId;
  }

  static calculateEventDuration(startTime: string, endTime: string): number {
    return new Date(endTime).getTime() - new Date(startTime).getTime();
  }
}

// Form validation composer
export function validateForm<T extends Record<string, any>>(
  data: T, 
  rules: Record<keyof T, ((value: any) => string | null)[]>
): Record<keyof T, string[]> {
  const errors: Record<keyof T, string[]> = {} as any;

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field as keyof T];
    const fieldErrors: string[] = [];

    fieldRules.forEach((rule) => {
      const error = rule(data[field as keyof T]);
      if (error) {
        fieldErrors.push(error);
      }
    });

    if (fieldErrors.length > 0) {
      errors[field as keyof T] = fieldErrors;
    }
  });

  return errors;
}