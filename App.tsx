import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import 'react-native-gesture-handler';
import React from 'react';
import './src/i18n';
import { useEffect } from 'react';
import { useAppStore } from './src/store/useAppStore';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RootNavigator from './src/core/navigation/RootNavigator';
import { Role } from './src/core/config/permissions';
import { httpInterceptors } from './src/shared/services/httpService';
import notificationService from './src/shared/services/notificationService';
import authService from './src/shared/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/core/contexts/ThemeContext';
import ToastManager from './src/shared/components/ToastManager';
import { PersistQueryClientProvider, queryClient, asyncStoragePersister } from './src/core/services/queryClient';
import { useNavigationPrefetch } from './src/core/hooks/useNavigationPrefetch';

const RootStack = createNativeStackNavigator();
function MainApp() {
  const role = useAppStore(s => s.role) as Role;
  return <RootNavigator role={role} />;
}

function AppWrapper() {
  const { colors, activeTheme } = useTheme();
  const hydrate = useAppStore(s => s.hydrate);
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const isLoading = useAppStore(s => s.isLoading);
  
  useEffect(() => { hydrate(); }, [hydrate]);
  
  // Enable navigation-based prefetching globally
  useNavigationPrefetch();
  useEffect(() => {
    httpInterceptors.useRequest(({ config }: any) => {
      const token = useAppStore.getState().token;
      if (token) {
        config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
      }
    });
    httpInterceptors.useResponse(async ({ response }) => {
      if (!response.ok) {
        if (response.status === 401) {
          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
              const newTokens = await authService.refreshToken(refreshToken);
              useAppStore.getState().token = newTokens.accessToken;
              useAppStore.getState().refreshToken = newTokens.refreshToken;
              return;
            }
          } catch (error) {
            await useAppStore.getState().logout();
            notificationService.info('Oturum süresi doldu, lütfen tekrar giriş yapın');
          }
        }
        
        const msg = `İstek başarısız: ${response.status}`;
        notificationService.error(msg);
      }
    });
  }, []);
  
  const isDark = activeTheme === 'dark';
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...colors,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };
  
  const paperTheme = isDark ? PaperDarkTheme : PaperDefaultTheme;
  const mergedPaperTheme = {
    ...paperTheme,
    colors: {
      ...paperTheme.colors,
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      outline: colors.border,
      error: colors.error,
    },
  };
  
  if (isLoading) {
    return null; // Or return a loading screen component
  }
  
  return (
    <PaperProvider theme={mergedPaperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <RootStack.Screen name="Login" component={LoginScreen} />
              <RootStack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <RootStack.Screen name="Main" component={MainApp} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
      <ToastManager />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      }}
    >
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
