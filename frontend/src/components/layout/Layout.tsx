import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ThemeToggleHint } from '../ui/ThemeToggleHint';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Navbar 
        onMobileMenuToggle={handleMobileMenuToggle} 
        sidebarCollapsed={isSidebarCollapsed}
      />
      <div className="flex overflow-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={setIsSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={setIsMobileMenuOpen}
        />
        <main className={`
          flex-1 p-4 sm:p-6 transition-all duration-500 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} 
          ml-0 pt-20 mt-16 min-w-0
        `}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div className="max-w-7xl mx-auto w-full px-2 sm:px-4">
            {children}
          </div>
        </main>
        <ThemeToggleHint />
      </div>
    </div>
  );
};