import React, { useState, useEffect } from 'react';
import { Plus, Target, Search, Edit, Trash2, CheckCircle, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { Modal } from '../components/ui/Modal';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { goalService } from '../services/goalService';
import { Goal, GoalCategory, GoalPriority, GoalStatus, CreateGoalRequest } from '../types/goals';
import toast from 'react-hot-toast';

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<GoalCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');

  // Form state for goal creation/editing
  const [formData, setFormData] = useState<CreateGoalRequest>({
    title: '',
    description: '',
    category: GoalCategory.PERSONAL_GROWTH,
    priority: GoalPriority.MEDIUM,
    dueDate: '',
    relatedSkills: [],
    milestones: [],
    isPublic: false
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      const userGoals = await goalService.getGoals(user?.id || '1');
      setGoals(userGoals);
    } catch (error) {
      toast.error('Failed to load goals');
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGoal = async () => {
    try {
      const newGoal = await goalService.createGoal(formData);
      setGoals([...goals, newGoal]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Goal created successfully!');
    } catch (error) {
      toast.error('Failed to create goal');
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;
    
    try {
      const updatedGoal = await goalService.updateGoal(editingGoal.id, formData);
      setGoals(goals.map(g => g.id === editingGoal.id ? updatedGoal : g));
      setEditingGoal(null);
      resetForm();
      toast.success('Goal updated successfully!');
    } catch (error) {
      toast.error('Failed to update goal');
      console.error('Error updating goal:', error);
    }
  };

  const handleStatusChange = async (goalId: string, newStatus: GoalStatus) => {
    try {
      await goalService.updateGoal(goalId, { status: newStatus });
      
      // Update local state
      setGoals(prev => 
        prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, status: newStatus, updatedAt: new Date().toISOString() }
            : goal
        )
      );
      toast.success('Goal status updated successfully');
    } catch (error) {
      toast.error('Failed to update goal status');
      console.error('Error updating goal status:', error);
    }
  };

  const handleToggleMentorVisibility = async (goalId: string, currentVisibility: boolean = true) => {
    try {
      const newVisibility = !currentVisibility;
      await goalService.updateGoal(goalId, { visibleToMentor: newVisibility });
      
      // Update local state
      setGoals(prev => 
        prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, visibleToMentor: newVisibility, updatedAt: new Date().toISOString() }
            : goal
        )
      );
      toast.success(newVisibility ? 'Goal is now visible to your mentor' : 'Goal is now hidden from your mentor');
    } catch (error) {
      toast.error('Failed to update goal visibility');
      console.error('Error updating goal visibility:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalService.deleteGoal(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
      toast.success('Goal deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete goal');
      console.error('Error deleting goal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: GoalCategory.PERSONAL_GROWTH,
      priority: GoalPriority.MEDIUM,
      dueDate: '',
      relatedSkills: [],
      milestones: [],
      isPublic: false
    });
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      dueDate: goal.dueDate || '',
      relatedSkills: goal.relatedSkills || [],
      milestones: goal.milestones || [],
      isPublic: goal.isPublic
    });
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case GoalStatus.IN_PROGRESS:
        return <Clock className="w-5 h-5 text-blue-600" />;
      case GoalStatus.PAUSED:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Goals</h1>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Track and manage your personal and professional objectives
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Goal
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <DropdownSelect
            placeholder="Filter by category"
            options={[
              { value: 'all', label: 'All Categories' },
              ...Object.values(GoalCategory).map(category => ({
                value: category,
                label: category.replace('_', ' ')
              }))
            ]}
            value={filterCategory}
            onChange={(value) => setFilterCategory(value as GoalCategory | 'all')}
            className="w-48"
          />
          <DropdownSelect
            placeholder="Filter by status"
            options={[
              { value: 'all', label: 'All Statuses' },
              ...Object.values(GoalStatus).map(status => ({
                value: status,
                label: status.replace('_', ' ')
              }))
            ]}
            value={filterStatus}
            onChange={(value) => setFilterStatus(value as GoalStatus | 'all')}
            className="w-48"
          />
        </div>

        {/* Goals Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card className={`text-center py-12 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent>
              <Target className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold mb-2">No Goals Found</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                  ? 'No goals match your current filters.' 
                  : 'Start by creating your first goal to track your progress.'}
              </p>
              {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Your First Goal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(goal.status)}
                      <div className="flex-1">
                        <DropdownSelect
                          placeholder="Status"
                          value={goal.status}
                          onChange={(value) => handleStatusChange(goal.id, value as GoalStatus)}
                          options={Object.values(GoalStatus).map(status => ({
                            value: status,
                            label: status.replace('_', ' '),
                            icon: getStatusIcon(status)
                          }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {user?.role === 'MENTEE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMentorVisibility(goal.id, goal.visibleToMentor)}
                          title={goal.visibleToMentor !== false ? 'Visible to mentor - Click to hide' : 'Hidden from mentor - Click to show'}
                        >
                          {goal.visibleToMentor !== false ? (
                            <Eye className="w-4 h-4 text-blue-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{goal.title}</h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {goal.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : ''}`}>
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${goalService.getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${goalService.getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                  
                  {goal.dueDate && (
                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {/* Mentor Visibility Indicator for Mentees */}
                  {user?.role === 'MENTEE' && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${
                      goal.visibleToMentor !== false 
                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {goal.visibleToMentor !== false ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible to mentor</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden from mentor</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Goal Modal */}
        <Modal
          isOpen={showCreateModal || !!editingGoal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
            resetForm();
          }}
          title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear, specific goal title"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your goal in detail..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <DropdownSelect
                  options={Object.values(GoalCategory).map(category => ({
                    value: category,
                    label: category.replace('_', ' ')
                  }))}
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value as GoalCategory })}
                  placeholder="Select category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <DropdownSelect
                  options={Object.values(GoalPriority).map(priority => ({
                    value: priority,
                    label: priority
                  }))}
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: value as GoalPriority })}
                  placeholder="Select priority"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date (Optional)</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
                disabled={!formData.title.trim()}
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GoalsPage;