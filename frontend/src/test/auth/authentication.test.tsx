import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import { LoginForm } from '../../components/auth/LoginForm'
import { SignupForm } from '../../components/auth/SignupForm'
import { authService } from '../../services/auth'
import { Role } from '../../types'

// Mock the auth service
vi.mock('../../services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    refreshAccessToken: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    isAuthenticated: vi.fn()
  }
}))

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementations
    vi.mocked(authService.login).mockResolvedValue({
      user: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: Role.MENTEE,
        bio: '',
        skills: 'JavaScript, React',
        experience: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
    
    vi.mocked(authService.register).mockResolvedValue({
      user: {
        id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        role: Role.MENTOR,
        bio: '',
        skills: 'Leadership, Mentoring',
        experience: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
    
    vi.mocked(authService.logout).mockResolvedValue()
    vi.mocked(authService.isAuthenticated).mockReturnValue(false)
    vi.mocked(authService.getCurrentUser).mockReturnValue(null)
  })

  describe('LoginForm Component', () => {
    it('renders login form elements correctly', () => {
      render(<LoginForm />)
      
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument()
      expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })

    it('handles successful login', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'john@test.com',
          password: 'password123'
        })
      })
    })

    it('displays validation errors for empty fields', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Email is required/)).toBeInTheDocument()
        expect(screen.getByText(/Password is required/)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('handles login errors', async () => {
      const errorMessage = 'Invalid credentials'
      vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('toggles password visibility', () => {
      render(<LoginForm />)
      
      const passwordInput = screen.getByTestId('login-password-input')
      const toggleButton = screen.getByTestId('login-password-toggle')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('SignupForm Component', () => {
    it('renders signup form elements correctly', () => {
      render(<SignupForm />)
      
      expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument()
      expect(screen.getByTestId('signup-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-confirm-password-input')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /i want to join as a/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('handles successful registration', async () => {
      render(<SignupForm />)
      
      const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
      const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByTestId('signup-password-input')
      const confirmPasswordInput = screen.getByTestId('signup-confirm-password-input')
      const roleSelect = screen.getByRole('combobox', { name: /i want to join as a/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } })
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      fireEvent.change(roleSelect, { target: { value: Role.MENTEE } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'password123',
          role: Role.MENTEE
        })
      })
    })

    it('displays validation errors for empty required fields', async () => {
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/First name is required/)).toBeInTheDocument()
        expect(screen.getByText(/Last name is required/)).toBeInTheDocument()
        expect(screen.getByText(/Email is required/)).toBeInTheDocument()
        expect(screen.getByText(/Password is required/)).toBeInTheDocument()
        expect(screen.getByText(/Confirm password is required/)).toBeInTheDocument()
      })
    })

    it('validates password confirmation match', async () => {
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      const confirmPasswordInput = screen.getByTestId('signup-confirm-password-input')
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument()
      })
    })

    it('validates password minimum length', async () => {
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/)).toBeInTheDocument()
      })
    })

    it('handles registration errors', async () => {
      const errorMessage = 'Email already exists'
      vi.mocked(authService.register).mockRejectedValue(new Error(errorMessage))
      
      render(<SignupForm />)
      
      const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
      const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
      const emailInput = screen.getByRole('textbox', { name: /email address/i })
      const passwordInput = screen.getByTestId('signup-password-input')
      const confirmPasswordInput = screen.getByTestId('signup-confirm-password-input')
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } })
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } })
      fireEvent.change(emailInput, { target: { value: 'existing@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('toggles password visibility', () => {
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      const passwordToggle = screen.getByTestId('signup-password-toggle')
      const confirmPasswordInput = screen.getByTestId('signup-confirm-password-input')
      const confirmPasswordToggle = screen.getByTestId('signup-confirm-password-toggle')
      
      // Test password input toggle
      expect(passwordInput).toHaveAttribute('type', 'password')
      fireEvent.click(passwordToggle)
      expect(passwordInput).toHaveAttribute('type', 'text')
      fireEvent.click(passwordToggle)
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      // Test confirm password input toggle
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      fireEvent.click(confirmPasswordToggle)
      expect(confirmPasswordInput).toHaveAttribute('type', 'text')
      fireEvent.click(confirmPasswordToggle)
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })
  })
})