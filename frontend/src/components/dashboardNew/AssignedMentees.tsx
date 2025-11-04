import React, { useState, useEffect } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { frontendService } from '../../services/frontendService';
import { User, MentorGroup } from '../../types';
import { useNavigate } from 'react-router-dom';

export const AssignedMentees: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mentees, setMentees] = useState<User[]>([]);
  const [group, setGroup] = useState<MentorGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Fetch mentor's group
        const groups = await frontendService.getGroups();
        const mentorGroup = groups.find(g => g.mentorId === user.id);
        
        if (mentorGroup) {
          setGroup(mentorGroup);
          
          // Get all users to find mentees in this group
          const allUsers = await frontendService.getUsers();
          // Filter mentees - in a real app, groups would have member IDs
          // For now, we'll show sample mentees
          const groupMentees = allUsers.filter(u => 
            u.role === 'MENTEE' && u.isActive
          ).slice(0, 6); // Show up to 6 mentees
          
          setMentees(groupMentees);
        }
      } catch (error) {
        console.error('Failed to fetch mentees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, [user?.id]);

  const handleViewAllMentees = () => {
    navigate('/my-mentees');
  };

  if (loading) {
    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-sm border p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Assigned Mentees
            </h3>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className={`h-16 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-sm border p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Assigned Mentees
            </h3>
          </div>
        </div>
        <div className="text-center py-8">
          <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No mentees assigned yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Assigned Mentees
          </h3>
        </div>
        {group && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            {group.name}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {mentees.map((mentee) => (
          <div
            key={mentee.id}
            className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } transition-colors cursor-pointer`}
            onClick={handleViewAllMentees}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <span className="text-sm font-medium text-blue-600">
                    {mentee.firstName[0]}{mentee.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {mentee.firstName} {mentee.lastName}
                  </p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {mentee.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mentees.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewAllMentees}
            className={`w-full flex items-center justify-center gap-2 text-sm font-medium ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            } transition-colors`}
          >
            View All Mentees
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
