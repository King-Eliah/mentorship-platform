import React, { useState } from 'react';
import { Users, Key, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { InviteCodeManager } from '../components/admin/InviteCodeManager';
import { PendingUserManager } from '../components/admin/PendingUserManager';
import { AdminSettings } from '../components/admin/AdminSettings';
import { Card, CardContent } from '../components/ui/Card';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'invites' | 'settings'>('pending');

  // Ensure only admins can access this page
  if (!user || user.role !== Role.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This page is restricted to administrators only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'pending' as const,
      name: 'Pending Approvals',
      icon: Users,
      description: 'Review and approve new user registrations',
    },
    {
      id: 'invites' as const,
      name: 'Invite Codes',
      icon: Key,
      description: 'Generate and manage invitation codes',
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: Settings,
      description: 'Platform configuration and settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Administration Panel
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, invitations, and platform settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon
                    className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'pending' && <PendingUserManager />}
          {activeTab === 'invites' && <InviteCodeManager />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
};