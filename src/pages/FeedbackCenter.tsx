import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Heart, Calendar, MessageSquare, Star, X, Trash2, Users, Eye, UserCheck, Settings, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { ListSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { Role } from '../types';
import toast from 'react-hot-toast';

interface Feedback {
  id: string;
  type: 'mentor' | 'mentee' | 'event' | 'system' | 'general';
  title: string;
  content: string;
  rating?: number; // 1-5 stars
  targetId?: string; // ID of mentor, event, etc.
  targetName?: string;
  submittedBy: string;
  submittedById: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  isAnonymous: boolean;
}

const FEEDBACK_TYPES = [
  { 
    value: 'mentor', 
    label: 'About Mentor', 
    description: 'Rate and provide feedback about your mentor',
    allowedRoles: [Role.MENTEE],
    icon: <UserCheck className="w-4 h-4" />
  },
  { 
    value: 'mentee', 
    label: 'About Mentee', 
    description: 'Provide feedback about your mentee\'s progress',
    allowedRoles: [Role.MENTOR],
    icon: <Users className="w-4 h-4" />
  },
  { 
    value: 'event', 
    label: 'Event Feedback', 
    description: 'Share your thoughts about events and workshops',
    allowedRoles: [Role.ADMIN, Role.MENTOR, Role.MENTEE],
    icon: <Calendar className="w-4 h-4" />
  },
  { 
    value: 'system', 
    label: 'System Feedback', 
    description: 'Report issues or suggest improvements',
    allowedRoles: [Role.ADMIN, Role.MENTOR, Role.MENTEE],
    icon: <Settings className="w-4 h-4" />
  },
  { 
    value: 'general', 
    label: 'General Feedback', 
    description: 'Any other feedback or suggestions',
    allowedRoles: [Role.ADMIN, Role.MENTOR, Role.MENTEE],
    icon: <MessageSquare className="w-4 h-4" />
  }
];

export const FeedbackCenter: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editResponseText, setEditResponseText] = useState('');
  const [formData, setFormData] = useState({
    type: 'general' as Feedback['type'],
    title: '',
    content: '',
    rating: 5,
    targetId: '',
    targetName: '',
    isAnonymous: false
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    feedbackId: string | null;
    feedbackTitle: string;
  }>({
    isOpen: false,
    feedbackId: null,
    feedbackTitle: ''
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filterFeedbacks = useCallback(() => {
    let filtered = feedbacks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.targetName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(feedback => feedback.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === selectedStatus);
    }

    // Show only user's own feedback for non-admin users
    if (user?.role !== Role.ADMIN) {
      filtered = filtered.filter(feedback => feedback.submittedById === user?.id);
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchTerm, selectedType, selectedStatus, user]);

  useEffect(() => {
    filterFeedbacks();
  }, [filterFeedbacks]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockFeedbacks: Feedback[] = [
        {
          id: '1',
          type: 'mentor',
          title: 'Excellent mentoring sessions',
          content: 'Dr. Johnson has been incredibly helpful in guiding my career development. Her insights and feedback have been invaluable.',
          rating: 5,
          targetId: 'mentor-1',
          targetName: 'Dr. Sarah Johnson',
          submittedBy: 'John Smith',
          submittedById: 'user-1',
          submittedAt: '2025-09-14T10:30:00Z',
          status: 'reviewed',
          response: 'Thank you for the positive feedback! It\'s wonderful to hear about your progress.',
          respondedBy: 'Dr. Sarah Johnson',
          respondedAt: '2025-09-14T15:00:00Z',
          isAnonymous: false
        },
        {
          id: '2',
          type: 'mentee',
          title: 'Great progress and engagement',
          content: 'Emily has shown tremendous growth over the past month. She consistently comes prepared to our sessions and actively implements the strategies we discuss. Her communication skills have improved significantly.',
          rating: 5,
          targetId: 'user-3',
          targetName: 'Emily Chen',
          submittedBy: 'Dr. Sarah Johnson',
          submittedById: 'mentor-1',
          submittedAt: '2025-09-13T14:20:00Z',
          status: 'reviewed',
          response: 'Thank you for the encouraging feedback! I\'m grateful for your guidance and support.',
          respondedBy: 'Emily Chen',
          respondedAt: '2025-09-13T18:45:00Z',
          isAnonymous: false
        },
        {
          id: '3',
          type: 'event',
          title: 'Communication Skills Workshop',
          content: 'The workshop was well-organized and provided practical tips. However, it could have been longer to cover more examples.',
          rating: 4,
          targetId: 'event-1',
          targetName: 'Communication Skills Workshop',
          submittedBy: 'Anonymous',
          submittedById: 'user-2',
          submittedAt: '2025-09-12T16:45:00Z',
          status: 'pending',
          isAnonymous: true
        },
        {
          id: '4',
          type: 'mentee',
          title: 'Needs more initiative',
          content: 'Mike is a bright student but could benefit from taking more initiative in our sessions. Sometimes he seems unprepared and relies too heavily on me to guide the conversation.',
          rating: 3,
          targetId: 'user-4',
          targetName: 'Mike Davis',
          submittedBy: 'Prof. Robert Wilson',
          submittedById: 'mentor-2',
          submittedAt: '2025-09-11T11:30:00Z',
          status: 'reviewed',
          response: 'I appreciate the honest feedback. I will work on being more proactive and prepared for our sessions.',
          respondedBy: 'Mike Davis',
          respondedAt: '2025-09-11T16:00:00Z',
          isAnonymous: false
        },
        {
          id: '5',
          type: 'system',
          title: 'Dashboard loading issue',
          content: 'The dashboard sometimes takes a long time to load, especially the analytics section. It would be great if this could be optimized.',
          targetName: 'Dashboard Performance',
          submittedBy: 'Emily Chen',
          submittedById: 'user-3',
          submittedAt: '2025-09-10T09:15:00Z',
          status: 'resolved',
          response: 'We\'ve identified and fixed the performance issue. The dashboard should now load much faster.',
          respondedBy: 'Technical Team',
          respondedAt: '2025-09-11T14:30:00Z',
          isAnonymous: false
        },
        {
          id: '6',
          type: 'general',
          title: 'Program structure suggestion',
          content: 'It would be helpful to have more structured goal-setting sessions at the beginning of the mentorship program.',
          submittedBy: 'Mike Davis',
          submittedById: 'user-4',
          submittedAt: '2025-09-08T11:00:00Z',
          status: 'reviewed',
          response: 'Great suggestion! We\'re planning to implement structured goal-setting sessions in the next program iteration.',
          respondedBy: 'Program Director',
          respondedAt: '2025-09-09T10:00:00Z',
          isAnonymous: false
        }
      ];
      
      setFeedbacks(mockFeedbacks);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newFeedback: Feedback = {
        id: Math.random().toString(36),
        type: formData.type,
        title: formData.title,
        content: formData.content,
        rating: ['mentor', 'mentee', 'event'].includes(formData.type) ? formData.rating : undefined,
        targetId: formData.targetId || undefined,
        targetName: formData.targetName || undefined,
        submittedBy: formData.isAnonymous ? 'Anonymous' : `${user?.firstName} ${user?.lastName}`,
        submittedById: user?.id || '',
        submittedAt: new Date().toISOString(),
        status: 'pending',
        isAnonymous: formData.isAnonymous
      };

      setFeedbacks(prev => [newFeedback, ...prev]);
      toast.success('Feedback submitted successfully');
      handleCloseModal();
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      type: 'general',
      title: '',
      content: '',
      rating: 5,
      targetId: '',
      targetName: '',
      isAnonymous: false
    });
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  const handleDelete = (feedbackId: string, feedbackTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      feedbackId: feedbackId,
      feedbackTitle: feedbackTitle
    });
  };

  const confirmDeleteFeedback = () => {
    if (deleteConfirmation.feedbackId) {
      setFeedbacks(prev => prev.filter(f => f.id !== deleteConfirmation.feedbackId));
      toast.success('Feedback deleted successfully');
      setDeleteConfirmation({
        isOpen: false,
        feedbackId: null,
        feedbackTitle: ''
      });
    }
  };

  const cancelDeleteFeedback = () => {
    setDeleteConfirmation({
      isOpen: false,
      feedbackId: null,
      feedbackTitle: ''
    });
  };

  const handleReply = (feedbackId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setFeedbacks(prev => prev.map(feedback => {
      if (feedback.id === feedbackId) {
        return {
          ...feedback,
          response: replyText,
          respondedBy: `${user?.firstName} ${user?.lastName}`,
          respondedAt: new Date().toISOString(),
          status: 'reviewed' as const
        };
      }
      return feedback;
    }));

    toast.success('Reply sent successfully');
    setReplyText('');
    setReplyingTo(null);
  };

  const handleEditResponse = (feedbackId: string) => {
    if (!editResponseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setFeedbacks(prev => prev.map(feedback => {
      if (feedback.id === feedbackId) {
        return {
          ...feedback,
          response: editResponseText,
          respondedBy: `${user?.firstName} ${user?.lastName}`,
          respondedAt: new Date().toISOString(),
        };
      }
      return feedback;
    }));

    // Update selectedFeedback for the modal
    setSelectedFeedback(prev => prev ? {
      ...prev,
      response: editResponseText,
      respondedBy: `${user?.firstName} ${user?.lastName}`,
      respondedAt: new Date().toISOString(),
    } : null);

    toast.success('Response updated successfully');
    setIsEditingResponse(false);
    setEditResponseText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Feedback Center</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === Role.ADMIN 
              ? 'Review and respond to user feedback'
              : 'Share your thoughts and help us improve'
            }
          </p>
        </div>
        {user?.role !== Role.ADMIN && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="min-w-[44px] min-h-[44px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Give Feedback
          </Button>
        )}
      </div>

      {/* Quick Actions - Hide for Admin */}
      {user?.role !== Role.ADMIN && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEEDBACK_TYPES.filter(type => type.allowedRoles.includes(user?.role as Role)).map((type) => (
            <div key={type.value} className="cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, type: type.value as Feedback['type'] }));
                    setShowCreateModal(true);
                  }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  {type.value === 'mentor' && <Heart className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
                  {type.value === 'mentee' && <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
                  {type.value === 'event' && <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
                  {type.value === 'system' && <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
                  {type.value === 'general' && <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {type.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          {/* Mobile: Stack all filters vertically */}
          <div className="flex flex-col gap-4 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownSelect
              options={[
                { value: 'all', label: 'All Types', icon: <MessageSquare className="w-4 h-4" />, description: 'Show all feedback types' },
                ...FEEDBACK_TYPES.map(type => ({ value: type.value, label: type.label, icon: type.icon, description: type.description }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Select Type"
            />

            <DropdownSelect
              options={[
                { value: 'all', label: 'All Status', icon: <Eye className="w-4 h-4" />, description: 'Show all status types' },
                { value: 'pending', label: 'Pending', icon: <Calendar className="w-4 h-4" />, description: 'Awaiting review' },
                { value: 'reviewed', label: 'Reviewed', icon: <UserCheck className="w-4 h-4" />, description: 'Under review' },
                { value: 'resolved', label: 'Resolved', icon: <Heart className="w-4 h-4" />, description: 'Completed' }
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select Status"
            />

            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownSelect
              options={[
                { value: 'all', label: 'All Types', icon: <MessageSquare className="w-4 h-4" />, description: 'Show all feedback types' },
                ...FEEDBACK_TYPES.map(type => ({ value: type.value, label: type.label, icon: type.icon, description: type.description }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Select Type"
            />

            <DropdownSelect
              options={[
                { value: 'all', label: 'All Status', icon: <Eye className="w-4 h-4" />, description: 'Show all status types' },
                { value: 'pending', label: 'Pending', icon: <Calendar className="w-4 h-4" />, description: 'Awaiting review' },
                { value: 'reviewed', label: 'Reviewed', icon: <UserCheck className="w-4 h-4" />, description: 'Under review' },
                { value: 'resolved', label: 'Resolved', icon: <Heart className="w-4 h-4" />, description: 'Completed' }
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select Status"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {loading ? (
        <ListSkeleton items={5} itemComponent={CardSkeleton} />
      ) : (
        <div className="space-y-3">{filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Feedback Info - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {feedback.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        {feedback.type}
                      </span>
                      {feedback.rating && renderStars(feedback.rating)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="truncate">By {feedback.submittedBy}</span>
                      <span className="flex-shrink-0">{formatDate(feedback.submittedAt)}</span>
                      {feedback.targetName && (
                        <span className="truncate">About: {feedback.targetName}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions - Compact */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewFeedback(feedback)}
                      className="h-8 px-2"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {user?.role === Role.ADMIN && !feedback.response && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === feedback.id ? null : feedback.id)}
                        className="h-8 px-2 text-blue-600 hover:text-blue-700"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    )}
                    {(user?.role === Role.ADMIN || feedback.submittedById === user?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feedback.id, feedback.title)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Admin Reply Input */}
                {user?.role === Role.ADMIN && replyingTo === feedback.id && !feedback.response && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(feedback.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReply(feedback.id)}
                        className="h-8 px-3"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Response - if exists */}
                {feedback.response && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400 p-2 mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                        Response from {feedback.respondedBy}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {feedback.respondedAt && formatDate(feedback.respondedAt)}
                      </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-xs line-clamp-2">
                      {feedback.response}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFeedbacks.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No feedback found"
          message={
            searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search criteria or filters to see more feedback.'
              : 'No feedback has been submitted yet. Share your thoughts to help improve the mentorship experience!'
          }
          action={
            !(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') ? {
              label: 'Give Your First Feedback',
              onClick: () => setShowCreateModal(true),
              variant: 'primary'
            } : undefined
          }
        />
      )}

      {/* Create Feedback Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Submit Feedback
              </h2>
              <button
                onClick={handleCloseModal}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <DropdownSelect
                  label="Feedback Type *"
                  value={formData.type}
                  onChange={(value) => setFormData(prev => ({ ...prev, type: value as Feedback['type'] }))}
                  placeholder="Select feedback type"
                  options={FEEDBACK_TYPES.filter(type => type.allowedRoles.includes(user?.role as Role))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter feedback title"
                  required
                />
              </div>

              {(['mentor', 'mentee', 'event'].includes(formData.type)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Name
                    </label>
                    <Input
                      name="targetName"
                      value={formData.targetName}
                      onChange={handleFormChange}
                      placeholder="Name of mentor/event"
                    />
                  </div>
                  <div>
                    <DropdownSelect
                      label="Rating"
                      value={String(formData.rating)}
                      onChange={(value) => setFormData(prev => ({ ...prev, rating: Number(value) }))}
                      placeholder="Select rating"
                      options={[
                        { value: '5', label: '5 - Excellent', icon: <Star className="w-4 h-4" />, description: 'Outstanding performance' },
                        { value: '4', label: '4 - Very Good', icon: <Star className="w-4 h-4" />, description: 'Exceeds expectations' },
                        { value: '3', label: '3 - Good', icon: <Star className="w-4 h-4" />, description: 'Meets expectations' },
                        { value: '2', label: '2 - Fair', icon: <Star className="w-4 h-4" />, description: 'Below expectations' },
                        { value: '1', label: '1 - Poor', icon: <Star className="w-4 h-4" />, description: 'Needs improvement' }
                      ]}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback Content *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Share your detailed feedback..."
                  height="150px"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Submit anonymously
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="secondary" 
                onClick={handleCloseModal}
                className="min-w-[44px] min-h-[44px] w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="min-w-[44px] min-h-[44px] w-full sm:w-auto"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {showViewModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Feedback Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {selectedFeedback.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize whitespace-nowrap ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded capitalize whitespace-nowrap">
                    {selectedFeedback.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Submitted by:</span>
                  <p className="text-gray-900 dark:text-white break-words">{selectedFeedback.submittedBy}</p>
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                  <p className="text-gray-900 dark:text-white break-words">{formatDate(selectedFeedback.submittedAt)}</p>
                </div>
                {selectedFeedback.targetName && (
                  <div className="min-w-0">
                    <span className="font-medium text-gray-700 dark:text-gray-300">About:</span>
                    <p className="text-gray-900 dark:text-white break-words">{selectedFeedback.targetName}</p>
                  </div>
                )}
                {selectedFeedback.rating && (
                  <div className="min-w-0">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Rating:</span>
                    <div className="mt-1">{renderStars(selectedFeedback.rating)}</div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <span className="font-medium text-gray-700 dark:text-gray-300">Content:</span>
                <p className="text-gray-900 dark:text-white mt-2 whitespace-pre-wrap break-words">
                  {selectedFeedback.content}
                </p>
              </div>

              {selectedFeedback.response && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100 break-words">
                        Response from {selectedFeedback.respondedBy}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {selectedFeedback.respondedAt && formatDate(selectedFeedback.respondedAt)}
                      </span>
                    </div>
                    {user?.role === Role.ADMIN && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsEditingResponse(!isEditingResponse);
                          if (!isEditingResponse) {
                            setEditResponseText(selectedFeedback.response || '');
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {isEditingResponse ? 'Cancel' : 'Edit'}
                      </Button>
                    )}
                  </div>
                  {isEditingResponse ? (
                    <div className="space-y-2">
                      <textarea
                        value={editResponseText}
                        onChange={(e) => setEditResponseText(e.target.value)}
                        className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        rows={4}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditResponse(selectedFeedback.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <p className="text-blue-800 dark:text-blue-200 text-sm whitespace-pre-wrap break-words">
                      {selectedFeedback.response}
                    </p>
                  )}
                </div>
              )}

              {/* Show "No response yet" for the submitter if they don't have a response */}
              {!selectedFeedback.response && selectedFeedback.submittedById === user?.id && (
                <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600 p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No response yet. An admin will review your feedback soon.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={() => setShowViewModal(false)}
                className="min-w-[44px] min-h-[44px] w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Feedback"
        message={`Are you sure you want to delete the feedback "${deleteConfirmation.feedbackTitle}"? This action cannot be undone.`}
        onConfirm={confirmDeleteFeedback}
        onCancel={cancelDeleteFeedback}
        confirmText="Delete Feedback"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};