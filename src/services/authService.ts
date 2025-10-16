import { User, Role } from '../types';
import { frontendService } from './frontendService';

interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  requestedRole?: Role;
  inviteCode?: string;
  bio?: string;
  skills?: string;
  experience?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

class AuthService {
  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    const result = await frontendService.signup(signupData);
    return {
      user: result.user,
      token: result.token || 'pending-approval',
      refreshToken: 'mock-refresh-token'
    };
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const result = await frontendService.login(loginData.email, loginData.password);
    return {
      user: result.user,
      token: result.token,
      refreshToken: 'mock-refresh-token'
    };
  }

  async logout(_token?: string): Promise<void> {
    await frontendService.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    const user = frontendService.getCurrentUser();
    // Return null if no user is logged in (don't auto-login)
    return user || null;
  }
}

export const authService = new AuthService();
export default authService;
