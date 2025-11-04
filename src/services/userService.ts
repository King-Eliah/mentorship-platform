import { api } from './api';import { api } from './api';

import { User } from '../types';

export async function deleteUser(userId: string): Promise<void> {

  await api.delete(`/admin/users/${userId}`);export interface GetUsersParams {

}  page?: number;

  limit?: number;

export async function getAllUsers() {  role?: string;

  return api.get('/admin/users');  status?: string;

}  search?: string;

}

export async function getUserById(id: string) {

  return api.get(`/admin/users/${id}`);export interface GetUsersResponse {

}  users: User[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserProfile {
  user: User;
}

class UserService {
  /**
   * Get all users (Admin only)
   * For non-admin users, use searchUsers instead
   */
  async getAllUsers(params?: GetUsersParams): Promise<User[]> {
    const queryParams: Record<string, string> = {};
    
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.role) queryParams.role = params.role;
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;

    const response = await api.get<GetUsersResponse>('/admin/users', queryParams);
    return response.users;
  }

  /**
   * Search users (Available to all authenticated users)
   */
  async searchUsers(searchTerm?: string): Promise<User[]> {
    const queryParams: Record<string, string> = {};
    if (searchTerm) queryParams.q = searchTerm;

    const response = await api.get<{ users: User[] }>('/users/search', queryParams);
    return response.users;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const response = await api.get<UserProfile>(`/users/${userId}`);
    return response.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await api.put<UserProfile>(`/users/${userId}`, data);
    return response.user;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Get user's mentees (for mentors)
   */
  async getMentees(): Promise<User[]> {
    const response = await api.get<{ mentees: User[] }>('/users/mentees');
    return response.mentees;
  }

  /**
   * Get user's mentor (for mentees)
   */
  async getMentor(): Promise<User | null> {
    const response = await api.get<{ mentor: User | null }>('/users/mentor');
    return response.mentor;
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(userId: string, isActive: boolean, status?: string): Promise<User> {
    const response = await api.put<{ user: User }>(`/admin/users/${userId}/status`, {
      isActive,
      status
    });
    return response.user;
  }

  /**
   * Delete user permanently (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }

  /**
   * Create user manually (Admin only)
   */
  async createUserManually(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status?: string;
  }): Promise<{ user: User; generatedPassword: string }> {
    const response = await api.post<{ user: User; generatedPassword: string }>('/admin/users', data);
    return response;
  }

  /**
   * Get activities for a specific user (Admin only)
   */
  async getUserActivities(userId: string, limit = 20, offset = 0): Promise<unknown> {
    const queryParams: Record<string, string> = {
      limit: String(limit),
      offset: String(offset)
    };
    
    return await api.get(`/activities/user/${userId}`, queryParams);
  }
}

export const userService = new UserService();
