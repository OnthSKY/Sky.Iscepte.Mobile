import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import authService from '../shared/services/authService';
import { getRoleByUsername, getUserIdByRole, getUserIdByUsername } from '../core/utils/roleManager';
import { Role, Language, ThemePreference } from '../core/config/appConstants';
import { UserProfile } from '../shared/services/userService';

type AppState = {
  isAuthenticated: boolean;
  themePreference: ThemePreference;
  language: Language;
  role: Role;
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  originalRole: Role | null;
  impersonatedUserId: string | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  setTheme: (pref: ThemePreference) => Promise<void>;
  setLanguage: (lng: Language) => Promise<void>;
  setRole: (role: Role) => void;
  setUser: (user: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  impersonateUser: (userId: string, userRole: Role) => Promise<void>;
  stopImpersonating: () => Promise<void>;
  hydrate: () => Promise<void>;
  silentLogin: () => Promise<boolean>;
};

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  themePreference: ThemePreference.SYSTEM,
  language: Language.TR,
  role: Role.GUEST,
  token: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  originalRole: null,
  impersonatedUserId: null,
  async fetchProfile() {
    try {
      const { userService } = await import('../shared/services/userService');
      const profile = await userService.getProfile();
      set({ user: profile });
    } catch (error) {
      // Profile fetch failed, but don't block login
    }
  },
  async login(u: string, p: string) {
    try {
      // Use authService for proper authentication
      const response = await authService.login(u, p);
      
      if (response && response.user) {
        const role = response.user.role as Role;
        
        // Set role and load permissions in one place
        set({ 
          isAuthenticated: true, 
          role, 
          token: response.accessToken,
          refreshToken: response.refreshToken 
        });
        
        // Fetch user profile
        await get().fetchProfile();
        
        // Load permissions for the user
        const userId = getUserIdByUsername(u);
        if (userId) {
          const { usePermissionStore } = await import('./permissionsStore');
          const permStore = usePermissionStore.getState();
          permStore.loadPermissions(userId);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  async logout() {
    // Invalidate queries before logout
    const { invalidateOnLogout } = await import('../core/services/cacheUtils');
    const { queryClient } = await import('../core/services/queryClient');
    await invalidateOnLogout(queryClient);
    
    // Call auth service logout (which handles API call and storage cleanup)
    await authService.logout();
    
    // Clear permissions using centralized method
    const { usePermissionStore } = await import('./permissionsStore');
    const permStore = usePermissionStore.getState();
    permStore.clearPermissions();
    
    set({ 
      isAuthenticated: false, 
      role: Role.GUEST, 
      token: null,
      refreshToken: null,
      user: null 
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
  setUser(user) {
    set({ user });
  },
  async impersonateUser(userId: string, userRole: Role) {
    const currentRole = get().role;
    // Save original role if not already impersonating
    if (!get().originalRole) {
      set({ originalRole: currentRole });
    }
    
    // Set new role and user ID
    set({ role: userRole, impersonatedUserId: userId });
    
    // Load permissions for the impersonated user
    const userIdNumber = parseInt(userId);
    if (userIdNumber) {
      const { usePermissionStore } = await import('./permissionsStore');
      const permStore = usePermissionStore.getState();
      permStore.loadPermissions(userIdNumber);
    }
  },
  async stopImpersonating() {
    const originalRole = get().originalRole;
    if (originalRole) {
      set({ role: originalRole, originalRole: null, impersonatedUserId: null });
      
      // Reload permissions for the original admin role
      const userId = getUserIdByRole(originalRole);
      if (userId) {
        const { usePermissionStore } = await import('./permissionsStore');
        const permStore = usePermissionStore.getState();
        permStore.loadPermissions(userId);
      }
    }
  },
  async hydrate() {
    set({ isLoading: true });
    
    // Restore preferences
    const pref = (await AsyncStorage.getItem('themePreference')) as ThemePreference | null;
    const lng = (await AsyncStorage.getItem('lang')) as Language | null;
    if (pref && Object.values(ThemePreference).includes(pref)) {
      set({ themePreference: pref });
    }
    if (lng && Object.values(Language).includes(lng)) {
      set({ language: lng });
      i18n.changeLanguage(lng);
    }
    
    // Try silent login
    await get().silentLogin();
    
    set({ isLoading: false });
  },
  async silentLogin() {
    const accessToken = await AsyncStorage.getItem('access_token');
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    const storedRole = (await AsyncStorage.getItem('user_role')) as Role | null;
    
    // If we have both tokens, load them directly
    if (accessToken && refreshToken) {
      const role = (storedRole && Object.values(Role).includes(storedRole)) 
        ? storedRole 
        : Role.GUEST;
      
      set({ 
        isAuthenticated: true, 
        token: accessToken,
        refreshToken: refreshToken,
        role
      });
      
      // Fetch user profile
      await get().fetchProfile();
      
      // Load permissions for the restored role using centralized helper
      const userId = getUserIdByRole(role);
      if (userId) {
        const { usePermissionStore } = await import('./permissionsStore');
        const permStore = usePermissionStore.getState();
        permStore.loadPermissions(userId);
      }
      
      return true;
    }
    
    // If we only have refresh token, try to refresh
    if (refreshToken) {
      try {
        // Try to refresh the access token
        const response = await authService.refreshToken(refreshToken);
        
        const role = (storedRole && Object.values(Role).includes(storedRole)) 
          ? storedRole 
          : Role.GUEST;
        
        set({ 
          isAuthenticated: true, 
          token: response.accessToken,
          refreshToken: response.refreshToken,
          role
        });
        
        // Fetch user profile after token refresh
        await get().fetchProfile();
        
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
        // Silent login failed, clearing storage
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user_role');
        await AsyncStorage.removeItem('user_id');
      }
    }
    
    set({ isAuthenticated: false, token: null, refreshToken: null, user: null });
    return false;
  },
}));


