import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ConfirmationProvider } from './context/ConfirmationContext';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ForgotPassword } from './pages/ForgotPassword';
import NotificationContainer from './components/ui/NotificationContainer';
import PageLoading from './components/ui/PageLoading';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const Messages = lazy(() => import('./pages/Messages'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const ResourceManager = lazy(() => import('./pages/ResourceManager').then(module => ({ default: module.ResourceManager })));
const ShareResources = lazy(() => import('./pages/ShareResources').then(module => ({ default: module.ShareResources })));
const MyMentees = lazy(() => import('./pages/MyMentees').then(module => ({ default: module.MyMentees })));
const MyGroup = lazy(() => import('./pages/MyGroup').then(module => ({ default: module.MyGroup })));
const SessionLogs = lazy(() => import('./pages/SessionLogs').then(module => ({ default: module.SessionLogs })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const UserProfile = lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));
const ProgramPolicies = lazy(() => import('./pages/ProgramPolicies').then(module => ({ default: module.ProgramPolicies })));
const FeedbackCenter = lazy(() => import('./pages/FeedbackCenter').then(module => ({ default: module.FeedbackCenter })));
const IncidentReport = lazy(() => import('./pages/IncidentReport').then(module => ({ default: module.IncidentReport })));
const LoadingSystemDemo = lazy(() => import('./components/demo/LoadingSystemDemo').then(module => ({ default: module.LoadingSystemDemo })));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const Landing = lazy(() => import('./pages/Landing'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App: React.FC = () => {
  const { toggleTheme } = useTheme();

  // Add keyboard shortcut for dark mode toggle (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [toggleTheme]);

  return (
    <ConfirmationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Suspense fallback={<PageLoading />}><Landing /></Suspense>} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupForm />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoading />}>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="goals" element={<GoalsPage />} />
                      <Route path="activities" element={<ActivitiesPage />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="messages" element={<Messages />} />
                      <Route path="events" element={<EventsPage />} />
                      <Route path="my-group" element={<MyGroup />} />
                      <Route path="resources" element={<ResourceManager />} />
                      <Route path="resources/share" element={<ShareResources />} />
                      <Route path="my-mentees" element={<MyMentees />} />
                      <Route path="sessions" element={<SessionLogs />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="admin" element={<AdminPanel />} />
                      {/* Analytics routes removed */}
                      <Route path="users" element={<UsersManagement />} />
                      <Route path="users/:userId" element={<UserProfile />} />
                      <Route path="policies" element={<ProgramPolicies />} />
                      <Route path="feedback" element={<FeedbackCenter />} />
                      <Route path="incidents" element={<IncidentReport />} />
                      <Route path="loading-demo" element={<LoadingSystemDemo />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        {/* Global Toast Notification Container */}
        <NotificationContainer />
      </Router>
    </ConfirmationProvider>
  );
};

export default App;