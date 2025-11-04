import { api } from './api';
import { EventType, EventStatus } from '../types';

export interface EventFilters {
  type?: EventType | 'all';
  status?: EventStatus | 'all';
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  maxAttendees?: number;
  type: EventType;
  isPublic?: boolean;
  groupId?: string;
  attachments?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  maxAttendees?: number;
  type?: EventType;
  isPublic?: boolean;
  groupId?: string;
}

export interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  type: EventType;
  status: EventStatus;
  maxAttendees?: number;
  isPublic: boolean;
  creatorId: string;
  groupId?: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  attendees: EventAttendee[];
  createdAt: string;
  updatedAt: string;
  // Compatibility fields for legacy frontend components
  // scheduledAt mirrors startTime; organizerId mirrors creatorId
  scheduledAt?: string;
  organizerId?: string;
  // Optional duration in minutes derived from start/end
  duration?: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const eventService = {
  /**
   * Get all events with optional filters
   */
  async getEvents(params: EventFilters = {}): Promise<Event[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.type && params.type !== 'all') queryParams.type = params.type;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.page) queryParams.page = params.page.toString();
    if (params.limit) queryParams.limit = params.limit.toString();

    const response = await api.get<EventsResponse>('/events', queryParams);
    // Map backend fields to include compatibility properties
    return response.events.map(e => ({
      ...e,
      scheduledAt: e.startTime,
      organizerId: e.creatorId,
      duration: e.startTime && e.endTime
        ? Math.max(0, Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000))
        : undefined,
    }));
  },

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<Event> {
    const response = await api.get<{ event: Event }>(`/events/${id}`);
    const e = response.event;
    return {
      ...e,
      scheduledAt: e.startTime,
      organizerId: e.creatorId,
      duration: e.startTime && e.endTime
        ? Math.max(0, Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000))
        : undefined,
    };
  },

  /**
   * Get event by ID (alias for compatibility)
   */
  async getEventById(id: string): Promise<Event> {
    return this.getEvent(id);
  },

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await api.post<{ event: Event }>('/events', eventData);
    return response.event;
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, updates: UpdateEventRequest): Promise<Event> {
    const response = await api.put<{ event: Event }>(`/events/${id}`, updates);
    return response.event;
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}`);
  },

  /**
   * Register/join an event
   */
  async joinEvent(eventId: string): Promise<void> {
    await api.post(`/events/${eventId}/register`);
  },

  /**
   * Cancel registration/leave an event
   */
  async leaveEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}/register`);
  },

  /**
   * Get events the current user has joined
   */
  async getJoinedEvents(): Promise<Event[]> {
    const response = await api.get<EventsResponse>('/events/joined');
    
    // Map backend fields to include compatibility properties
    return response.events.map(e => ({
      ...e,
      scheduledAt: e.startTime,
      organizerId: e.creatorId,
      duration: e.startTime && e.endTime
        ? Math.max(0, Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000))
        : undefined,
    }));
  },

  /**
   * Get events for a specific user by ID (for mentors viewing mentee's events)
   */
  async getUserEvents(userId: string): Promise<Event[]> {
    const response = await api.get<EventsResponse>(`/events/user/${userId}`);
    
    // Map backend fields to include compatibility properties
    return response.events.map(e => ({
      ...e,
      scheduledAt: e.startTime,
      organizerId: e.creatorId,
      duration: e.startTime && e.endTime
        ? Math.max(0, Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000))
        : undefined,
    }));
  },

  /**
   * Get attendees for a specific event
   */
  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    const event = await this.getEvent(eventId);
    return event.attendees;
  },

  /**
   * Check if user has joined an event
   */
  hasUserJoinedEvent(event: Event, userId: string): boolean {
    return event.attendees.some(
      attendee => attendee.userId === userId && attendee.status === 'CONFIRMED'
    );
  },

  /**
   * Get attendee count for an event
   */
  getAttendeeCount(event: Event): number {
    return event.attendees.filter(a => a.status === 'CONFIRMED').length;
  },
};