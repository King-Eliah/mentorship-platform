import { useState, useEffect } from 'react';
import { Event } from '../types';
import { frontendService } from '../services/frontendService';

// Simple hook for fetching events
export function useEvents(filters?: {
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const allEvents = await frontendService.getEvents();
      
      // Apply basic filtering
      let filteredEvents = allEvents;
      
      if (filters?.search) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          event.description?.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.type && filters.type !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      
      if (filters?.status && filters.status !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }
      
      // Apply sorting
      if (filters?.sortBy === 'date') {
        filteredEvents.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      }
      
      setEvents(filteredEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filters?.search, filters?.type, filters?.status, filters?.sortBy]);

  return {
    items: events,
    loading,
    error,
    loadPage: loadEvents,
    refresh: loadEvents,
    retry: loadEvents,
    hasMore: false
  };
}

// Hook for fetching a single event
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedEvent = await frontendService.getEvent(eventId);
        setEvent(fetchedEvent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  return { data: event, loading, error, execute: () => {} };
}

// Hook for creating events
export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newEvent = await frontendService.createEvent(eventData);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate: createEvent,
    loading,
    error
  };
}

// Hook for updating events
export function useUpdateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await frontendService.updateEvent(eventId, updates);
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate: updateEvent,
    loading,
    error
  };
}

// Hook for deleting events
export function useDeleteEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      // For now, just simulate deletion (eventId would be used in real implementation)
      console.log('Deleting event:', eventId);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate: deleteEvent,
    loading,
    error
  };
}