import React from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface FeedbackItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  category: string;
  submittedAt: string;
}

export const Feedback: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Mock data - replace with real data
  const feedbackItems: FeedbackItem[] = [
    {
      id: '1',
      userName: 'Sarah Johnson',
      rating: 5,
      comment: 'The mentorship program has been incredibly valuable. My mentor has helped me grow both professionally and personally.',
      category: 'Mentorship',
      submittedAt: '2 hours ago'
    },
    {
      id: '2',
      userName: 'Michael Lee',
      rating: 4,
      comment: 'Great platform overall, but I would love to see more networking events and workshops.',
      category: 'Events',
      submittedAt: '5 hours ago'
    },
    {
      id: '3',
      userName: 'Jessica Rodriguez',
      rating: 5,
      comment: 'The resources section is amazing! I found everything I needed to prepare for my career transition.',
      category: 'Resources',
      submittedAt: '1 day ago'
    },
    {
      id: '4',
      userName: 'David Wilson',
      rating: 3,
      comment: 'Good experience, but the messaging system could be more intuitive.',
      category: 'Platform',
      submittedAt: '2 days ago'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mentorship':
        return isDark ? 'bg-purple-900/20 text-purple-300 border-purple-800/50' : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'events':
        return isDark ? 'bg-blue-900/20 text-blue-300 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'resources':
        return isDark ? 'bg-green-900/20 text-green-300 border-green-800/50' : 'bg-green-50 text-green-600 border-green-200';
      case 'platform':
        return isDark ? 'bg-orange-900/20 text-orange-300 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating 
                ? isDark ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-500 text-yellow-500'
                : isDark ? 'text-gray-600' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = feedbackItems.length > 0
    ? (feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length).toFixed(1)
    : '0.0';

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          } flex items-center`}>
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
            Recent Feedback
          </h3>
          <div className="flex items-center gap-1">
            <Star className={`w-4 h-4 ${isDark ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-500 text-yellow-500'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {averageRating}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/feedback')}
          className={`text-sm font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          } transition-colors`}
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {feedbackItems.slice(0, 3).map((feedback) => (
          <div
            key={feedback.id}
            className={`p-2.5 rounded-lg border ${
              isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } transition-colors cursor-pointer`}
            onClick={() => navigate('/feedback')}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                } truncate`}>
                  {feedback.userName}
                </h4>
                {renderStars(feedback.rating)}
              </div>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getCategoryColor(feedback.category)} ml-2 flex-shrink-0`}>
                {feedback.category}
              </span>
            </div>
            <p className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } line-clamp-1`}>
              {feedback.comment}
            </p>
          </div>
        ))}
      </div>

      {feedbackItems.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No feedback yet
          </p>
        </div>
      )}
    </div>
  );
};
