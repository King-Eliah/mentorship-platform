import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { StatsSkeleton, TableSkeleton, EventSkeleton, ResourceSkeleton, UploadSkeleton, ListSkeleton } from '../ui/Skeleton';

export const LoadingSystemDemo: React.FC = () => {
  const { isLoading, setIsLoading } = useLoading();
  
  // Demo loading states
  const [dashboardLoading, setDashboardLoading] = React.useState(false);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [resourcesLoading, setResourcesLoading] = React.useState(false);
  const [uploadLoading, setUploadLoading] = React.useState(false);
  
  const isAnyLoading = dashboardLoading || usersLoading || eventsLoading || resourcesLoading || uploadLoading;

  const toggleDashboard = () => {
    setDashboardLoading(!dashboardLoading);
    if (!dashboardLoading) {
      setTimeout(() => setDashboardLoading(false), 3000);
    }
  };

  const toggleUsers = () => {
    setUsersLoading(!usersLoading);
    if (!usersLoading) {
      setTimeout(() => setUsersLoading(false), 3000);
    }
  };

  const toggleEvents = () => {
    setEventsLoading(!eventsLoading);
    if (!eventsLoading) {
      setTimeout(() => setEventsLoading(false), 3000);
    }
  };

  const toggleResources = () => {
    setResourcesLoading(!resourcesLoading);
    if (!resourcesLoading) {
      setTimeout(() => setResourcesLoading(false), 3000);
    }
  };

  const toggleUpload = () => {
    setUploadLoading(!uploadLoading);
    if (!uploadLoading) {
      setTimeout(() => setUploadLoading(false), 5000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Global Loading System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test the global loading states and skeleton components across different sections.
            {isAnyLoading && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Something is loading...
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Button
              onClick={toggleDashboard}
              variant={dashboardLoading ? "secondary" : "primary"}
              size="sm"
            >
              {dashboardLoading ? 'Stop Dashboard' : 'Load Dashboard'}
            </Button>
            <Button
              onClick={toggleUsers}
              variant={usersLoading ? "secondary" : "primary"}
              size="sm"
            >
              {usersLoading ? 'Stop Users' : 'Load Users'}
            </Button>
            <Button
              onClick={toggleEvents}
              variant={eventsLoading ? "secondary" : "primary"}
              size="sm"
            >
              {eventsLoading ? 'Stop Events' : 'Load Events'}
            </Button>
            <Button
              onClick={toggleResources}
              variant={resourcesLoading ? "secondary" : "primary"}
              size="sm"
            >
              {resourcesLoading ? 'Stop Resources' : 'Load Resources'}
            </Button>
            <Button
              onClick={toggleUpload}
              variant={uploadLoading ? "secondary" : "primary"}
              size="sm"
            >
              {uploadLoading ? 'Stop Upload' : 'Simulate Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Loading Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Dashboard Statistics</h2>
        </CardHeader>
        <CardContent>
          {dashboardLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Users</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">247</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Active Sessions</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">83</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Messages</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">1,429</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Events</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">26</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table Loading Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Users Management</h2>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              User table would appear here when not loading
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Loading Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Events</h2>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <ListSkeleton items={3} itemComponent={EventSkeleton} />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Events list would appear here when not loading
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources Loading Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Resources</h2>
        </CardHeader>
        <CardContent>
          {resourcesLoading ? (
            <ListSkeleton items={4} itemComponent={ResourceSkeleton} />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Resources would appear here when not loading
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Loading Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">File Upload</h2>
        </CardHeader>
        <CardContent>
          {uploadLoading ? (
            <UploadSkeleton fileName="document-analysis.pdf" />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Upload interface would appear here when not loading
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};