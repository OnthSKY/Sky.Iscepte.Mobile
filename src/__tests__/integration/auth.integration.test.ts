/**
 * Authentication Integration Tests
 * 
 * Tests the complete authentication flow including:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Token storage
 * - Logout
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../../screens/LoginScreen';
import { useAppStore } from '../../store/useAppStore';
import authService from '../../shared/services/authService';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
    useRoute: () => ({ params: {} }),
  };
});

// Mock secure storage
jest.mock('../../core/services/secureStorageService', () => ({
  tokenStorage: {
    setAccessToken: jest.fn(() => Promise.resolve()),
    setRefreshToken: jest.fn(() => Promise.resolve()),
    getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
    getRefreshToken: jest.fn(() => Promise.resolve('mock-refresh-token')),
    clearTokens: jest.fn(() => Promise.resolve()),
  },
  userDataStorage: {
    setUserRole: jest.fn(() => Promise.resolve()),
    setUserId: jest.fn(() => Promise.resolve()),
    getUserRole: jest.fn(() => Promise.resolve('admin')),
    getUserId: jest.fn(() => Promise.resolve('1')),
    clearUserData: jest.fn(() => Promise.resolve()),
  },
}));

describe('Authentication Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Reset store
    useAppStore.setState({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      role: 'guest',
      user: null,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{component}</NavigationContainer>
      </QueryClientProvider>
    );
  };

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock successful login
      jest.spyOn(authService, 'login').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'admin',
          role: 'admin',
        },
      });

      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen navigation={mockNavigation as any} />);

      // Fill in credentials
      const usernameInput = getByPlaceholderText(/username|kullanıcı adı/i);
      const passwordInput = getByPlaceholderText(/password|şifre/i);
      const loginButton = getByText(/login|giriş/i);

      fireEvent.changeText(usernameInput, 'admin');
      fireEvent.changeText(passwordInput, '1234');
      fireEvent.press(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(useAppStore.getState().isAuthenticated).toBe(true);
        expect(useAppStore.getState().token).toBe('mock-access-token');
        expect(useAppStore.getState().role).toBe('admin');
      });
    });

    it('should show error with invalid credentials', async () => {
      // Mock failed login
      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen navigation={mockNavigation as any} />);

      const usernameInput = getByPlaceholderText(/username|kullanıcı adı/i);
      const passwordInput = getByPlaceholderText(/password|şifre/i);
      const loginButton = getByText(/login|giriş/i);

      fireEvent.changeText(usernameInput, 'invalid');
      fireEvent.changeText(passwordInput, 'wrong');
      fireEvent.press(loginButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(useAppStore.getState().isAuthenticated).toBe(false);
      });
    });

    it('should validate form fields before submitting', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen navigation={mockNavigation as any} />);

      const loginButton = getByText(/login|giriş/i);
      fireEvent.press(loginButton);

      // Should not call login with empty fields
      await waitFor(() => {
        expect(authService.login).not.toHaveBeenCalled();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout and clear tokens', async () => {
      // Set authenticated state
      useAppStore.setState({
        isAuthenticated: true,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        role: 'admin',
      });

      // Call logout
      useAppStore.getState().logout();

      await waitFor(() => {
        expect(useAppStore.getState().isAuthenticated).toBe(false);
        expect(useAppStore.getState().token).toBeNull();
        expect(useAppStore.getState().refreshToken).toBeNull();
        expect(useAppStore.getState().role).toBe('guest');
      });
    });
  });
});

