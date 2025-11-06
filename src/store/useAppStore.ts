import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import authService from '../shared/services/authService';
import { getUserIdByRole, getUserIdByUsername } from '../core/utils/roleManager';
import { Role, Language, ThemePreference, MenuTextCase } from '../core/config/appConstants';
import { UserProfile } from '../shared/services/userService';
import { tokenStorage, userDataStorage } from '../core/services/secureStorageService';
/**
 * NEDEN: Token'ları Keychain'den okumak için secureStorageService kullanıyoruz
 * - AsyncStorage yerine güvenli storage
 * - Token'lar donanım seviyesinde şifrelenmiş
 */

type AppState = {
  isAuthenticated: boolean;
  themePreference: ThemePreference;
  language: Language;
  menuTextCase: MenuTextCase;
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
  setMenuTextCase: (caseType: MenuTextCase) => Promise<void>;
  setRole: (role: Role) => void;
  setUser: (user: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  impersonateUser: (userId: string, userRole: Role) => Promise<void>;
  stopImpersonating: () => Promise<void>;
  hydrate: () => Promise<void>;
  silentLogin: () => Promise<boolean>;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      themePreference: ThemePreference.SYSTEM,
      language: Language.TR,
      menuTextCase: MenuTextCase.NORMAL,
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
          if (profile) {
            set({ user: profile });
          }
        } catch (error) {
          // Profile fetch failed, but don't block login
          console.error('Failed to fetch profile:', error);
          // Try to log error details for debugging
          if (error instanceof Error) {
            console.error('Error message:', error.message);
          }
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
              refreshToken: response.refreshToken,
            });

            // Fetch user profile
            await get().fetchProfile();

            // Load permissions from JWT token (primary method)
            const { usePermissionStore } = await import('./permissionsStore');
            const permStore = usePermissionStore.getState();

            // Try loading from JWT first
            if (response.accessToken) {
              permStore.loadPermissionsFromToken(response.accessToken);
            } else {
              // Fallback to user data
              const userId = getUserIdByUsername(u);
              if (userId) {
                permStore.loadPermissions(userId);
              }
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
          user: null,
        });
      },
      async setTheme(pref) {
        set({ themePreference: pref });
        // NEDEN: Persist middleware otomatik kaydediyor, manuel AsyncStorage'a gerek yok
      },
      async setLanguage(lng) {
        set({ language: lng });
        i18n.changeLanguage(lng);
        // NEDEN: Persist middleware otomatik kaydediyor, manuel AsyncStorage'a gerek yok
      },
      async setMenuTextCase(caseType) {
        set({ menuTextCase: caseType });
        // NEDEN: Persist middleware otomatik kaydediyor, manuel AsyncStorage'a gerek yok
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
        const { originalRole } = get();
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

        // NEDEN: Persist middleware otomatik olarak tercihleri yükler
        // Sadece language'i i18n'e uygulamamız gerekiyor
        const lng = get().language;
        if (lng) {
          i18n.changeLanguage(lng);
        }

        // Try silent login
        await get().silentLogin();

        set({ isLoading: false });
      },
      async silentLogin() {
        // NEDEN: Token'ları Keychain'den okuyoruz (güvenli storage)
        const accessToken = await tokenStorage.getAccessToken();
        const refreshToken = await tokenStorage.getRefreshToken();
        const storedRole = (await userDataStorage.getUserRole()) as Role | null;

        // If we have both tokens, load them directly
        if (accessToken && refreshToken) {
          const role =
            storedRole && Object.values(Role).includes(storedRole) ? storedRole : Role.GUEST;

          set({
            isAuthenticated: true,
            token: accessToken,
            refreshToken,
            role,
          });

          // Fetch user profile
          await get().fetchProfile();

          // Load permissions from JWT token
          const { usePermissionStore } = await import('./permissionsStore');
          const permStore = usePermissionStore.getState();

          // Try loading from JWT first
          if (accessToken) {
            permStore.loadPermissionsFromToken(accessToken);
          } else {
            // Fallback to user data
            const userId = getUserIdByRole(role);
            if (userId) {
              permStore.loadPermissions(userId);
            }
          }

          return true;
        }

        // If we only have refresh token, try to refresh
        if (refreshToken) {
          try {
            // Try to refresh the access token
            const response = await authService.refreshToken(refreshToken);

            const role =
              storedRole && Object.values(Role).includes(storedRole) ? storedRole : Role.GUEST;

            set({
              isAuthenticated: true,
              token: response.accessToken,
              refreshToken: response.refreshToken,
              role,
            });

            // Fetch user profile after token refresh
            await get().fetchProfile();

            // Load permissions from JWT token
            const { usePermissionStore } = await import('./permissionsStore');
            const permStore = usePermissionStore.getState();

            // Try loading from JWT first
            if (response.accessToken) {
              permStore.loadPermissionsFromToken(response.accessToken);
            } else {
              // Fallback to user data
              const userId = getUserIdByRole(role);
              if (userId) {
                permStore.loadPermissions(userId);
              }
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
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AppState) => ({
        themePreference: state.themePreference,
        language: state.language,
        menuTextCase: state.menuTextCase,
        // Token'ları ve user data'yı persist etme (güvenlik ve güncellik için)
      }),
    }
  )
);
