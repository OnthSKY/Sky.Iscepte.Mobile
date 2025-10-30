import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import authService from '../shared/services/authService';

type ThemePreference = 'system' | 'light' | 'dark';

type AppState = {
  isAuthenticated: boolean;
  themePreference: ThemePreference;
  language: 'tr' | 'en';
  role: 'admin' | 'manager' | 'user' | 'guest';
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  setTheme: (pref: ThemePreference) => Promise<void>;
  setLanguage: (lng: 'tr' | 'en') => Promise<void>;
  setRole: (role: 'admin' | 'manager' | 'user' | 'guest') => void;
  hydrate: () => Promise<void>;
  silentLogin: () => Promise<boolean>;
};

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  themePreference: 'system',
  language: 'tr',
  role: 'guest',
  token: null,
  refreshToken: null,
  isLoading: true,
  async login(u: string, p: string) {
    const ok = u === 'admin' && p === '1234';
    if (ok) {
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('user_role', 'admin');
      
      set({ 
        isAuthenticated: true, 
        role: 'admin', 
        token: accessToken,
        refreshToken: refreshToken 
      });
    }
    return ok;
  },
  async logout() {
    // Call auth service logout (which handles API call and storage cleanup)
    await authService.logout();
    
    set({ 
      isAuthenticated: false, 
      role: 'guest', 
      token: null,
      refreshToken: null 
    });
  },
  async setTheme(pref) {
    set({ themePreference: pref });
    await AsyncStorage.setItem('themePreference', pref);
  },
  async setLanguage(lng) {
    set({ language: lng });
    await AsyncStorage.setItem('lang', lng);
    i18n.changeLanguage(lng);
  },
  setRole(role) {
    set({ role });
  },
  async hydrate() {
    set({ isLoading: true });
    
    // Restore preferences
    const pref = (await AsyncStorage.getItem('themePreference')) as ThemePreference | null;
    const lng = (await AsyncStorage.getItem('lang')) as 'tr' | 'en' | null;
    if (pref) set({ themePreference: pref });
    if (lng) {
      set({ language: lng });
      i18n.changeLanguage(lng);
    }
    
    // Try silent login
    await get().silentLogin();
    
    set({ isLoading: false });
  },
  async silentLogin() {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    const storedRole = await AsyncStorage.getItem('user_role') as 'admin' | 'manager' | 'user' | 'guest';
    
    if (refreshToken) {
      try {
        // Try to refresh the access token
        const response = await authService.refreshToken(refreshToken);
        
        set({ 
          isAuthenticated: true, 
          token: response.accessToken,
          refreshToken: response.refreshToken,
          role: storedRole || 'guest'
        });
        
        // Load permissions for the restored role
        const { usePermissionStore } = await import('./permissionsStore');
        const permStore = usePermissionStore.getState();
        if (storedRole === 'admin') {
          permStore.loadPermissions(2); // Admin role ID
        } else if (storedRole === 'user') {
          permStore.loadPermissions(1); // User role ID
        }
        
        return true;
      } catch (error) {
        // Refresh token expired or invalid, clear storage
        console.log('Silent login failed, clearing storage:', error);
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user_role');
        await AsyncStorage.removeItem('user_id');
      }
    }
    
    set({ isAuthenticated: false, token: null, refreshToken: null });
    return false;
  },
}));


