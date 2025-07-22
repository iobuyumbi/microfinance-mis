import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockUser } from '../setup';
import Dashboard from '@/pages/Dashboard';
import * as reportService from '@/services/reportService';
import * as loanService from '@/services/loanService';
import * as memberService from '@/services/memberService';

// Mock the services
vi.mock('@/services/reportService');
vi.mock('@/services/loanService');
vi.mock('@/services/memberService');

// Mock the auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: createMockUser({ name: 'John Doe', role: 'officer' }),
    token: 'mock-token'
  })
}));

describe('Dashboard', () => {
  const mockDashboardData = {
    stats: {
      totalMembers: 150,
      activeLoans: 45,
      totalSavings: 125000,
      pendingApplications: 8,
      overduePayments: 3
    },
    recentActivity: [
      {
        description: 'New member John Smith registered',
        timestamp: new Date().toISOString(),
        type: 'member'
      },
      {
        description: 'Loan application approved for Jane Doe',
        timestamp: new Date().toISOString(),
        type: 'loan'
      }
    ],
    upcomingPayments: [
      {
        memberName: 'Alice Johnson',
        amount: 500,
        dueDate: new Date().toISOString(),
        status: 'pending'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock service responses
    reportService.getDashboardStats = vi.fn().mockResolvedValue({
      data: mockDashboardData
    });
    
    loanService.getLoans = vi.fn().mockResolvedValue({
      data: []
    });
    
    memberService.getMembers = vi.fn().mockResolvedValue({
      data: []
    });
  });

  it('renders dashboard with welcome message', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('displays key statistics cards', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Members')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Active Loans')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  it('shows recent activity feed', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText(/New member John Smith registered/)).toBeInTheDocument();
      expect(screen.getByText(/Loan application approved for Jane Doe/)).toBeInTheDocument();
    });
  });

  it('displays upcoming payments alerts', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Alerts')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('$500.00')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    });

    // Click on Loans tab
    const loansTab = screen.getByRole('tab', { name: /loans/i });
    await user.click(loansTab);
    
    expect(screen.getByText(/Recent Loan Applications/)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    // Mock loading state
    reportService.getDashboardStats = vi.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock error
    reportService.getDashboardStats = vi.fn().mockRejectedValue(
      new Error('Failed to fetch dashboard data')
    );
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('refreshes data when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    // First call fails
    reportService.getDashboardStats = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockDashboardData });
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Total Members')).toBeInTheDocument();
    });
    
    expect(reportService.getDashboardStats).toHaveBeenCalledTimes(2);
  });

  it('displays loan portfolio health metrics', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Loan Portfolio Health')).toBeInTheDocument();
      expect(screen.getByText(/Active/)).toBeInTheDocument();
      expect(screen.getByText(/Pending/)).toBeInTheDocument();
      expect(screen.getByText(/Overdue/)).toBeInTheDocument();
    });
  });

  it('shows quick action buttons', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new member/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /process loan application/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /record payment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /schedule meeting/i })).toBeInTheDocument();
    });
  });
});
