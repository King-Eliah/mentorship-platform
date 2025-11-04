import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { BreadcrumbItem } from '../../utils/breadcrumbHelpers';

interface RouteConfig {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: Role[];
  parent?: string;
}

// Route configuration for breadcrumb generation
const routes: RouteConfig[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/users', label: 'Users Management', parent: '/dashboard' },
  { path: '/events', label: 'Events', parent: '/dashboard' },
  { path: '/messaging', label: 'Messaging', parent: '/dashboard' },
  { path: '/groups', label: 'Groups', parent: '/dashboard' },
  { path: '/profile', label: 'Profile', parent: '/dashboard' },
  { path: '/feedback', label: 'Feedback Center', parent: '/dashboard' },
  { path: '/resources', label: 'Resource Manager', parent: '/dashboard' },
  { path: '/analytics', label: 'Analytics Dashboard', parent: '/dashboard', roles: [Role.ADMIN, Role.MENTOR] },
  { path: '/mentor-analytics', label: 'Mentor Analytics', parent: '/dashboard', roles: [Role.ADMIN, Role.MENTOR] },
  { path: '/activities', label: 'Activity & Notifications', parent: '/dashboard' },
  { path: '/session-logs', label: 'Session Logs', parent: '/dashboard', roles: [Role.ADMIN, Role.MENTOR] },
  { path: '/incident-report', label: 'Incident Report', parent: '/dashboard', roles: [Role.ADMIN] },
  { path: '/policies', label: 'Program Policies', parent: '/dashboard' },
];

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  customItems, 
  className = "" 
}) => {
  const location = useLocation();
  const { user } = useAuth();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // If custom items are provided, use them
    if (customItems) {
      return customItems;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Find the current route configuration
    const currentRoute = routes.find(route => route.path === location.pathname);
    
    if (!currentRoute) {
      // Fallback for unknown routes
      if (pathSegments.length > 0) {
        breadcrumbs.push({ label: 'Dashboard', href: '/dashboard', icon: Home });
        pathSegments.forEach((segment, index) => {
          const path = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          breadcrumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
            href: isLast ? undefined : path
          });
        });
      }
      return breadcrumbs;
    }

    // Check if user has permission to see this route
    if (currentRoute.roles && user?.role && !currentRoute.roles.includes(user.role as Role)) {
      return [{ label: 'Dashboard', href: '/dashboard', icon: Home }];
    }

    // Build breadcrumb trail
    const buildTrail = (route: RouteConfig): BreadcrumbItem[] => {
      const trail: BreadcrumbItem[] = [];
      
      // Add parent breadcrumbs recursively
      if (route.parent) {
        const parentRoute = routes.find(r => r.path === route.parent);
        if (parentRoute) {
          trail.push(...buildTrail(parentRoute));
        }
      }
      
      // Add current route
      trail.push({
        label: route.label,
        href: route.path === location.pathname ? undefined : route.path,
        icon: route.icon
      });
      
      return trail;
    };

    return buildTrail(currentRoute);
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for single-level navigation
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-500" />
              )}
              
              {item.href ? (
                <Link
                  to={item.href}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center space-x-1 px-1 py-1 ${
                  isLast 
                    ? 'text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};