import { frontendService } from './frontendService';
import { EventType, EventStatus, Event } from '../types';

export interface EventFilters {
  type?: EventType | 'all';
  status?: EventStatus | 'all';
  search?: string;
  sortBy?: string;
  page?: number;
  size?: number;
}

export interface CreateEventRequest {
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
  groupId?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
}

// Mock storage keys
const JOINED_EVENTS_KEY = 'mentorconnect_joined_events';
const EVENT_ATTENDEES_KEY = 'mentorconnect_event_attendees';

// Helper functions for localStorage persistence
const getJoinedEvents = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(JOINED_EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveJoinedEvents = (eventIds: string[]): void => {
  localStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(eventIds));
};

const getEventAttendees = (eventId: string): string[] => {
  try {
    const allAttendees = JSON.parse(localStorage.getItem(EVENT_ATTENDEES_KEY) || '{}');
    return allAttendees[eventId] || [];
  } catch {
    return [];
  }
};

const saveEventAttendees = (eventId: string, attendeeIds: string[]): void => {
  try {
    const allAttendees = JSON.parse(localStorage.getItem(EVENT_ATTENDEES_KEY) || '{}');
    allAttendees[eventId] = attendeeIds;
    localStorage.setItem(EVENT_ATTENDEES_KEY, JSON.stringify(allAttendees));
  } catch {
    // Handle storage errors gracefully
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const eventService = {
  async getEvents(_params: EventFilters): Promise<Event[]> {
    return frontendService.getEvents();
  },
  
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    return frontendService.createEvent(eventData);
  },
  
  async updateEvent(id: string, updates: UpdateEventRequest): Promise<Event> {
    return frontendService.updateEvent(id, updates);
  },
  
  async getEvent(id: string): Promise<Event> {
    return frontendService.getEvent(id);
  },

  async getEventById(id: string): Promise<Event> {
    return frontendService.getEvent(id);
  },

  // Mock implementations for event operations
  async joinEvent(eventId: string, userId: string): Promise<void> {
    await delay(300); // Simulate network delay
    
    // Occasionally simulate errors for testing error handling
    if (Math.random() < 0.1) {
      throw new Error('Failed to join event. Please try again.');
    }
    
    const joinedEvents = getJoinedEvents();
    if (!joinedEvents.includes(eventId)) {
      joinedEvents.push(eventId);
      saveJoinedEvents(joinedEvents);
    }
    
    const attendees = getEventAttendees(eventId);
    if (!attendees.includes(userId)) {
      attendees.push(userId);
      saveEventAttendees(eventId, attendees);
    }
    
    console.log(`✓ User ${userId} joined event ${eventId}`);
  },

  async leaveEvent(eventId: string, userId: string): Promise<void> {
    await delay(300);
    
    if (Math.random() < 0.1) {
      throw new Error('Failed to leave event. Please try again.');
    }
    
    const joinedEvents = getJoinedEvents();
    const updatedJoined = joinedEvents.filter(id => id !== eventId);
    saveJoinedEvents(updatedJoined);
    
    const attendees = getEventAttendees(eventId);
    const updatedAttendees = attendees.filter(id => id !== userId);
    saveEventAttendees(eventId, updatedAttendees);
    
    console.log(`✓ User ${userId} left event ${eventId}`);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await delay(500);
    
    if (Math.random() < 0.1) {
      throw new Error('Failed to delete event. Please try again.');
    }
    
    // Remove from joined events
    const joinedEvents = getJoinedEvents();
    const updatedJoined = joinedEvents.filter(id => id !== eventId);
    saveJoinedEvents(updatedJoined);
    
    // Remove attendees data
    try {
      const allAttendees = JSON.parse(localStorage.getItem(EVENT_ATTENDEES_KEY) || '{}');
      delete allAttendees[eventId];
      localStorage.setItem(EVENT_ATTENDEES_KEY, JSON.stringify(allAttendees));
    } catch {
      // Handle storage errors gracefully
    }
    
    console.log(`✓ Event ${eventId} deleted`);
  },

  async getEventAttendees(eventId: string): Promise<string[]> {
    await delay(200);
    
    if (Math.random() < 0.05) {
      throw new Error('Failed to fetch attendees. Please try again.');
    }
    
    return getEventAttendees(eventId);
  },

  // Helper method to check if user has joined an event
  hasUserJoinedEvent(eventId: string): boolean {
    const joinedEvents = getJoinedEvents();
    return joinedEvents.includes(eventId);
  },

  // Helper method to get attendee count
  getAttendeeCount(eventId: string): number {
    return getEventAttendees(eventId).length;
  },

  // Get all joined events for the current user
  async getJoinedEvents(): Promise<Event[]> {
    await delay(300);
    
    const joinedEventIds = getJoinedEvents();
    const allEvents = await frontendService.getEvents();
    
    // Filter events to only those the user has joined
    return allEvents.filter(event => joinedEventIds.includes(event.id));
  }
};