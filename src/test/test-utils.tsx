import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { LoadingProvider } from '../context/LoadingContext'
import { GoalProvider } from '../context/GoalContext'

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    }
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              <GoalProvider>
                {children}
              </GoalProvider>
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock user data for testing
export const mockUser = {
  id: 'test-user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  role: 'MENTEE' as const,
  bio: 'Test user bio',
  skills: ['JavaScript', 'React'],
  experience: 'Beginner',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockMentor = {
  ...mockUser,
  id: 'test-mentor-1',
  email: 'mentor@test.com',
  role: 'MENTOR' as const,
  experience: 'Senior'
}

export const mockAdmin = {
  ...mockUser,
  id: 'test-admin-1',
  email: 'admin@test.com',
  role: 'ADMIN' as const
}

// Mock API responses
export const mockApiResponses = {
  login: {
    user: mockUser,
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token'
  },
  dashboardStats: {
    totalMentees: 45,
    activeMentors: 23,
    totalMessages: 1284,
    scheduledEvents: 12,
    messagesThisWeek: 156,
    messagesSent: 89,
    upcomingEvents: 5,
    eventsAttended: 8
  }
}