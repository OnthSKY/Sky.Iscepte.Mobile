import httpService from './httpService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    role: 'admin' | 'manager' | 'user' | 'guest';
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Login with username and password
   * @param username - User's username
   * @param password - User's password
   * @returns Login response with tokens and user info
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    // TODO: Replace with actual API call
    const response = await httpService.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    
    // Store tokens
    await AsyncStorage.setItem('access_token', response.accessToken);
    await AsyncStorage.setItem('refresh_token', response.refreshToken);
    await AsyncStorage.setItem('user_role', response.user.role);
    await AsyncStorage.setItem('user_id', response.user.id.toString());
    
    return response;
  },

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token
   * @returns New access and refresh tokens
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // TODO: Replace with actual API call
    const response = await httpService.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    
    // Update stored tokens
    await AsyncStorage.setItem('access_token', response.accessToken);
    await AsyncStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  },

  /**
   * Logout - clear tokens and user data
   */
  async logout(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        // TODO: Call logout API to invalidate token on server
        await httpService.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Ignore errors if server is unreachable
        console.error('Logout API call failed:', error);
      }
    }
    
    // Clear local storage
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_role');
    await AsyncStorage.removeItem('user_id');
  },
};

export default authService;
