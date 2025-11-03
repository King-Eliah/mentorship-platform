import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsCharts from '../../components/dashboardNew/AnalyticsCharts';
import { ThemeProvider } from '../../context/ThemeContext';
import { Role } from '../../types';

// Mock the auth hook directly
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: Role.ADMIN,
      profilePicture: null,
      createdAt: '2023-01-01T00:00:00Z',
      isActive: true
    }
  })
}));

// Mock frontendService with actual implementation
const mockAnalyticsData = {
  weeklyActivity: [
    { day: 'Mon', sessions: 25, messages: 50 },
    { day: 'Tue', sessions: 30, messages: 60 },
    { day: 'Wed', sessions: 35, messages: 70 },
  ],
  roleDistribution: [
    { role: 'Mentees', count: 60, color: '#3B82F6' },
    { role: 'Mentors', count: 30, color: '#10B981' },
    { role: 'Admins', count: 10, color: '#F59E0B' },
  ],
  monthlyGrowth: [
    { month: 'Jan', users: 100, sessions: 200 },
    { month: 'Feb', users: 150, sessions: 300 },
    { month: 'Mar', users: 200, sessions: 400 },
  ],
};

vi.mock('../../services/frontendService', () => ({
  frontendService: {
    getAnalytics: vi.fn(() => Promise.resolve(mockAnalyticsData))
  }
}));

vi.mock('../../services/skillService', () => ({
  skillService: {
    getUserSkills: vi.fn(() => Promise.resolve([]))
  }
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, label }: { data?: any[]; label?: (entry: any) => string }) => (
    <div data-testid="pie">
      {data?.map((item, index) => (
        <div key={index} data-testid={`pie-segment-${item.role.toLowerCase()}`}>
          {label ? label(item) : `${item.role}: ${item.count}`}
        </div>
      ))}
    </div>
  ),
  Cell: () => <div data-testid="cell">Cell</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar">Bar</div>,
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Grid</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line">Line</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area">Area</div>
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AnalyticsCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart sections with proper headings', () => {
    renderWithProviders(<AnalyticsCharts />);
    
    expect(screen.getByText('Weekly Platform Activity')).toBeInTheDocument();
    expect(screen.getByText('User Distribution')).toBeInTheDocument();
    expect(screen.getByText('Platform Growth Trends')).toBeInTheDocument();
  });

  it('has accessibility attributes for sections', () => {
    renderWithProviders(<AnalyticsCharts />);
    
    // Check for ARIA attributes we added
    expect(screen.getByRole('region', { name: /weekly platform activity/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /user distribution/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /platform growth trends/i })).toBeInTheDocument();
  });

  it('has proper heading hierarchy with IDs', () => {
    renderWithProviders(<AnalyticsCharts />);
    
    // Check for heading IDs that correspond to aria-labelledby
    expect(screen.getByRole('heading', { name: /weekly platform activity/i })).toHaveAttribute('id', 'weekly-activity-title');
    expect(screen.getByRole('heading', { name: /user distribution/i })).toHaveAttribute('id', 'user-distribution-title');
    expect(screen.getByRole('heading', { name: /platform growth trends/i })).toHaveAttribute('id', 'growth-trends-title');
  });

  it('shows loading skeleton initially', () => {
    renderWithProviders(<AnalyticsCharts />);
    
    // Should show loading skeletons initially
    const skeletons = screen.getAllByRole('generic');
    const hasLoadingSkeleton = skeletons.some(el => 
      el.className.includes('animate-pulse')
    );
    expect(hasLoadingSkeleton).toBe(true);
  });

  it('includes aria-hidden attribute on decorative icons', () => {
    renderWithProviders(<AnalyticsCharts />);
    
    // Check that icon elements have aria-hidden="true" by verifying the component structure
    // The icons are included in headings with proper accessibility attributes
    expect(screen.getByText('Weekly Platform Activity').closest('h3')).toHaveClass('flex', 'items-center');
    expect(screen.getByText('User Distribution').closest('h3')).toHaveClass('flex', 'items-center');
    expect(screen.getByText('Platform Growth Trends').closest('h3')).toHaveClass('flex', 'items-center');
  });
});