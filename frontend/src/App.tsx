import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ConfirmationProvider } from './context/ConfirmationContext';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import NotificationContainer from './components/ui/NotificationContainer';
import PageLoading from './components/ui/PageLoading';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const Messages = lazy(() => import('./pages/Messages'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const MyGroup = lazy(() => import('./pages/MyGroup').then(module => ({ default: module.MyGroup })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const ResourceManager = lazy(() => import('./pages/ResourceManager').then(module => ({ default: module.ResourceManager })));
const ShareResources = lazy(() => import('./pages/ShareResources').then(module => ({ default: module.ShareResources })));
const MyMentees = lazy(() => import('./pages/MyMentees').then(module => ({ default: module.MyMentees })));
const MenteeDetail = lazy(() => import('./pages/MenteeDetail').then(module => ({ default: module.MenteeDetail })));
const SessionLogs = lazy(() => import('./pages/SessionLogs').then(module => ({ default: module.SessionLogs })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })));
const AdminGroupManagementPage = lazy(() => import('./pages/AdminGroupManagement'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const UserProfile = lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));
const ProgramPolicies = lazy(() => import('./pages/ProgramPolicies').then(module => ({ default: module.ProgramPolicies })));
const FeedbackCenter = lazy(() => import('./pages/FeedbackCenter').then(module => ({ default: module.FeedbackCenter })));
const IncidentReport = lazy(() => import('./pages/IncidentReport').then(module => ({ default: module.IncidentReport })));
const LoadingSystemDemo = lazy(() => import('./components/demo/LoadingSystemDemo').then(module => ({ default: module.LoadingSystemDemo })));
const ActivitiesPage = lazy(() => import('./pages/ActivityAndNotificationsPage').then(module => ({ default: module.default })));
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

// Inner component that uses useLocation to force route updates
const AppRoutes: React.FC = () => {
  return (
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
        path="/reset-password/:token" 
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } 
      />
      {/* Protected routes with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Suspense fallback={<PageLoading />}><Dashboard /></Suspense>} />
        <Route path="goals" element={<Suspense fallback={<PageLoading />}><GoalsPage /></Suspense>} />
        <Route path="activities" element={<Suspense fallback={<PageLoading />}><ActivitiesPage /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoading />}><Profile /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageLoading />}><Messages /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoading />}><EventsPage /></Suspense>} />
        <Route path="my-group" element={<Suspense fallback={<PageLoading />}><MyGroup /></Suspense>} />
        <Route path="resources" element={<Suspense fallback={<PageLoading />}><ResourceManager /></Suspense>} />
        <Route path="resources/share" element={<Suspense fallback={<PageLoading />}><ShareResources /></Suspense>} />
        <Route path="my-mentees" element={<Suspense fallback={<PageLoading />}><MyMentees /></Suspense>} />
        <Route path="my-mentees/:menteeId" element={<Suspense fallback={<PageLoading />}><MenteeDetail /></Suspense>} />
        <Route path="sessions" element={<Suspense fallback={<PageLoading />}><SessionLogs /></Suspense>} />
        <Route path="admin" element={<Suspense fallback={<PageLoading />}><AdminPanel /></Suspense>} />
        <Route path="groups" element={<Suspense fallback={<PageLoading />}><AdminGroupManagementPage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoading />}><UsersManagement /></Suspense>} />
        <Route path="users/:userId" element={<Suspense fallback={<PageLoading />}><UserProfile /></Suspense>} />
        <Route path="policies" element={<Suspense fallback={<PageLoading />}><ProgramPolicies /></Suspense>} />
        <Route path="feedback" element={<Suspense fallback={<PageLoading />}><FeedbackCenter /></Suspense>} />
        <Route path="incidents" element={<Suspense fallback={<PageLoading />}><IncidentReport /></Suspense>} />
        <Route path="loading-demo" element={<Suspense fallback={<PageLoading />}><LoadingSystemDemo /></Suspense>} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};const App: React.FC = () => {
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
        <ScrollToTop>
          <AppRoutes />
        </ScrollToTop>
        
        {/* Global Toast Notification Container */}
        <NotificationContainer />
      </Router>
    </ConfirmationProvider>
  );
};

export default App;