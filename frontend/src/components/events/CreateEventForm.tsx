import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, Tag, AlertCircle, CheckCircle, Users, Presentation, UsersRound, Link } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DropdownSelect } from '../ui/DropdownSelect';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { FileUpload } from '../FileUpload';
import { EventType } from '../../types';
import toast from 'react-hot-toast';
import { useEventOperations } from '../../hooks/useEvents';
import { CreateEventRequest } from '../../services/eventService';

interface CreateEventFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: string;
  maxAttendees?: string;
  location?: string;
  meetingLink?: string;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ onClose, onSuccess }) => {
  const { createEvent, loading: operationLoading } = useEventOperations();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [attachments, setAttachments] = useState<{name: string; url: string}[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    location: '',
    meetingLink: '',
    maxAttendees: 10,
    type: EventType.MENTORING_SESSION, // Updated to match backend enum
    tags: '',
    prerequisites: '',
    objectives: '',
    resources: '',
  });

  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Date and time are required';
    } else {
      const selectedDate = new Date(formData.scheduledAt);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.scheduledAt = 'Event must be scheduled for a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    } else if (formData.duration > 480) {
      newErrors.duration = 'Duration cannot exceed 8 hours';
    }

    if (formData.maxAttendees < 1) {
      newErrors.maxAttendees = 'At least 1 attendee is required';
    } else if (formData.maxAttendees > 100) {
      newErrors.maxAttendees = 'Maximum 100 attendees allowed';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }

    // Validate meeting link if provided
    if (formData.meetingLink && formData.meetingLink.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.meetingLink.trim())) {
        newErrors.meetingLink = 'Please enter a valid URL (e.g., https://meet.google.com/xxx)';
      }
    }

    // If no location, meeting link should be provided
    if (!formData.location && !formData.meetingLink.trim()) {
      newErrors.meetingLink = 'Meeting link is required for virtual events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    setAttachments(prev => [...prev, { name: fileName, url: fileUrl }]);
    toast.success('File uploaded successfully!');
  };

  const handleFileUploadError = (error: string) => {
    toast.error(`File upload failed: ${error}`);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    try {
      // Calculate end time based on start time + duration
      const startTime = new Date(formData.scheduledAt);
      const endTime = new Date(startTime.getTime() + formData.duration * 60000);

      const eventToCreate: CreateEventRequest = {
        title: formData.title,
        description: formData.description || 'No description provided', // Backend requires non-empty description
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: formData.location || undefined,
        maxAttendees: formData.maxAttendees,
        type: formData.type,
        isPublic: true, // All events are public by default
        isVirtual: !formData.location, // Virtual if no location specified
        meetingLink: formData.meetingLink.trim() || undefined, // Use provided link or undefined
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : undefined,
      };
      
      console.log('🚀 Creating event with data:', eventToCreate);
      
      await createEvent.mutate(eventToCreate);
      toast.success('Event created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
      console.error('❌ Event creation error:', error);
    }
  };

  const eventTypeOptions = [
    { 
      value: EventType.MENTORING_SESSION, 
      label: 'One-on-One Session',
      icon: <Users className="w-4 h-4" />,
      description: 'Individual mentoring session'
    },
    { 
      value: EventType.WORKSHOP, 
      label: 'Workshop',
      icon: <Presentation className="w-4 h-4" />,
      description: 'Interactive learning workshop'
    },
    { 
      value: EventType.WEBINAR, 
      label: 'Webinar',
      icon: <UsersRound className="w-4 h-4" />,
      description: 'Online webinar or presentation'
    },
    { 
      value: EventType.NETWORKING, 
      label: 'Networking',
      icon: <UsersRound className="w-4 h-4" />,
      description: 'Networking event'
    },
    { 
      value: EventType.SOCIAL, 
      label: 'Social Event',
      icon: <UsersRound className="w-4 h-4" />,
      description: 'Social gathering'
    },
    { 
      value: EventType.OTHER, 
      label: 'Other',
      icon: <Tag className="w-4 h-4" />,
      description: 'Other type of event'
    },
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
  ];

  const maxAttendeesOptions = [
    { value: '5', label: '5 people' },
    { value: '10', label: '10 people' },
    { value: '15', label: '15 people' },
    { value: '20', label: '20 people' },
    { value: '30', label: '30 people' },
    { value: '50', label: '50 people' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Event
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Step {step} of 2: {step === 1 ? 'Basic Information' : 'Event Details'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white">
                    <FileText className="w-5 h-5" />
                    <span>Basic Information</span>
                  </div>

                  <div>
                    <Input
                      name="title"
                      label="Event Title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., React Fundamentals Workshop"
                      required
                      error={errors.title}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe what participants will learn and do in this event..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <DropdownSelect
                        label="Event Type"
                        placeholder="Select event type..."
                        value={formData.type}
                        onChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
                        options={eventTypeOptions}
                      />
                    </div>

                    <div>
                      <Input
                        name="scheduledAt"
                        label="Date & Time"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={handleChange}
                        required
                        error={errors.scheduledAt}
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (optional)
                    </label>
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., react, javascript, frontend (comma separated)"
                      leftIcon={<Tag className="w-4 h-4" />}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handleNext} className="px-8">
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white">
                    <Clock className="w-5 h-5" />
                    <span>Event Details</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select
                        name="duration"
                        label="Duration"
                        value={formData.duration.toString()}
                        onChange={handleChange}
                        options={durationOptions}
                        required
                        error={errors.duration}
                      />
                    </div>

                    <div>
                      <Select
                        name="maxAttendees"
                        label="Max Attendees"
                        value={formData.maxAttendees.toString()}
                        onChange={handleChange}
                        options={maxAttendeesOptions}
                        error={errors.maxAttendees}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      name="location"
                      label="Location (Optional)"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Conference Room A, Building B"
                      leftIcon={<MapPin className="w-4 h-4" />}
                      error={errors.location}
                      helperText="Leave empty for virtual events"
                    />
                  </div>

                  <div>
                    <Input
                      name="meetingLink"
                      label={!formData.location ? "Meeting Link (Required for Virtual Events)" : "Meeting Link (Optional)"}
                      value={formData.meetingLink}
                      onChange={handleChange}
                      placeholder="https://meet.google.com/xxx or https://zoom.us/j/xxx"
                      leftIcon={<Link className="w-4 h-4" />}
                      error={errors.meetingLink}
                      helperText={!formData.location ? "Provide the video conference link for this virtual event" : "Optional: Add a meeting link even for in-person events"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prerequisites (optional)
                    </label>
                    <textarea
                      name="prerequisites"
                      rows={3}
                      value={formData.prerequisites}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="What should participants know before attending?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Learning Objectives (optional)
                    </label>
                    <textarea
                      name="objectives"
                      rows={3}
                      value={formData.objectives}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="What will participants learn or achieve?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resources & Materials (optional)
                    </label>
                    <textarea
                      name="resources"
                      rows={3}
                      value={formData.resources}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 mb-4"
                      placeholder="Links, documents, or materials participants should bring or access"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      File Attachments (optional)
                    </label>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      onError={handleFileUploadError}
                      acceptedTypes={['application/pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', 'image/*']}
                      maxSize={10}
                      multiple={true}
                      showPreview={true}
                    />
                    
                    {attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Uploaded Files ({attachments.length})
                        </h4>
                        <div className="space-y-2">
                          {attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <span className="text-sm text-gray-600 dark:text-gray-300">{attachment.name}</span>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    loading={operationLoading}
                    className="flex-1"
                    disabled={Object.keys(errors).length > 0}
                  >
                    {operationLoading ? (
                      'Creating Event...'
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};