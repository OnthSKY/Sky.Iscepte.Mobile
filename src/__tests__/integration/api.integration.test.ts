/**
 * API Integration Tests
 * 
 * Tests API service integration including:
 * - HTTP requests
 * - Error handling
 * - Token management
 * - Request cancellation
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import httpService from '../../shared/services/httpService';
import { useApiQuery } from '../../core/hooks/useApiQuery';
import { useAppStore } from '../../store/useAppStore';

// Mock secure storage
jest.mock('../../core/services/secureStorageService', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(() => Promise.resolve('mock-access-token')),
    getRefreshToken: jest.fn(() => Promise.resolve('mock-refresh-token')),
    setAccessToken: jest.fn(() => Promise.resolve()),
    setRefreshToken: jest.fn(() => Promise.resolve()),
    clearTokens: jest.fn(() => Promise.resolve()),
  },
  userDataStorage: {
    getUserRole: jest.fn(() => Promise.resolve('admin')),
    getUserId: jest.fn(() => Promise.resolve('1')),
  },
}));

describe('API Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set authenticated state
    useAppStore.setState({
      isAuthenticated: true,
      token: 'mock-access-token',
      role: 'admin',
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('HTTP Service', () => {
    it('should make GET request successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await httpService.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should make POST request successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await httpService.post('/test', { name: 'Test' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: 'Bad Request' }),
        } as Response)
      );

      await expect(httpService.get('/test')).rejects.toThrow();
    });

    it('should include authorization token in headers', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      );

      await httpService.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });
  });

  describe('React Query Integration', () => {
    it('should fetch data with useApiQuery', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const { result } = renderHook(
        () =>
          useApiQuery({
            endpoint: '/test',
            queryKey: ['test'],
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle query errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Server Error' }),
        } as Response)
      );

      const { result } = renderHook(
        () =>
          useApiQuery({
            endpoint: '/test',
            queryKey: ['test'],
          }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});

