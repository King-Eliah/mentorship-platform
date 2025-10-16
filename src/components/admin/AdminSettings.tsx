import React, { useState } from 'react';
import { Save, Bell, Shield, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    newUserNotifications: true,
    systemAlerts: true,
    
    // Security Settings
    requireInviteCode: true,
    autoApprovalMentees: false,
    sessionTimeout: 30,
    
    // Platform Settings
    maintenanceMode: false,
    allowRegistration: true,
    maxUsersPerMentor: 10,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleChange = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure platform behavior and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about platform activity</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">New User Notifications</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new users register</p>
              </div>
              <button
                onClick={() => handleToggle('newUserNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.newUserNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.newUserNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">System Alerts</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive critical system alerts and warnings</p>
              </div>
              <button
                onClick={() => handleToggle('systemAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.systemAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Require Invite Codes</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mentors and admins must use invite codes to register</p>
              </div>
              <button
                onClick={() => handleToggle('requireInviteCode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireInviteCode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireInviteCode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Auto-Approve Mentees</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically approve mentee registrations without admin review</p>
              </div>
              <button
                onClick={() => handleToggle('autoApprovalMentees')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoApprovalMentees ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoApprovalMentees ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="15"
                max="480"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Users will be logged out after this period of inactivity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable access to the platform</p>
              </div>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Allow Registration</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable new user registration</p>
              </div>
              <button
                onClick={() => handleToggle('allowRegistration')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowRegistration ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                Max Users Per Mentor
              </label>
              <input
                type="number"
                value={settings.maxUsersPerMentor}
                onChange={(e) => handleChange('maxUsersPerMentor', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="1"
                max="50"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Maximum number of mentees a mentor can manage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
