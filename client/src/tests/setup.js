import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://localhost:5000',
    VITE_APP_NAME: 'Microfinance MIS',
    MODE: 'test'
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
  };
});

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: 'mock-socket-id'
  }))
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Test utilities
export const createMockUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  role: 'member',
  status: 'active',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockLoan = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  borrower: createMockUser(),
  borrowerModel: 'User',
  amountRequested: 5000,
  interestRate: 10,
  loanTerm: 12,
  purpose: 'Business expansion',
  status: 'pending',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockTransaction = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439013',
  member: createMockUser(),
  type: 'deposit',
  amount: 1000,
  description: 'Monthly savings deposit',
  paymentMethod: 'cash',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockSavingsAccount = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439014',
  accountHolder: createMockUser(),
  accountNumber: 'SAV001',
  accountType: 'regular',
  balance: 5000,
  minimumBalance: 100,
  interestRate: 5,
  status: 'active',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockNotification = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439015',
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'info',
  priority: 'medium',
  read: false,
  recipients: [createMockUser()],
  channels: ['email', 'in-app'],
  createdAt: new Date().toISOString(),
  ...overrides
});

// API response mocks
export const mockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockApiError = (message = 'API Error', status = 400) => ({
  response: {
    data: { message },
    status,
    statusText: 'Bad Request'
  },
  message,
  isAxiosError: true
});

// Custom render function with providers
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const renderWithProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const AllTheProviders = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
