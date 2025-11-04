import { api } from './api';

export interface InvitationCode {
  id: string;
  code: string;
  role: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'USED';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

class InvitationService {
  /**
   * Generate a new invitation code (Admin only)
   */
  async generateCode(data: {
    role: string;
    email: string;
    expiresInDays?: number;
  }): Promise<InvitationCode> {
    const response = await api.post<{ invitation: InvitationCode }>('/admin/generate-invitation-code', data);
    return response.invitation;
  }

  /**
   * Get all invitation codes (Admin only)
   */
  async getInvitations(): Promise<InvitationCode[]> {
    const response = await api.get<{ invitations: InvitationCode[] }>('/admin/invitations');
    return response.invitations;
  }

  /**
   * Approve an invitation (Admin only)
   */
  async approveInvitation(invitationId: string): Promise<InvitationCode> {
    const response = await api.put<{ invitation: InvitationCode }>(`/admin/invitations/${invitationId}/approve`, {});
    return response.invitation;
  }

  /**
   * Reject an invitation (Admin only)
   */
  async rejectInvitation(invitationId: string): Promise<InvitationCode> {
    const response = await api.put<{ invitation: InvitationCode }>(`/admin/invitations/${invitationId}/reject`, {});
    return response.invitation;
  }

  /**
   * Delete an invitation code (Admin only)
   */
  async deleteInvitation(invitationId: string): Promise<void> {
    await api.delete(`/admin/invitations/${invitationId}`);
  }
}

export const invitationService = new InvitationService();
