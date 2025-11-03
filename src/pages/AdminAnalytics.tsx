import React, { useMemo } from 'react';
import { Users, UserCheck, User, Activity, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ExcelUploadSection } from '../components/admin/ExcelUploadSection';
import { useDashboardStats } from '../hooks/useDashboardFrontend';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '../components/ui/Button';

export const AdminAnalytics: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useDashboardStats();
  // Note: Analytics data available but not used in this simplified view
  // const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalytics();

  const loading = statsLoading;
  const error = statsError;
  const retry = refreshStats;

  const userChartData = useMemo(() => {
    if (!stats) return [];
    return [{ name: 'Users', Mentors: stats.totalMentors, Mentees: stats.totalMentees }];
  }, [stats]);

  const sessionChartData = useMemo(() => {
    if (!stats) return [];
    return [{ name: 'Sessions', Active: stats.activeSessions, Completed: stats.completedSessions }];
  }, [stats]);


  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={retry}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Analytics</h1>
          {error && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Could not load fresh data. {error}
            </p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.totalUsers ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Mentors</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.totalMentors ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-lg p-3">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Mentees</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.totalMentees ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.activeSessions ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-sky-100 dark:bg-sky-900 rounded-lg p-3">
                <BarChart3 className="h-6 w-6 text-sky-600" />
              </div>
              <div className="ml-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed Sessions</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.completedSessions ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">Upcoming Events</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.upcomingEvents ?? 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-gray-600 dark:text-gray-400" />
                  <YAxis type="category" dataKey="name" className="text-gray-600 dark:text-gray-400" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Mentees" stackId="a" fill="#4f46e5" />
                  <Bar dataKey="Mentors" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Session Status</h3>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-gray-600 dark:text-gray-400" />
                  <YAxis type="category" dataKey="name" className="text-gray-600 dark:text-gray-400" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completed" stackId="a" fill="#0ea5e9" />
                  <Bar dataKey="Active" stackId="a" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Excel Upload Section */}
      <ExcelUploadSection />
    </div>
  );
};