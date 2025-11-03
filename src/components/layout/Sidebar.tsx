import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Heart,
  BookOpen,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  X,
  UserCog,
  Settings,
  Target,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface SubNavItem {
  name: string;
  href: string;
  roles?: Role[];
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
  subItems?: SubNavItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Messaging', href: '/messages', icon: MessageSquare },
  { 
    name: 'Resources', 
    href: '/resources', 
    icon: BookOpen,
    subItems: [
      { name: 'Share Resources', href: '/resources/share', roles: [Role.MENTOR] },
      { name: 'My Resources', href: '/resources', roles: [Role.MENTOR, Role.MENTEE] }
    ]
  },
  // Role-based group navigation
  { name: 'Group Management', href: '/my-mentees', icon: Users, roles: [Role.ADMIN] },
  { name: 'My Mentees', href: '/my-mentees', icon: Users, roles: [Role.MENTOR] },
  { name: 'My Group', href: '/my-group', icon: Users, roles: [Role.MENTEE] },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'User Management', href: '/users', icon: UserCog, roles: [Role.ADMIN] },
  { name: 'Admin Panel', href: '/admin', icon: Settings, roles: [Role.ADMIN] },
  // Analytics navigation removed
  { name: 'Session Logs', href: '/sessions', icon: Clock, roles: [Role.ADMIN, Role.MENTOR] },
  { name: 'Feedback Center', href: '/feedback', icon: Heart },
  { name: 'Incident Reports', href: '/incidents', icon: AlertTriangle },
  { name: 'Program Policies', href: '/policies', icon: Shield },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  isMobileOpen, 
  onMobileToggle 
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (itemName: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const filteredNavigation = navigation.map(item => ({
    ...item,
    subItems: item.subItems?.filter(subItem => 
      !subItem.roles || subItem.roles.includes(user?.role as Role)
    )
  })).filter(item => 
    !item.roles || item.roles.includes(user?.role as Role)
  );

  const handleLinkClick = () => {
    onMobileToggle(false);
  };

  const handleMouseEnter = () => {
    if (isCollapsed && window.innerWidth >= 1024) {
      onToggle(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isCollapsed && window.innerWidth >= 1024) {
      onToggle(true);
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => onMobileToggle(false)}
        />
      )}

      <div 
        className={`
          fixed inset-y-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transition-all duration-500 ease-in-out z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64 transform shadow-sm dark:shadow-gray-800/20
        `}
        style={{
          transitionProperty: 'width, transform',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative">
            {(!isCollapsed || isMobileOpen) ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-white dark:text-gray-900 font-bold text-sm">M</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">MentorConnect</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-sm">M</span>
              </div>
            )}
          </div>

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
            <button
              onClick={() => onMobileToggle(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = item.href && location.pathname === item.href;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.includes(item.name);
              const Icon = item.icon;

              return (
                <div key={item.name}>
                  {/* Main Menu Item */}
                  {item.href && !hasSubItems ? (
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg 
                        transition-all duration-200 ease-in-out relative
                        ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}
                        ${isActive
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`
                        flex-shrink-0 transition-colors duration-200
                        ${isCollapsed && !isMobileOpen ? 'w-5 h-5' : 'w-5 h-5 mr-3'}
                        ${isActive ? 'text-gray-900 dark:text-white' : ''}
                      `} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => hasSubItems ? toggleMenu(item.name) : item.href && (window.location.href = item.href)}
                        className={`
                          w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg 
                          transition-all duration-200 ease-in-out relative
                          ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}
                          ${isActive
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div className="flex items-center flex-1">
                          <Icon className={`
                            flex-shrink-0 transition-colors duration-200
                            ${isCollapsed && !isMobileOpen ? 'w-5 h-5' : 'w-5 h-5 mr-3'}
                            ${isActive ? 'text-gray-900 dark:text-white' : ''}
                          `} />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                        {hasSubItems && (!isCollapsed || isMobileOpen) && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      
                      {/* Sub Menu Items */}
                      {hasSubItems && isExpanded && (!isCollapsed || isMobileOpen) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.subItems?.map((subItem) => {
                            const isSubActive = location.pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={handleLinkClick}
                                className={`
                                  block px-3 py-2 text-sm rounded-lg transition-colors duration-200
                                  ${isSubActive
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                  }
                                `}
                              >
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
            <button
              onClick={() => {
                logout();
                onMobileToggle(false);
              }}
              className={`
                w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl 
                transition-all duration-300 ease-in-out
                ${isCollapsed && !isMobileOpen ? 'justify-center px-3' : ''}
                text-red-400 hover:text-white hover:bg-red-500/20 hover:border 
                hover:border-red-500/30 hover:shadow-lg hover:scale-105
                border border-transparent
              `}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut className={`
                ${isCollapsed && !isMobileOpen ? 'mx-auto' : 'mr-4'} 
                h-5 w-5 flex-shrink-0 transition-all duration-300
              `} />
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};