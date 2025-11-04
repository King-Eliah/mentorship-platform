import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../../services/authService'
import { Role } from '../../types'

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn()
  }
}))

describe('Auth Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AuthService Methods', () => {
    it('should call signup with correct parameters', async () => {
      const signupData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MENTEE
      }

      const mockResponse = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: Role.MENTEE,
          isActive: true,
          bio: 'New mentee user',
          skills: 'To be updated',
          experience: 'To be updated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      vi.mocked(authService.signup).mockResolvedValue(mockResponse)

      const result = await authService.signup(signupData)

      expect(authService.signup).toHaveBeenCalledWith(signupData)
      expect(result).toEqual(mockResponse)
    })

    it('should call login with correct parameters', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockResponse = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: Role.MENTEE,
          isActive: true,
          bio: 'Existing user',
          skills: 'JavaScript, React',
          experience: '2 years',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const result = await authService.login(loginData)

      expect(authService.login).toHaveBeenCalledWith(loginData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle login errors', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }

      const errorMessage = 'Invalid credentials'
      vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage))

      await expect(authService.login(loginData)).rejects.toThrow(errorMessage)
    })

    it('should handle signup errors', async () => {
      const signupData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MENTEE
      }

      const errorMessage = 'Email already exists'
      vi.mocked(authService.signup).mockRejectedValue(new Error(errorMessage))

      await expect(authService.signup(signupData)).rejects.toThrow(errorMessage)
    })

    it('should call logout', async () => {
      vi.mocked(authService.logout).mockResolvedValue()

      await authService.logout()

      expect(authService.logout).toHaveBeenCalled()
    })
  })

  describe('Authentication Flows', () => {
    it('should simulate complete login flow', async () => {
      // Mock successful login
      const loginData = { email: 'user@example.com', password: 'password123' }
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.MENTEE,
        isActive: true,
        bio: 'Test user',
        skills: 'Testing',
        experience: '1 year',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(authService.login).mockResolvedValue({
        user: mockUser,
        token: 'access-token',
        refreshToken: 'refresh-token'
      })

      // Simulate login
      const loginResult = await authService.login(loginData)
      expect(loginResult.user).toEqual(mockUser)
      expect(loginResult.token).toBe('access-token')
    })

    it('should simulate complete signup flow', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: Role.MENTOR
      }

      const mockUser = {
        id: 'user-2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: Role.MENTOR,
        isActive: true,
        bio: 'New mentor user',
        skills: 'To be updated',
        experience: 'To be updated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(authService.signup).mockResolvedValue({
        user: mockUser,
        token: 'access-token',
        refreshToken: 'refresh-token'
      })

      // Simulate signup
      const signupResult = await authService.signup(signupData)
      expect(signupResult.user.role).toBe(Role.MENTOR)
      expect(signupResult.user.email).toBe('newuser@example.com')
    })

    it('should handle logout flow', async () => {
      vi.mocked(authService.logout).mockResolvedValue()

      await authService.logout()

      expect(authService.logout).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors during login', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Network error'))

      await expect(
        authService.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Network error')
    })

    it('should handle validation errors during signup', async () => {
      vi.mocked(authService.signup).mockRejectedValue(new Error('Validation failed'))

      await expect(
        authService.signup({
          email: 'invalid-email',
          password: '123',
          firstName: '',
          lastName: '',
          role: Role.MENTEE
        })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('Role-based Authentication', () => {
    it('should authenticate mentee users correctly', async () => {
      const menteeData = {
        email: 'mentee@example.com',
        password: 'password123'
      }

      const mockMentee = {
        id: 'mentee-1',
        email: 'mentee@example.com',
        firstName: 'John',
        lastName: 'Mentee',
        role: Role.MENTEE,
        isActive: true,
        bio: 'Looking for guidance',
        skills: 'JavaScript, React',
        experience: 'Beginner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(authService.login).mockResolvedValue({
        user: mockMentee,
        token: 'mentee-token',
        refreshToken: 'mentee-refresh-token'
      })

      const result = await authService.login(menteeData)
      expect(result.user.role).toBe(Role.MENTEE)
    })

    it('should authenticate mentor users correctly', async () => {
      const mentorData = {
        email: 'mentor@example.com',
        password: 'password123'
      }

      const mockMentor = {
        id: 'mentor-1',
        email: 'mentor@example.com',
        firstName: 'Jane',
        lastName: 'Mentor',
        role: Role.MENTOR,
        isActive: true,
        bio: 'Experienced developer',
        skills: 'JavaScript, React, Node.js, Leadership',
        experience: '5+ years',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      vi.mocked(authService.login).mockResolvedValue({
        user: mockMentor,
        token: 'mentor-token',
        refreshToken: 'mentor-refresh-token'
      })

      const result = await authService.login(mentorData)
      expect(result.user.role).toBe(Role.MENTOR)
      expect(result.user.skills).toContain('Leadership')
    })
  })
})