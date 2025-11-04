import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings,
  User,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { responsive } from '../../utils/responsive';

interface MobileNavigationProps {
  currentPage?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className={`${responsive.nav.mobile} fixed top-4 left-4 z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          className={`p-3 rounded-lg ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } shadow-lg border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`
        ${responsive.nav.mobile}
        fixed inset-y-0 left-0 z-50 w-80 max-w-sm transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}
        shadow-xl
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              } flex items-center justify-center`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className={`flex items-center justify-center p-3 rounded-lg ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors`}>
                <Search className="w-5 h-5 mr-2" />
                <span className="text-sm">Search</span>
              </button>
              <button className={`flex items-center justify-center p-3 rounded-lg ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors relative`}>
                <Bell className="w-5 h-5 mr-2" />
                <span className="text-sm">Alerts</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = currentPage === item.name.toLowerCase();
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive
                          ? isDark 
                            ? 'bg-blue-900 text-blue-100' 
                            : 'bg-blue-50 text-blue-700'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className={`p-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="space-y-3">
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center p-3 rounded-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="w-5 h-5 mr-3">
                  {isDark ? '🌙' : '☀️'}
                </div>
                <span className="font-medium">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
              
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="w-5 h-5 mr-3">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Alternative Mobile Navigation) */}
      <div className={`
        ${responsive.nav.mobile}
        fixed bottom-0 left-0 right-0 z-40
        ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
        border-t shadow-lg
      `}>
        <nav className="flex justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = currentPage === item.name.toLowerCase();
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? isDark 
                      ? 'text-blue-400' 
                      : 'text-blue-600'
                    : isDark
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default MobileNavigation;