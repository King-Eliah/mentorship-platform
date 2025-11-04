import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, User, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { GlobalSearch } from '../ui/GlobalSearch';
import { NotificationBell } from '../notifications/NotificationBell';
import { notify } from '../../utils/notifications';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, sidebarCollapsed = true }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  // User dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className={`
      fixed top-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 z-50
      transition-all duration-500 ease-in-out h-16 flex items-center shadow-sm dark:shadow-gray-800/20
      ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}
      left-0
    `}
    style={{
      transitionProperty: 'left',
      transitionDuration: '500ms',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="w-full flex items-center">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Show title only on mobile */}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white lg:hidden">
            MentorApp
          </h1>
        </div>

        {/* Right side - Global Search and User Menu */}
        <div className="flex items-center justify-end flex-1 ml-auto space-x-4">
          {/* Global Search */}
          <div className="max-w-md w-full hidden sm:block">
            <GlobalSearch />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu Dropdown */}
          <div className="relative">
            <Dropdown
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              position="bottom-right"
              className="mr-4"
              trigger={
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px]"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-600 transition-all">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>
              }
            >
              <DropdownItem onClick={() => setIsUserMenuOpen(false)}>
                <Link to="/profile" className="flex items-center w-full">
                  <User className="w-4 h-4 mr-3" />
                  My Profile
                </Link>
              </DropdownItem>
              
              <DropdownItem onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </DropdownItem>
              
              <DropdownSeparator />
              
              <DropdownItem 
                variant="destructive"
                onClick={async () => {
                  notify.confirm(
                    'Are you sure you want to logout?',
                    async () => {
                      try {
                        await logout();
                        setIsUserMenuOpen(false);
                        notify.success('Logged out successfully');
                      } catch (error) {
                        console.error('Logout failed:', error);
                        notify.error('Failed to logout. Please try again.');
                      }
                    }
                  );
                }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};