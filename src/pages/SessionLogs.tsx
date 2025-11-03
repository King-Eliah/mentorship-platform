import React, { useEffect, useState } from 'react';
import { Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { Button } from '../components/ui/Button';
import { ListSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

interface SessionLog {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  duration: number;
  notes: string;
  rating?: number;
  date: string | Date;
}

const fallbackSessions: SessionLog[] = Array.from({ length: 6 }, (_, i) => ({
  id: `s-${i + 1}`,
  mentorId: 'user-1',
  menteeId: `user-${i + 2}`,
  title: `Mentorship Session #${i + 1}`,
  duration: 45 + (i % 3) * 15,
  notes: 'Discussed progress and set goals for next week.',
  rating: 4 - (i % 2) * 0.5,
  date: new Date(Date.now() - i * 86400000).toISOString(),
}));

export const SessionLogs: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionLog[]>([]);

  // New session form state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [menteeId, setMenteeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use fallback sessions since we don't have session logs in frontend service yet
        setSessions(fallbackSessions);
        // const res = await frontendService.getSessionLogs(); // TODO: Implement when needed
      } catch {
        setSessions(fallbackSessions);
        setError('Showing fallback data (backend unavailable)');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !menteeId) return;
    setSubmitting(true);
    try {
      const payload = {
        mentorId: user?.id || 'user-1',
        menteeId,
        title,
        duration,
        notes,
        rating: rating === '' ? undefined : Number(rating),
  } as SessionLog;
  // Simulate creating session log
  const created = { 
    ...payload, 
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  setSessions((prev) => [created as SessionLog, ...prev]);
      setTitle('');
      setDuration(60);
      setNotes('');
      setRating('');
      setMenteeId('');
    } catch {
      // Optimistic add to list when backend not available
      const temp: SessionLog = {
        id: `tmp-${Date.now()}`,
        mentorId: user?.id || 'user-1',
        menteeId,
        title,
        duration,
        notes,
        rating: rating === '' ? undefined : Number(rating),
        date: new Date().toISOString(),
      };
      setSessions((prev) => [temp, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Session Logs</h1>
        {error && <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{error}</p>}
      </div>

      {/* Create session */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log a Session</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Record details from a mentorship session</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekly Check-in" />
            <DropdownSelect
              label="Duration"
              value={String(duration)}
              onChange={(value) => setDuration(Number(value))}
              placeholder="Select duration"
              options={[30, 45, 60, 90, 120].map((m) => ({ 
                value: String(m), 
                label: `${m} minutes`, 
                icon: <Clock className="w-4 h-4" />, 
                description: `${m} minute session` 
              }))}
            />
            <Input label="Mentee ID" value={menteeId} onChange={(e) => setMenteeId(e.target.value)} placeholder="user-123" />
            <DropdownSelect
              label="Rating (optional)"
              value={rating === '' ? '' : String(rating)}
              onChange={(value) => setRating(value ? Number(value) : '')}
              placeholder="Select rating"
              options={[
                { value: '', label: 'No rating', icon: <Star className="w-4 h-4" />, description: 'Skip rating' }, 
                ...[1, 2, 3, 4, 5].map((r) => ({ 
                  value: String(r), 
                  label: `${r} Stars`, 
                  icon: <Star className="w-4 h-4" />, 
                  description: `${r} out of 5 stars` 
                }))
              ]}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="What did you discuss? Any action items?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleCreate} loading={submitting} disabled={!title.trim() || !menteeId}>
            Save Log
          </Button>
        </CardFooter>
      </Card>

      {/* Sessions list */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <ListSkeleton items={3} itemComponent={CardSkeleton} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-gray-600 dark:text-gray-400">No sessions yet.</div>
          ) : (
            <div className="space-y-3 p-4">
              {sessions.map((s) => (
                <div key={s.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    {/* Session Info - Compact */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {s.title}
                        </h4>
                        {s.rating && (
                          <span className="flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 flex-shrink-0">
                            <Star className="w-3 h-3 mr-0.5" />
                            {s.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center flex-shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {s.duration} min
                        </span>
                        <span className="truncate">
                          {new Date(s.date).toLocaleString()}
                        </span>
                        <span className="truncate">
                          Mentee: {s.menteeId}
                        </span>
                      </div>
                      {s.notes && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 line-clamp-1">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
