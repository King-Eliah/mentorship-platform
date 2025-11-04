import { useEffect, useState, useCallback } from 'react';
import { useApiService, useMutation } from './useApiService';
import { eventService, EventFilters, CreateEventRequest, UpdateEventRequest, Event } from '../services/eventService';

/**
 * Hook for fetching events with filters and pagination-like interface
 */
export function useEvents(filters: EventFilters = {}) {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  
  const api = useApiService(
    () => eventService.getEvents(filters),
    {
      loadingInitial: false,
      showErrorToast: true
    }
  );

  // Update allEvents when data changes
  useEffect(() => {
    if (api.data && Array.isArray(api.data)) {
      setAllEvents(api.data);
    }
  }, [api.data]);

  const loadPage = useCallback((page: number) => {
    setCurrentPage(page);
    return api.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    return api.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate pagination
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const items = allEvents.slice(0, endIndex); // Show all items up to current page
  const hasMore = endIndex < allEvents.length;

  return {
    items,
    loading: api.loading,
    error: api.error,
    hasMore,
    loadPage,
    refresh,
    retry: api.retry
  };
}

/**
 * Hook for fetching a single event by ID
 */
export function useEvent(eventId: string) {
  const api = useApiService(
    () => eventService.getEventById(eventId),
    { showErrorToast: true }
  );

  useEffect(() => {
    if (eventId) {
      api.execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return api;
}

/**
 * Hook for fetching current user's events
 */
export function useMyEvents() {
  return useApiService(
    () => eventService.getEvents({}), // Use getEvents with empty filters as fallback
    {
      loadingInitial: true,
      showErrorToast: true
    }
  );
}

/**
 * Hook for fetching joined events
 */
export function useJoinedEvents() {
  return useApiService(
    () => eventService.getJoinedEvents(),
    {
      loadingInitial: true,
      showErrorToast: true
    }
  );
}

/**
 * Hook for creating a new event
 */
export function useCreateEvent() {
  return useMutation(
    (eventData: CreateEventRequest) => eventService.createEvent(eventData),
    {
      showSuccessToast: true,
      showErrorToast: true,
      onSuccess: () => {
        // Optionally refresh events list or redirect
        console.log('Event created successfully');
      }
    }
  );
}

/**
 * Hook for updating an event
 */
export function useUpdateEvent() {
  return useMutation(
    (data: { eventId: string; updates: UpdateEventRequest }) => 
      eventService.updateEvent(data.eventId, data.updates),
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );
}

/**
 * Hook for deleting an event
 */
export function useDeleteEvent() {
  return useMutation(
    (eventId: string) => eventService.deleteEvent(eventId),
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );
}

/**
 * Hook for joining an event
 */
export function useJoinEvent() {
  return useMutation(
    (eventId: string) => eventService.joinEvent(eventId),
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );
}

/**
 * Hook for leaving an event
 */
export function useLeaveEvent() {
  return useMutation(
    (eventId: string) => eventService.leaveEvent(eventId),
    {
      showSuccessToast: true,
      showErrorToast: true
    }
  );
}

/**
 * Hook for getting event attendees
 */
export function useEventAttendees(eventId: string) {
  const api = useApiService(
    () => eventService.getEventAttendees(eventId),
    { showErrorToast: true }
  );

  useEffect(() => {
    if (eventId) {
      api.execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return api;
}

/**
 * Comprehensive hook that provides all event operations
 */
export function useEventOperations() {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const joinEvent = useJoinEvent();
  const leaveEvent = useLeaveEvent();

  return {
    createEvent,
    updateEvent,
    deleteEvent: deleteEvent.mutate,
    joinEvent: joinEvent.mutate,
    leaveEvent: leaveEvent.mutate,
    loading: createEvent.loading || updateEvent.loading || deleteEvent.loading || joinEvent.loading || leaveEvent.loading
  };
}