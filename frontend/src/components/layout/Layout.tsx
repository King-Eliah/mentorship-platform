import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ThemeToggleHint } from '../ui/ThemeToggleHint';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const [renderKey, setRenderKey] = useState(0);
  
  // Load sidebar state from localStorage on mount
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Force re-render on route change
  useEffect(() => {
    console.log('[Layout] ===== ROUTE CHANGED TO:', location.pathname, '=====');
    setRenderKey(prev => prev + 1);
    
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    
    // Force a small delay to ensure DOM updates
    const timeoutId = setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden pt-16">
      {/* Navbar - Fixed at top */}
      <Navbar 
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        sidebarCollapsed={isSidebarCollapsed}
      />

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex overflow-hidden min-h-[calc(100vh-4rem)]">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={setIsSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={setIsMobileMenuOpen}
        />
        <main 
          key={`${location.pathname}-${renderKey}`}
          className={`
            flex-1 overflow-auto p-4 sm:p-6 transition-all duration-500 ease-in-out
            ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} 
            ml-0 min-w-0
          `}
          ref={mainRef}
          style={{
            transitionProperty: 'margin-left',
            transitionDuration: '500ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
          <div className="max-w-7xl mx-auto w-full px-2 sm:px-4">
            {children || <Outlet />}
          </div>
        </main>
        <ThemeToggleHint />
      </div>
    </div>
  );
};