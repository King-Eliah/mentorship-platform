import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserMinus,
  Tag
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { Card } from '../components/ui/Card';
import { ActionDropdown, createViewAction, createEditAction, createDeleteAction } from '../components/ui/ActionDropdown';
import { DetailsModal } from '../components/ui/DetailsModal';
import { ConfirmModal } from '../components/ui/Modal';
import { CreateEventForm } from '../components/events/CreateEventForm';
import { EditEventForm } from '../components/events/EditEventForm';
import { EventType, EventStatus, Role, Event as TypesEvent } from '../types';
import { useEvents, useEvent, useEventOperations } from '../hooks/useEvents';
import { EventFilters, Event as ServiceEvent } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingDetailsModal, setPendingDetailsModal] = useState(false);
  const [pendingEditForm, setPendingEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  
  // Check if user can create events (admins and mentors only)
  const canCreateEvent = user?.role === Role.ADMIN || user?.role === Role.MENTOR;
  
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    type: 'all',
    status: 'all',
    sortBy: 'date',
    page: 0,
    limit: 20
  });

  const {
    items: events,
    loading: eventsLoading,
    error: eventsError,
    hasMore,
    loadPage,
    refresh: refreshEvents,
    retry: retryEvents
  } = useEvents(filters);

  const {
    data: selectedEvent,
    loading: selectedEventLoading
  } = useEvent(selectedEventId || '');

  // Cast events to proper type
  const typedEvents = (events || []) as ServiceEvent[];

  const {
    deleteEvent,
    joinEvent,
    leaveEvent,
    loading: operationLoading,
  } = useEventOperations();

  // Check if current user has joined an event
  const isEventJoined = (event: ServiceEvent) => {
    if (!user?.id || !event.attendees) return false;
    return event.attendees.some(attendee => attendee.userId === user.id);
  };

  // Initial load - only once on mount
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filters change (but not on initial mount)
  useEffect(() => {
    if (initialLoadDone.current) {
      loadPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status, filters.sortBy]);

  // Open modals once event data is loaded
  useEffect(() => {
    if (selectedEvent && !selectedEventLoading) {
      if (pendingDetailsModal) {
        setShowDetailsModal(true);
        setPendingDetailsModal(false);
      }
      if (pendingEditForm) {
        setShowEditForm(true);
        setPendingEditForm(false);
      }
    }
  }, [selectedEvent, selectedEventLoading, pendingDetailsModal, pendingEditForm]);

  // Debounced search
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
    const debounceTimer = setTimeout(() => {
        loadPage(0);
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev: EventFilters) => ({
      ...prev,
      [key]: value,
      page: 0
    }));
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refreshEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setShowDeleteModal(false);
      setEventToDelete(null);
      refreshEvents();
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event.');
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await joinEvent(eventId);
      refreshEvents();
      toast.success('Successfully joined the event!');
    } catch (error) {
      console.error('Failed to join event:', error);
      toast.error('Failed to join event.');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
      refreshEvents();
      toast.success('Successfully left the event!');
    } catch (error) {
      console.error('Failed to leave event:', error);
      toast.error('Failed to leave event.');
    }
  };

  const handleViewDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setPendingDetailsModal(true);
  };

  const handleEditEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setPendingEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setSelectedEventId(null);
    refreshEvents();
  };

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const loadMoreEvents = () => {
    if (hasMore && !eventsLoading) {
      loadPage(filters.page! + 1);
    }
  };

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case EventStatus.UPCOMING:
        return <Clock className="w-4 h-4 text-blue-500" />;
      case EventStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case EventStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const eventTypeOptions = [
    { value: 'all', label: 'All Types', icon: <Calendar className="w-4 h-4" />, description: 'Show all event types' },
    { value: EventType.WORKSHOP, label: 'Workshop', icon: <Users className="w-4 h-4" />, description: 'Interactive learning sessions' },
    { value: EventType.MENTORING_SESSION, label: 'Mentoring Session', icon: <Clock className="w-4 h-4" />, description: '1-on-1 mentoring sessions' },
    { value: EventType.WEBINAR, label: 'Webinar', icon: <UserCheck className="w-4 h-4" />, description: 'Online presentations' },
    { value: EventType.NETWORKING, label: 'Networking', icon: <Users className="w-4 h-4" />, description: 'Networking events' },
    { value: EventType.SOCIAL, label: 'Social', icon: <Users className="w-4 h-4" />, description: 'Social gatherings' },
    { value: EventType.OTHER, label: 'Other', icon: <Tag className="w-4 h-4" />, description: 'Other events' },
  ];

  const eventStatusOptions = [
    { value: 'all', label: 'All Status', icon: <RefreshCw className="w-4 h-4" />, description: 'Show all event statuses' },
    { value: EventStatus.UPCOMING, label: 'Upcoming', icon: <Calendar className="w-4 h-4" />, description: 'Upcoming events' },
    { value: EventStatus.ONGOING, label: 'Ongoing', icon: <Clock className="w-4 h-4" />, description: 'Currently happening' },
    { value: EventStatus.COMPLETED, label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, description: 'Finished events' },
    { value: EventStatus.CANCELLED, label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, description: 'Cancelled events' },
  ];

  const sortByOptions = [
    { value: 'date', label: 'Sort by Date', icon: <Calendar className="w-4 h-4" />, description: 'Order by event date' },
    { value: 'title', label: 'Sort by Title', icon: <Search className="w-4 h-4" />, description: 'Order alphabetically' },
    { value: 'attendees', label: 'Sort by Attendance', icon: <Users className="w-4 h-4" />, description: 'Order by participant count' },
  ];

  if (eventsError && !eventsLoading) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <Card className={`p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Failed to Load Events
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We couldn't fetch the events. Please try again.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={retryEvents} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-lg shadow-sm p-4 sm:p-6 mb-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start mb-6 gap-3 xs:gap-0">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Events</h1>
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {canCreateEvent 
                  ? 'Manage and participate in mentorship events' 
                  : 'Discover and join mentorship events'}
              </p>
            </div>
            <div className="flex gap-2 w-full xs:w-auto">
              <Button 
                onClick={refreshEvents}
                variant="outline"
                disabled={eventsLoading}
                className="flex-1 xs:flex-none text-xs sm:text-sm"
              >
                <RefreshCw className={`w-3 sm:w-4 h-3 sm:h-4 ${eventsLoading ? 'animate-spin' : ''}`} />
              </Button>
              {canCreateEvent && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex-1 xs:flex-none bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                >
                  <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  <span className="hidden xs:inline">Create</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3 sm:w-4 h-3 sm:h-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <DropdownSelect
              placeholder="Type"
              options={eventTypeOptions}
              onChange={(value) => handleFilterChange('type', value)}
              value={filters.type}
            />

            <DropdownSelect
              placeholder="Status" 
              options={eventStatusOptions}
              onChange={(value) => handleFilterChange('status', value)}
              value={filters.status}
            />

            <DropdownSelect
              placeholder="Sort"
              options={sortByOptions}
              onChange={(value) => handleFilterChange('sortBy', value)}
              value={filters.sortBy}
            />
          </div>
        </div>

        {eventsLoading && typedEvents.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className={`p-4 sm:p-6 animate-pulse ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`h-4 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-3 rounded w-3/4 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </Card>
            ))}
          </div>
        )}

        {typedEvents.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {typedEvents.map((event) => (
                <Card key={event.id} className={`p-4 sm:p-6 hover:shadow-md transition-shadow ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(event.status)}
                      <span className={`text-xs sm:text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {event.status.replace('_', ' ')}
                      </span>
                    </div>
                    <ActionDropdown
                      actions={[
                        createViewAction(() => handleViewDetails(event.id)),
                        ...(canCreateEvent ? [
                          createEditAction(() => handleEditEvent(event.id)),
                          createDeleteAction(() => handleDeleteClick(event.id))
                        ] : [])
                      ]}
                      size="sm"
                    />
                  </div>

                  <h3 className={`font-semibold text-base sm:text-lg mb-2 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {event.title}
                  </h3>
                  
                  <p className={`text-xs sm:text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {event.description}
                  </p>

                  <div className={`space-y-2 text-xs sm:text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(event.scheduledAt || event.startTime)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {event.attendees?.length || 0}
                        {event.maxAttendees && `/${event.maxAttendees}`} attendees
                      </span>
                    </div>

                    {event.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                        <span>{event.duration} min</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(event.id)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      View
                    </Button>
                    
                    {event.status === EventStatus.UPCOMING && (
                      isEventJoined(event) ? (
                        <Button
                          size="sm"
                          onClick={() => handleLeaveEvent(event.id)}
                          disabled={operationLoading}
                          className="flex-1 xs:flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                        >
                          <UserMinus className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden xs:inline">Leave</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleJoinEvent(event.id)}
                          disabled={operationLoading}
                          className="flex-1 xs:flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                        >
                          <UserCheck className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          <span className="hidden xs:inline">Join</span>
                        </Button>
                      )
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMoreEvents}
                  disabled={eventsLoading}
                  variant="outline"
                  className="px-8"
                >
                  {eventsLoading ? 'Loading...' : 'Load More Events'}
                </Button>
              </div>
            )}
          </>
        )}

        {!eventsLoading && typedEvents.length === 0 && (
          <Card className={`p-12 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Events Found</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {filters.search || filters.type !== 'all' || filters.status !== 'all' 
                ? 'Try adjusting your filters to see more events.'
                : canCreateEvent 
                  ? 'No events have been created yet. Create the first one!'
                  : 'No events are currently available.'}
            </p>
            {canCreateEvent && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </Card>
        )}

        {showCreateForm && (
          <CreateEventForm
            onSuccess={handleCreateSuccess}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {showEditForm && selectedEvent && (
          <EditEventForm
            event={selectedEvent}
            onSuccess={handleEditSuccess}
            onClose={() => {
              setShowEditForm(false);
              setSelectedEventId(null);
            }}
          />
        )}

        {showDetailsModal && selectedEvent && (
          <DetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedEventId(null);
            }}
            data={{
              ...selectedEvent,
              scheduledAt: selectedEvent.scheduledAt || selectedEvent.startTime,
              organizerId: selectedEvent.organizerId || selectedEvent.creatorId,
              currentAttendees: selectedEvent.attendees?.length || 0
            } as unknown as TypesEvent}
            type="event"
            isJoined={isEventJoined(selectedEvent)}
            onJoin={() => handleJoinEvent(selectedEvent.id)}
            onLeave={() => handleLeaveEvent(selectedEvent.id)}
          />
        )}

        {showDeleteModal && eventToDelete && (
          <ConfirmModal
            isOpen={showDeleteModal}
            title="Delete Event"
            message="Are you sure you want to delete this event? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDeleteEvent(eventToDelete)}
            onClose={() => {
              setShowDeleteModal(false);
              setEventToDelete(null);
            }}
            variant="danger"
          />
        )}
      </div>
    </div>
  );
}