import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, FileText, Plus, Search, Filter, Eye, Trash2, X, Calendar, Clock, User, Shield, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { FileUpload } from '../components/ui/FileUpload';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { ListSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { Role } from '../types';
import toast from 'react-hot-toast';

interface IncidentReport {
  id: string;
  title: string;
  type: 'harassment' | 'discrimination' | 'misconduct' | 'safety' | 'technical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  involvedParties: string[];
  witnessNames?: string;
  reportedAt: string;
  reportedBy: string;
  reportedById: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isAnonymous: boolean;
  priority: number; // 1-5, 5 being highest
  updatedAt: string;
  resolvedAt?: string;
}

const INCIDENT_TYPES = [
  { value: 'harassment', label: 'Harassment', description: 'Inappropriate behavior or communication', icon: <User className="w-4 h-4" /> },
  { value: 'discrimination', label: 'Discrimination', description: 'Unfair treatment based on protected characteristics', icon: <Shield className="w-4 h-4" /> },
  { value: 'misconduct', label: 'Professional Misconduct', description: 'Violation of professional standards', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'safety', label: 'Safety Concern', description: 'Physical or digital safety issues', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'technical', label: 'Technical Issue', description: 'System or platform problems', icon: <FileText className="w-4 h-4" /> },
  { value: 'other', label: 'Other', description: 'Other types of incidents', icon: <Filter className="w-4 h-4" /> }
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: <Clock className="w-4 h-4" />, description: 'Minor issue' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <AlertTriangle className="w-4 h-4" />, description: 'Moderate concern' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: <AlertTriangle className="w-4 h-4" />, description: 'Urgent issue' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <AlertTriangle className="w-4 h-4" />, description: 'Immediate attention' }
];

