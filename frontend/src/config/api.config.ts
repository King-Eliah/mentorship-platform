// API Configuration
console.log('API Config - VITE_API_URL:', import.meta.env.VITE_API_URL);
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REQUEST_INVITATION: '/auth/request-invitation',
  },
  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    BY_ID: (id: string) => `/users/${id}`,
  },
  // Event endpoints
  EVENTS: {
    BASE: '/events',
    BY_ID: (id: string) => `/events/${id}`,
    REGISTER: (id: string) => `/events/${id}/register`,
    UNREGISTER: (id: string) => `/events/${id}/unregister`,
  },
  // Goal endpoints
  GOALS: {
    BASE: '/goals',
    BY_ID: (id: string) => `/goals/${id}`,
  },
  // Group endpoints
  GROUPS: {
    BASE: '/groups',
    BY_ID: (id: string) => `/groups/${id}`,
    JOIN: (id: string) => `/groups/${id}/join`,
    LEAVE: (id: string) => `/groups/${id}/leave`,
  },
  // Message endpoints
  MESSAGES: {
    BASE: '/messages',
    BY_ID: (id: string) => `/messages/${id}`,
  },
  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    INVITATIONS: '/admin/invitations',
    GENERATE_INVITATION_CODE: '/admin/generate-invitation-code',
    APPROVE_INVITATION: (id: string) => `/admin/invitations/${id}/approve`,
    REJECT_INVITATION: (id: string) => `/admin/invitations/${id}/reject`,
    ANALYTICS: '/admin/analytics',
  },
};
