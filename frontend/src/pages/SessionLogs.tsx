import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { Button } from '../components/ui/Button';
import { ListSkeleton } from '../components/ui/Skeleton';
import { sessionLogService, SessionLog as SessionLogType } from '../services/sessionLogService';
import { useTheme } from '../context/ThemeContext';

export const SessionLogs: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionLogType[]>([]);
  const [filterAction, setFilterAction] = useState<string>('');

  const loadSessionLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await sessionLogService.getUserLogs(50, filterAction || undefined);
      setSessions(logs);
    } catch (err) {
      console.error('Failed to load session logs:', err);
      setError('Failed to load session logs');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAction]);

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('login')) return '';
    if (action.toLowerCase().includes('logout')) return '';
    if (action.toLowerCase().includes('create')) return '';
    if (action.toLowerCase().includes('update')) return '';
    if (action.toLowerCase().includes('delete')) return '';
    return '';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Session Logs
        </h1>
        <ListSkeleton items={6} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center mb-6 gap-3">
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Session Logs
        </h1>
        <Button onClick={loadSessionLogs} className="w-full xs:w-auto text-xs sm:text-sm">
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 sm:p-4 rounded-lg mb-6 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <DropdownSelect
          label="Filter by Action"
          value={filterAction}
          onChange={(value) => setFilterAction(value)}
          options={[
            { label: 'All Actions', value: '' },
            { label: 'Login', value: 'LOGIN' },
            { label: 'Logout', value: 'LOGOUT' },
            { label: 'Create', value: 'CREATE' },
            { label: 'Update', value: 'UPDATE' },
            { label: 'Delete', value: 'DELETE' },
          ]}
        />
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8 sm:py-12">
              <Clock className={`w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No session logs found
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl sm:text-2xl">{getActionIcon(session.action)}</span>
                      <h3 className={`text-base sm:text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatAction(session.action)}
                      </h3>
                    </div>
                    {session.user && (
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 truncate`}>
                        User: {session.user.firstName} {session.user.lastName} ({session.user.email})
                      </p>
                    )}
                    {session.metadata && Object.keys(session.metadata).length > 0 && (
                      <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        <details className="cursor-pointer">
                          <summary className="hover:underline font-medium">View Details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-w-full">
                            {JSON.stringify(session.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 sm:ml-4">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 justify-end sm:justify-end">
                      <Clock className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatDate(session.createdAt)}</span>
                    </div>
                    {session.ipAddress && (
                      <p className="text-xs text-gray-400 mt-1">
                        IP: {session.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionLogs;
