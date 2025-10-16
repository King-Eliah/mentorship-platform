import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User, Event, Role } from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Award,
  BookOpen,
  GraduationCap,
  Shield,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: User | Event | Group;
  type: 'user' | 'event' | 'group';
  onEdit?: () => void;
  onDelete?: () => void;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  currentMembers: number;
  category: string;
  isPrivate: boolean;
  createdAt: string;
  members: User[];
  mentorId: string;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'SCHEDULED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
      case 'SUSPENDED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'INACTIVE':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Shield className="h-4 w-4 text-purple-500" />;
      case Role.MENTOR:
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case Role.MENTEE:
        return <BookOpen className="h-4 w-4 text-green-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderUserDetails = (user: User) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {getRoleIcon(user.role)}
            <span>{user.role}</span>
            {getStatusIcon(user.isActive ? 'ACTIVE' : 'INACTIVE')}
            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 dark:text-white">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
              </div>
            )}
            {user.department && (
              <div className="flex items-center space-x-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{user.department}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 dark:text-white">Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Joined:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(user.createdAt)}
              </span>
            </div>
            {user.lastLoginAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(user.lastLoginAt)}
                </span>
              </div>
            )}
            {user.role === Role.MENTOR && user.menteeCount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mentees:</span>
                <span className="text-gray-900 dark:text-white">{user.menteeCount}</span>
              </div>
            )}
            {user.role === Role.MENTEE && user.mentorCount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mentors:</span>
                <span className="text-gray-900 dark:text-white">{user.mentorCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {user.skills && (
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Skills & Interests</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{user.skills}</p>
        </div>
      )}
    </div>
  );

  const renderEventDetails = (event: Event) => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {event.title}
          </h2>
          {getStatusIcon(event.status)}
        </div>
        {event.description && (
          <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
        )}
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Event Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {formatDate(event.scheduledAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                Duration: {formatDuration(event.duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">{event.location}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {event.currentAttendees}/{event.maxAttendees} attendees
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Details</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white capitalize">
                {event.type.replace('_', ' ').toLowerCase()}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(event.status)}
                <span className="text-gray-900 dark:text-white capitalize">
                  {event.status.toLowerCase()}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(event.createdAt)}
              </span>
            </div>
          </div>

          {/* Attendance Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Attendance</span>
              <span className="text-gray-900 dark:text-white">
                {Math.round((event.currentAttendees / event.maxAttendees) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGroupDetails = (group: Group) => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {group.name}
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs ${
              group.isPrivate 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
            }`}>
              {group.isPrivate ? 'Private' : 'Public'}
            </div>
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs capitalize">
              {group.category}
            </div>
          </div>
        </div>
        {group.description && (
          <p className="text-gray-600 dark:text-gray-300">{group.description}</p>
        )}
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {group.currentMembers}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Members</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {group.maxMembers}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Max Capacity</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {Math.round((group.currentMembers / group.maxMembers) * 100)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Capacity Used</div>
        </div>
      </div>

      {/* Members */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Members</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </span>
                    {member.id === group.mentorId && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Creator
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {member.role} • {member.email}
                  </span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                member.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Meta Information */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created:</span>
          <span className="text-gray-900 dark:text-white">
            {formatDate(group.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'user':
        return renderUserDetails(data as User);
      case 'event':
        return renderEventDetails(data as Event);
      case 'group':
        return renderGroupDetails(data as Group);
      default:
        return <div>Unknown data type</div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type.charAt(0).toUpperCase() + type.slice(1)} Details`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {renderContent()}
        
        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit {type}
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                onClick={onDelete}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
              >
                Delete {type}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};