import { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { ActionDropdown, createViewAction, createEditAction, createDeleteAction } from '../components/ui/ActionDropdown';
import { DetailsModal } from '../components/ui/DetailsModal';
import { ConfirmModal } from '../components/ui/Modal';
import { CreateEventForm } from '../components/events/CreateEventForm';
import { EventType, EventStatus } from '../types';
import { useEvents, useEvent, useEventOperations } from '../hooks/useEvents';
import { EventFilters } from '../services/eventService';
import toast from 'react-hot-toast';

export default function EventsPageNew() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    type: 'all',
    status: 'all',
    sortBy: 'date',
    page: 0,
    size: 20
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
    execute: fetchEvent
  } = useEvent(selectedEventId || '');

  const {
    deleteEvent,
    joinEvent,
    loading: operationLoading,
  } = useEventOperations();

  useEffect(() => {
    loadPage(0);
  }, [filters.type, filters.status, filters.sortBy]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        loadPage(0);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.search]);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({
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



  const handleViewDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDetailsModal(true);
    fetchEvent();
  };

  const handleEditEvent = (eventId: string) => {
    console.log('Edit event:', eventId);
    toast('Edit functionality coming soon!');
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
      case EventStatus.SCHEDULED:
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
    { value: 'all', label: 'All Types' },
    { value: EventType.WORKSHOP, label: 'Workshop' },
    { value: EventType.SESSION, label: 'Session' },
    { value: EventType.GROUP_SESSION, label: 'Group Session' },
  ];

  const eventStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: EventStatus.SCHEDULED, label: 'Scheduled' },
    { value: EventStatus.COMPLETED, label: 'Completed' },
    { value: EventStatus.CANCELLED, label: 'Cancelled' },
  ];

  const sortByOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'title', label: 'Sort by Title' },
    { value: 'attendees', label: 'Sort by Attendance' },
  ];

  if (eventsError && !eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Events
            </h2>
            <p className="text-gray-600 mb-4">
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600">Manage and participate in mentorship events</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={refreshEvents}
                variant="outline"
                disabled={eventsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${eventsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              options={eventTypeOptions}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              value={filters.type}
            />

            <Select
              options={eventStatusOptions}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              value={filters.status}
            />

            <Select
              options={sortByOptions}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              value={filters.sortBy}
            />
          </div>
        </div>

        {eventsLoading && events.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        )}

        {events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {events.map((event) => (
                <Card key={event.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className="text-sm text-gray-600 capitalize">
                        {event.status.replace('_', ' ')}
                      </span>
                    </div>
                    <ActionDropdown
                      actions={[
                        createViewAction(() => handleViewDetails(event.id)),
                        createEditAction(() => handleEditEvent(event.id)),
                        createDeleteAction(() => handleDeleteClick(event.id))
                      ]}
                    />
                  </div>

                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.scheduledAt)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.currentAttendees || 0}
                        {event.maxAttendees && `/${event.maxAttendees}`} attendees
                      </span>
                    </div>

                    {event.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.duration} minutes</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(event.id)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    
                    {event.status === EventStatus.SCHEDULED && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={operationLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join
                      </Button>
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

        {!eventsLoading && events.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.type !== 'all' || filters.status !== 'all' 
                ? 'Try adjusting your filters to see more events.'
                : 'No events have been created yet. Create the first one!'}
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Card>
        )}

        {showCreateForm && (
          <CreateEventForm
            onSuccess={handleCreateSuccess}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {showDetailsModal && selectedEvent && (
          <DetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedEventId(null);
            }}
            data={selectedEvent}
            type="event"
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