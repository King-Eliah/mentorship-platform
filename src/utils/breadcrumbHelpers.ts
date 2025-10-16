import { Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Utility function to create custom breadcrumb items
export const createBreadcrumbItem = (
  label: string, 
  href?: string, 
  icon?: React.ComponentType<{ className?: string }>
): BreadcrumbItem => ({
  label,
  href,
  icon
});

// Predefined breadcrumb configurations for common patterns
export const BreadcrumbConfigs = {
  userDetails: (userName: string): BreadcrumbItem[] => [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users Management', href: '/users' },
    { label: userName }
  ],
  
  eventDetails: (eventName: string): BreadcrumbItem[] => [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Events', href: '/events' },
    { label: eventName }
  ],
  
  resourceDetails: (resourceName: string): BreadcrumbItem[] => [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Resource Manager', href: '/resources' },
    { label: resourceName }
  ],

  feedbackDetails: (feedbackId: string): BreadcrumbItem[] => [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Feedback Center', href: '/feedback' },
    { label: `Feedback #${feedbackId}` }
  ],

  messageThread: (threadName: string): BreadcrumbItem[] => [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Messaging', href: '/messaging' },
    { label: threadName }
  ]
};