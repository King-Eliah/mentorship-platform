import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Clock, Users, Key, CheckCircle, XCircle, Shield, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DropdownSelect } from '../ui/DropdownSelect';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { InviteCode, InviteCodeType } from '../../types';
import toast from 'react-hot-toast';

interface InviteCodeManagerProps {
  onRefresh?: () => void;
}

export const InviteCodeManager: React.FC<InviteCodeManagerProps> = ({ onRefresh }) => {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    type: InviteCodeType.MENTOR,
    expiresInDays: 30,
    maxUses: 1,
  });

  // Mock data for development
  useEffect(() => {
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    setLoading(true);
    try {
      // Mock invite codes data
      const mockCodes: InviteCode[] = [
        {
          id: '1',
          code: 'MENTOR-ABC123',
          type: InviteCodeType.MENTOR,
          createdBy: 'admin@mentorconnect.com',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          maxUses: 1,
          currentUses: 0,
        },
        {
          id: '2',
          code: 'ADMIN-XYZ789',
          type: InviteCodeType.ADMIN,
          createdBy: 'admin@mentorconnect.com',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          maxUses: 1,
          currentUses: 0,
        },
      ];
      setInviteCodes(mockCodes);
    } catch {
      toast.error('Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      const newCode: InviteCode = {
        id: `${Date.now()}`,
        code: `${formData.type}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: formData.type,
        createdBy: 'admin@mentorconnect.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + formData.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        maxUses: formData.maxUses,
        currentUses: 0,
      };

      setInviteCodes(prev => [newCode, ...prev]);
      setShowCreateForm(false);
      toast.success('Invite code generated successfully!');
      onRefresh?.();
    } catch {
      toast.error('Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Invite code copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const deactivateCode = async (codeId: string) => {
    try {
      setInviteCodes(prev => 
        prev.map(code => 
          code.id === codeId ? { ...code, isActive: false } : code
        )
      );
      toast.success('Invite code deactivated');
      onRefresh?.();
    } catch {
      toast.error('Failed to deactivate invite code');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (code: InviteCode) => {
    if (!code.isActive) return <XCircle className="w-4 h-4 text-red-500" />;
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (code.maxUses && code.currentUses >= code.maxUses) {
      return <Users className="w-4 h-4 text-orange-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invite Code Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage invitation codes for mentors and administrators</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Code
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Generate New Invite Code</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <DropdownSelect
              label="Code Type"
              value={formData.type}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value as InviteCodeType }))}
              placeholder="Select invite code type"
              options={[
                { value: InviteCodeType.MENTOR, label: 'Mentor', icon: <UserCheck className="w-4 h-4" />, description: 'For mentor registration' },
                { value: InviteCodeType.ADMIN, label: 'Administrator', icon: <Shield className="w-4 h-4" />, description: 'For admin registration' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                name="expiresInDays"
                label="Expires In (Days)"
                value={formData.expiresInDays}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                min="1"
                max="365"
                required
              />
              <Input
                type="number"
                name="maxUses"
                label="Maximum Uses"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                min="1"
                max="100"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={generateInviteCode}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate Code
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Active Invite Codes</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading invite codes...</p>
            </div>
          ) : inviteCodes.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No invite codes generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inviteCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(code)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                          {code.code}
                        </code>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          code.type === InviteCodeType.ADMIN 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {code.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Created: {formatDate(code.createdAt)} • 
                        Expires: {code.expiresAt ? formatDate(code.expiresAt) : 'Never'} • 
                        Uses: {code.currentUses}/{code.maxUses || '∞'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => copyToClipboard(code.code)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {code.isActive && (
                      <Button
                        onClick={() => deactivateCode(code.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};