export const IncidentReport: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolutionText, setResolutionText] = useState('');
  const [resolvingIncident, setResolvingIncident] = useState<string | null>(null);
  const [isEditingResolution, setIsEditingResolution] = useState(false);
  const [editResolutionText, setEditResolutionText] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'other' as IncidentReport['type'],
    severity: 'medium' as IncidentReport['severity'],
    description: '',
    location: '',
    involvedParties: '',
    witnessNames: '',
    isAnonymous: false
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    incidentId: string | null;
    incidentTitle: string;
  }>({
    isOpen: false,
    incidentId: null,
    incidentTitle: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filterIncidents = useCallback(() => {
    let filtered = incidents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.involvedParties.some(party => party.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(incident => incident.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(incident => incident.status === selectedStatus);
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(incident => incident.severity === selectedSeverity);
    }

    // Show only user's own reports for non-admin users (unless they're involved)
    if (user?.role !== Role.ADMIN) {
      filtered = filtered.filter(incident => 
        incident.reportedById === user?.id || 
        incident.involvedParties.includes(`${user?.firstName} ${user?.lastName}`)
      );
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(); // Newer first
    });

    setFilteredIncidents(filtered);
  }, [incidents, searchTerm, selectedType, selectedStatus, selectedSeverity, user]);

  useEffect(() => {
    filterIncidents();
  }, [filterIncidents]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockIncidents: IncidentReport[] = [
        {
          id: '1',
          title: 'Inappropriate communication in group chat',
          type: 'harassment',
          severity: 'high',
          description: 'A group member has been sending inappropriate messages in the team chat, making other members uncomfortable.',
          location: 'Online - Group Chat',
          involvedParties: ['John Doe', 'Group Alpha'],
          witnessNames: 'Multiple group members',
          reportedAt: '2025-09-14T09:30:00Z',
          reportedBy: 'Anonymous',
          reportedById: 'user-1',
          status: 'investigating',
          assignedTo: 'HR Team',
          attachments: [
            {
              id: 'att-1',
              name: 'chat-screenshots.png',
              url: '/evidence/chat-screenshots.png',
              type: 'image/png',
              size: 245760
            }
          ],
          isAnonymous: true,
          priority: 4,
          updatedAt: '2025-09-14T14:20:00Z'
        },
        {
          id: '2',
          title: 'System access issue affecting mentor dashboard',
          type: 'technical',
          severity: 'medium',
          description: 'Multiple mentors are unable to access their dashboard features, affecting their ability to track mentee progress.',
          location: 'Platform Dashboard',
          involvedParties: ['Platform System'],
          reportedAt: '2025-09-13T16:45:00Z',
          reportedBy: 'Dr. Sarah Johnson',
          reportedById: 'mentor-1',
          status: 'resolved',
          assignedTo: 'Technical Team',
          resolution: 'Database connection issue was identified and fixed. All mentors should now have full access to dashboard features.',
          attachments: [],
          isAnonymous: false,
          priority: 3,
          updatedAt: '2025-09-13T18:30:00Z',
          resolvedAt: '2025-09-13T18:30:00Z'
        },
        {
          id: '3',
          title: 'Safety concern about meeting location',
          type: 'safety',
          severity: 'medium',
          description: 'The assigned meeting room for mentor sessions is in a poorly lit area with limited security. Several participants have expressed concerns.',
          location: 'Building C, Room 101',
          involvedParties: ['Facilities Team'],
          witnessNames: 'Emily Chen, Mike Davis',
          reportedAt: '2025-09-12T11:15:00Z',
          reportedBy: 'Lisa Rodriguez',
          reportedById: 'user-3',
          status: 'open',
          attachments: [
            {
              id: 'att-2',
              name: 'location-photos.jpg',
              url: '/evidence/location-photos.jpg',
              type: 'image/jpeg',
              size: 512000
            }
          ],
          isAnonymous: false,
          priority: 3,
          updatedAt: '2025-09-12T11:15:00Z'
        },
        {
          id: '4',
          title: 'Unprofessional behavior during group session',
          type: 'misconduct',
          severity: 'high',
          description: 'A participant was disruptive during the group mentoring session, using inappropriate language and refusing to follow session guidelines.',
          location: 'Conference Room A',
          involvedParties: ['Alex Thompson'],
          witnessNames: 'All group session participants',
          reportedAt: '2025-09-10T14:00:00Z',
          reportedBy: 'Session Facilitator',
          reportedById: 'mentor-2',
          status: 'closed',
          assignedTo: 'Program Director',
          resolution: 'Participant has been counseled and agreed to follow session guidelines. Additional training on professional behavior has been provided.',
          attachments: [],
          isAnonymous: false,
          priority: 4,
          updatedAt: '2025-09-11T10:00:00Z',
          resolvedAt: '2025-09-11T10:00:00Z'
        }
      ];
      
      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      toast.error('Failed to load incident reports');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    const severityData = SEVERITY_LEVELS.find(s => s.value === severity);
    return severityData?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-600 dark:text-red-400';
    if (priority >= 3) return 'text-orange-600 dark:text-orange-400';
    if (priority >= 2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedSeverity('all');
    toast.success('Filters cleared');
  };

  const hasActiveFilters = searchTerm !== '' || selectedType !== 'all' || selectedStatus !== 'all' || selectedSeverity !== 'all';

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setAttachedFiles(files);
  };

  const calculatePriority = (type: string, severity: string): number => {
    let basePriority = 1;
    
    // Type-based priority
    if (type === 'harassment' || type === 'discrimination') basePriority = 4;
    else if (type === 'misconduct' || type === 'safety') basePriority = 3;
    else if (type === 'technical') basePriority = 2;
    
    // Severity multiplier
    if (severity === 'critical') return 5;
    if (severity === 'high') return Math.min(5, basePriority + 1);
    if (severity === 'medium') return basePriority;
    return Math.max(1, basePriority - 1);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newIncident: IncidentReport = {
        id: Math.random().toString(36),
        title: formData.title,
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        location: formData.location || undefined,
        involvedParties: formData.involvedParties.split(',').map(p => p.trim()).filter(p => p),
        witnessNames: formData.witnessNames || undefined,
        reportedAt: new Date().toISOString(),
        reportedBy: formData.isAnonymous ? 'Anonymous' : `${user?.firstName} ${user?.lastName}`,
        reportedById: user?.id || '',
        status: 'open',
        attachments: attachedFiles.map(file => ({
          id: Math.random().toString(36),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        })),
        isAnonymous: formData.isAnonymous,
        priority: calculatePriority(formData.type, formData.severity),
        updatedAt: new Date().toISOString()
      };

      setIncidents(prev => [newIncident, ...prev]);
      toast.success('Incident report submitted successfully');
      handleCloseModal();
    } catch {
      toast.error('Failed to submit incident report');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      title: '',
      type: 'other',
      severity: 'medium',
      description: '',
      location: '',
      involvedParties: '',
      witnessNames: '',
      isAnonymous: false
    });
    setAttachedFiles([]);
  };

  const handleViewIncident = (incident: IncidentReport) => {
    setSelectedIncident(incident);
    setShowViewModal(true);
  };

  const handleDelete = (incidentId: string, incidentTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      incidentId: incidentId,
      incidentTitle: incidentTitle
    });
  };

  const confirmDeleteIncident = () => {
    if (deleteConfirmation.incidentId) {
      setIncidents(prev => prev.filter(i => i.id !== deleteConfirmation.incidentId));
      toast.success('Incident report deleted successfully');
      setDeleteConfirmation({
        isOpen: false,
        incidentId: null,
        incidentTitle: ''
      });
    }
  };

  const cancelDeleteIncident = () => {
    setDeleteConfirmation({
      isOpen: false,
      incidentId: null,
      incidentTitle: ''
    });
  };

  const handleResolve = (incidentId: string) => {
    if (!resolutionText.trim()) {
      toast.error('Please enter a resolution message');
      return;
    }

    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          resolution: resolutionText,
          status: 'resolved' as const,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return incident;
    }));

    toast.success('Incident resolved successfully');
    setResolutionText('');
    setResolvingIncident(null);
  };

  const handleEditResolution = (incidentId: string) => {
    if (!editResolutionText.trim()) {
      toast.error('Please enter a resolution message');
      return;
    }

    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          resolution: editResolutionText,
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return incident;
    }));

    // Update selectedIncident for the modal
    setSelectedIncident(prev => prev ? {
      ...prev,
      resolution: editResolutionText,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : null);

    toast.success('Resolution updated successfully');
    setIsEditingResolution(false);
    setEditResolutionText('');
  };

  const canViewAll = user?.role === Role.ADMIN;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Incident Reports</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {canViewAll 
              ? 'Review and resolve safety and conduct incidents'
              : 'Report and track safety and conduct incidents'
            }
          </p>
        </div>
        {!canViewAll && (
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="min-w-[44px] min-h-[44px] w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Button>
        )}
      </div>

      {/* Quick Stats (Admin Only) */}
      {canViewAll && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {incidents.filter(i => i.severity === 'critical').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Open</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {incidents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          {/* Mobile: Stack all filters vertically */}
          <div className="flex flex-col gap-4 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownSelect
              options={[
                { value: 'all', label: 'All Types', icon: <Filter className="w-4 h-4" />, description: 'Show all incident types' },
                ...INCIDENT_TYPES.map(type => ({ value: type.value, label: type.label, icon: type.icon, description: type.description }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Select Type"
            />

            <DropdownSelect
              options={[
                { value: 'all', label: 'All Severities', icon: <AlertTriangle className="w-4 h-4" />, description: 'Show all severity levels' },
                ...SEVERITY_LEVELS.map(severity => ({ value: severity.value, label: severity.label, icon: severity.icon, description: severity.description }))
              ]}
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              placeholder="Select Severity"
            />

            <DropdownSelect
              options={[
                { value: 'all', label: 'All Status', icon: <Eye className="w-4 h-4" />, description: 'Show all status types' },
                { value: 'open', label: 'Open', icon: <FileText className="w-4 h-4" />, description: 'New incidents' },
                { value: 'investigating', label: 'Investigating', icon: <Search className="w-4 h-4" />, description: 'Under investigation' },
                { value: 'resolved', label: 'Resolved', icon: <Shield className="w-4 h-4" />, description: 'Issue resolved' },
                { value: 'closed', label: 'Closed', icon: <X className="w-4 h-4" />, description: 'Case closed' }
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select Status"
            />

            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden md:grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownSelect
              options={[
                { value: 'all', label: 'All Types', icon: <Filter className="w-4 h-4" />, description: 'Show all incident types' },
                ...INCIDENT_TYPES.map(type => ({ value: type.value, label: type.label, icon: type.icon, description: type.description }))
              ]}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Select Type"
            />

            <DropdownSelect
              options={[
                { value: 'all', label: 'All Severities', icon: <AlertTriangle className="w-4 h-4" />, description: 'Show all severity levels' },
                ...SEVERITY_LEVELS.map(severity => ({ value: severity.value, label: severity.label, icon: severity.icon, description: severity.description }))
              ]}
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              placeholder="Select Severity"
            />

            <DropdownSelect
              options={[
                { value: 'all', label: 'All Status', icon: <Eye className="w-4 h-4" />, description: 'Show all status types' },
                { value: 'open', label: 'Open', icon: <FileText className="w-4 h-4" />, description: 'New incidents' },
                { value: 'investigating', label: 'Investigating', icon: <Search className="w-4 h-4" />, description: 'Under investigation' },
                { value: 'resolved', label: 'Resolved', icon: <Shield className="w-4 h-4" />, description: 'Issue resolved' },
                { value: 'closed', label: 'Closed', icon: <X className="w-4 h-4" />, description: 'Case closed' }
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select Status"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    Clear filters
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`min-w-[44px] min-h-[44px] ${hasActiveFilters ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  {hasActiveFilters && <span className="ml-1 text-xs">•</span>}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      {loading ? (
        <ListSkeleton items={5} itemComponent={CardSkeleton} />
      ) : (
        <div className="space-y-3">{filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Incident Info - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {incident.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        {incident.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center truncate">
                        <User className="w-3 h-3 mr-1" />
                        {incident.reportedBy}
                      </span>
                      <span className="flex items-center flex-shrink-0">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(incident.reportedAt)}
                      </span>
                      {incident.location && (
                        <span className="flex items-center truncate">
                          📍 {incident.location}
                        </span>
                      )}
                      {incident.attachments.length > 0 && (
                        <span className="flex items-center flex-shrink-0">
                          <FileText className="w-3 h-3 mr-1" />
                          {incident.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions - Compact */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewIncident(incident)}
                      className="h-8 px-2"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {user?.role === Role.ADMIN && !incident.resolution && incident.status !== 'resolved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResolvingIncident(resolvingIncident === incident.id ? null : incident.id)}
                        className="h-8 px-2 text-green-600 hover:text-green-700"
                      >
                        <Shield className="w-3 h-3" />
                      </Button>
                    )}
                    {(canViewAll || incident.reportedById === user?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(incident.id, incident.title)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Admin Resolution Input */}
                {user?.role === Role.ADMIN && resolvingIncident === incident.id && !incident.resolution && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter resolution details..."
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        className="flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleResolve(incident.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleResolve(incident.id)}
                        className="h-8 px-3 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                )}

                {/* Resolution - if exists */}
                {incident.resolution && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-2 border-green-400 p-2 mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-900 dark:text-green-100">
                        Resolution
                      </span>
                      {incident.resolvedAt && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {formatDate(incident.resolvedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-green-800 dark:text-green-200 text-xs line-clamp-2">
                      {incident.resolution}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredIncidents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No incident reports found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedSeverity !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No incident reports have been submitted yet'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Report Incident
              </h2>
              <button
                onClick={handleCloseModal}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Important Information</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      This form is for reporting serious incidents that require immediate attention. 
                      For general feedback or minor issues, please use the Feedback Center.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Incident Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Brief description of the incident"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DropdownSelect
                    label="Incident Type *"
                    value={formData.type}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value as IncidentReport['type'] }))}
                    placeholder="Select incident type"
                    options={INCIDENT_TYPES}
                  />
                </div>

                <div>
                  <DropdownSelect
                    label="Severity Level *"
                    value={formData.severity}
                    onChange={(value) => setFormData(prev => ({ ...prev, severity: value as IncidentReport['severity'] }))}
                    placeholder="Select severity level"
                    options={SEVERITY_LEVELS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Provide a detailed description of what happened, when it occurred, and any relevant context..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location (if applicable)
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="e.g., Room 101, Online platform, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Witness Names (if any)
                  </label>
                  <Input
                    name="witnessNames"
                    value={formData.witnessNames}
                    onChange={handleFormChange}
                    placeholder="Names of any witnesses"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Involved Parties (comma-separated)
                </label>
                <Input
                  name="involvedParties"
                  value={formData.involvedParties}
                  onChange={handleFormChange}
                  placeholder="Names of people involved in the incident"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evidence/Attachments
                </label>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  acceptedTypes={[
                    'image/*',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    '.txt'
                  ]}
                  maxFileSize={10}
                  maxFiles={5}
                  multiple={true}
                  showPreview={true}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload any relevant screenshots, documents, or other evidence
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Submit this report anonymously
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" onClick={handleCloseModal} className="min-w-[44px] min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 min-w-[44px] min-h-[44px]">
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Incident Modal */}
      {showViewModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Incident Report Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {selectedIncident.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize whitespace-nowrap ${getStatusColor(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize whitespace-nowrap ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded capitalize whitespace-nowrap">
                    {selectedIncident.type.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 min-w-0">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Reported by:</span>
                    <p className="text-gray-900 dark:text-white break-words">{selectedIncident.reportedBy}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date & Time:</span>
                    <p className="text-gray-900 dark:text-white break-words">{formatDate(selectedIncident.reportedAt)}</p>
                  </div>

                  {selectedIncident.location && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                      <p className="text-gray-900 dark:text-white break-words">{selectedIncident.location}</p>
                    </div>
                  )}

                  {selectedIncident.assignedTo && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Assigned to:</span>
                      <p className="text-gray-900 dark:text-white break-words">{selectedIncident.assignedTo}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 min-w-0">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                    <p className={`font-medium ${getPriorityColor(selectedIncident.priority)}`}>
                      {selectedIncident.priority}/5
                    </p>
                  </div>

                  {selectedIncident.witnessNames && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Witnesses:</span>
                      <p className="text-gray-900 dark:text-white break-words">{selectedIncident.witnessNames}</p>
                    </div>
                  )}

                  {selectedIncident.involvedParties.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Involved Parties:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedIncident.involvedParties.map((party, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded break-words"
                          >
                            {party}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                <p className="text-gray-900 dark:text-white mt-2 whitespace-pre-wrap break-words">
                  {selectedIncident.description}
                </p>
              </div>

              {selectedIncident.attachments.length > 0 && (
                <div className="min-w-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Attachments:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {selectedIncident.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-0"
                      >
                        <FileText className="w-5 h-5 text-gray-500 mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(attachment.size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedIncident.resolution && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Resolution
                      </span>
                      {selectedIncident.resolvedAt && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Resolved on {formatDate(selectedIncident.resolvedAt)}
                        </span>
                      )}
                    </div>
                    {user?.role === Role.ADMIN && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsEditingResolution(!isEditingResolution);
                          if (!isEditingResolution) {
                            setEditResolutionText(selectedIncident.resolution || '');
                          }
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        {isEditingResolution ? 'Cancel' : 'Edit'}
                      </Button>
                    )}
                  </div>
                  {isEditingResolution ? (
                    <div className="space-y-2">
                      <textarea
                        value={editResolutionText}
                        onChange={(e) => setEditResolutionText(e.target.value)}
                        className="w-full p-2 border border-green-300 dark:border-green-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        rows={4}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditResolution(selectedIncident.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <p className="text-green-800 dark:text-green-200 text-sm whitespace-pre-wrap">
                      {selectedIncident.resolution}
                    </p>
                  )}
                </div>
              )}

              {/* Show "No resolution yet" for the reporter if they don't have a resolution */}
              {!selectedIncident.resolution && selectedIncident.reportedById === user?.id && (
                <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600 p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No resolution yet. An admin will review this incident soon.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setShowViewModal(false)} className="min-w-[44px] min-h-[44px]">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Incident Report"
        message={`Are you sure you want to delete the incident report "${deleteConfirmation.incidentTitle}"? This action cannot be undone.`}
        onConfirm={confirmDeleteIncident}
        onCancel={cancelDeleteIncident}
        confirmText="Delete Report"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};