import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import authService from '../shared/services/authService';
import { getRoleByUsername, getUserIdByRole } from '../core/utils/roleManager';
import { Role } from '../core/config/permissions';

type ThemePreference = 'system' | 'light' | 'dark';

type AppState = {
  isAuthenticated: boolean;
  themePreference: ThemePreference;
  language: 'tr' | 'en';
  role: 'admin' | 'owner' | 'staff' | 'guest';
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  setTheme: (pref: ThemePreference) => Promise<void>;
  setLanguage: (lng: 'tr' | 'en') => Promise<void>;
  setRole: (role: 'admin' | 'owner' | 'staff' | 'guest') => void;
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
    const ok = getRoleByUsername(u) !== null && p === '1234';
    if (ok) {
      const role = getRoleByUsername(u)!;
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';
      
      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('user_role', role);
      
      // Set role and load permissions in one place
      set({ 
        isAuthenticated: true, 
        role, 
        token: accessToken,
        refreshToken: refreshToken 
      });
      
      // Load permissions for the role
      const userId = getUserIdByRole(role);
      if (userId) {
        const { usePermissionStore } = await import('./permissionsStore');
        const permStore = usePermissionStore.getState();
        permStore.loadPermissions(userId);
      }
    }
    return ok;
  },
  async logout() {
    // Call auth service logout (which handles API call and storage cleanup)
    await authService.logout();
    
    // Clear permissions using centralized method
    const { usePermissionStore } = await import('./permissionsStore');
    const permStore = usePermissionStore.getState();
    permStore.clearPermissions();
    
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
    const storedRole = await AsyncStorage.getItem('user_role') as 'admin' | 'owner' | 'staff' | 'guest';
    
    if (refreshToken) {
      try {
        // Try to refresh the access token
        const response = await authService.refreshToken(refreshToken);
        
        const role = (storedRole || 'guest') as Role;
        
        set({ 
          isAuthenticated: true, 
          token: response.accessToken,
          refreshToken: response.refreshToken,
          role
        });
        
        // Load permissions for the restored role using centralized helper
        const userId = getUserIdByRole(role);
        if (userId) {
          const { usePermissionStore } = await import('./permissionsStore');
          const permStore = usePermissionStore.getState();
          permStore.loadPermissions(userId);
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


