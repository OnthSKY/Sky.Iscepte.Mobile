import React, { Suspense, useState, useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { filterRoutesByRole } from './routes';
import { hasPermission } from '../config/permissions';
import { Role } from '../config/appConstants';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FullScreenMenu from '../../shared/components/FullScreenMenu';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { transformMenuText, getCompactFontSize } from '../utils/menuTextUtils';
import AdminDashboardScreen from '../../screens/AdminDashboardScreen';
import OwnerDashboardScreen from '../../screens/OwnerDashboardScreen';
import StaffDashboardScreen from '../../screens/StaffDashboardScreen';
import notificationService from '../../shared/services/notificationService';
import { getErrorMessage } from '../utils/errorUtils';

type Props = {
  role: Role;
};

export default function RootNavigator({ role }: Props) {
  const allRoutes = filterRoutesByRole(role, hasPermission);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeRouteName, setActiveRouteName] = useState<string | null>('Dashboard');
  const tabNavigationRef = useRef<any>(null);
  const { colors } = useTheme();
  const { t } = useTranslation('common');
  
  // Get all available route names based on permissions
  const availableRouteNames = React.useMemo(() => {
    return allRoutes.map(r => r.name);
  }, [allRoutes]);

  // Navigation handler function
  const handleNavigate = React.useCallback(async (routeName: string) => {
    setMenuVisible(false);
    try {
      // Use Tab Navigator's navigation object if available
      const nav = tabNavigationRef.current;
      if (!nav) {
        const errorMsg = t('errors.failed_to_load', { defaultValue: 'Failed to load page' });
        notificationService.error(errorMsg);
        return;
      }

      // Prefer navigating to routes that are actually registered on the current navigator
      if (availableRouteNames.includes(routeName)) {
        try {
          nav.navigate(routeName as never);
        } catch (navError) {
          const errorMsg = getErrorMessage(navError);
          notificationService.error(errorMsg);
        }
        return;
      }

      // Fallback: if a create/edit screen isn't registered, try navigating to its corresponding list screen
      const { getNavigationFallback } = await import('../config/navigationConfig');
      const fallback = getNavigationFallback(routeName);
      if (fallback && availableRouteNames.includes(fallback)) {
        try {
          nav.navigate(fallback as never);
        } catch (navError) {
          const errorMsg = getErrorMessage(navError);
          notificationService.error(errorMsg);
        }
        return;
      }

      // Route not found - show error to user
      const errorMsg = t('errors.not_found', { defaultValue: 'Page not found' });
      notificationService.error(errorMsg);
    } catch (error) {
      // Show navigation errors to user
      const errorMsg = getErrorMessage(error);
      notificationService.error(errorMsg);
    }
  }, [availableRouteNames, t]);

  // Callback to handle navigation state changes (memoized to prevent unnecessary re-renders)
  const handleStateChange = React.useCallback((routeName: string) => {
    if (routeName && routeName !== activeRouteName) {
      setActiveRouteName(routeName);
    }
  }, [activeRouteName]);

  // Callback to open menu (memoized to prevent unnecessary re-renders)
  const handleOpenMenu = React.useCallback(() => {
    setMenuVisible(true);
  }, []);

  return (
    <>
      <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator size="large" color={colors.primary} /></View>}>
        <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Dashboard"
        tabBar={(tabProps) => {
          // Store Tab Navigator's navigation object in ref
          if (tabProps.navigation) {
            tabNavigationRef.current = tabProps.navigation;
          }
          return (
            <CustomTabBar 
              {...tabProps} 
              onOpenMenu={handleOpenMenu}
              onStateChange={handleStateChange}
            />
          );
        }}
        >
          {allRoutes.map((r) => {
            const isDashboard = r.name === 'Dashboard';
            const dashboardComponent = role === 'admin'
              ? AdminDashboardScreen
              : role === 'owner'
                ? OwnerDashboardScreen
                : StaffDashboardScreen;
            const ComponentToRender = (isDashboard ? dashboardComponent : r.component) as any;
            return (
              <Tab.Screen 
                key={r.name}
                name={r.name}
                component={ComponentToRender}
                options={r.options}
              />
            );
          })}
        </Tab.Navigator>
      </Suspense>
      <FullScreenMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleNavigate}
        availableRoutes={availableRouteNames}
        role={role}
        activeRouteName={activeRouteName}
      />
    </>
  );
}

const Tab = createBottomTabNavigator();

function getIconName(routeName: string): string {
  switch (routeName) {
    case 'Dashboard':
      return 'home-outline';
    case 'Sales':
      return 'cart-outline';
    case 'Customers':
      return 'people-outline';
    case 'Expenses':
      return 'cash-outline';
    case 'Reports':
      return 'pie-chart-outline';
    case 'Employees':
      return 'person-outline';
    case 'Profile':
      return 'person-circle-outline';
    default:
      return 'apps-outline';
  }
}

type TabBarProps = React.ComponentProps<typeof Tab.Navigator> extends { tabBar?: infer T } ? T extends (p: infer P) => any ? P : any : any;

function CustomTabBar({ state, navigation, onOpenMenu, onStateChange }: TabBarProps & { onOpenMenu: () => void; onStateChange?: (routeName: string) => void }) {
  const { t } = useTranslation(['common']);
  const { colors } = useTheme();
  const menuTextCase = useAppStore((s) => s.menuTextCase);
  const language = useAppStore((s) => s.language);
  
  const shortcuts = [
    { 
      key: 'Dashboard', 
      label: transformMenuText(t('dashboard') || 'Dashboard', menuTextCase, language), 
      icon: 'home-outline' 
    },
    { 
      key: 'MENU', 
      label: transformMenuText(t('menu', { defaultValue: 'Menu' }) || 'Menu', menuTextCase, language), 
      icon: 'apps-outline' 
    },
    { 
      key: 'Profile', 
      label: transformMenuText(t('profile') || 'Profile', menuTextCase, language), 
      icon: 'person-circle-outline' 
    },
  ];

  const activeName = state.routeNames[state.index];

  // Update parent state when navigation state changes (using useEffect to avoid render-time setState)
  useEffect(() => {
    if (onStateChange && activeName) {
      onStateChange(activeName);
    }
  }, [activeName, onStateChange]);

  const go = React.useCallback((routeName: string) => {
    if (routeName === 'MENU') {
      onOpenMenu();
      return;
    }
    if (state.routeNames.includes(routeName)) {
      navigation.navigate(routeName as never);
    } else {
      // Route not available for current user - handled by navigation handler
    }
  }, [navigation, state.routeNames, onOpenMenu]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: 70,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'flex-start',
      paddingTop: 8,
      paddingBottom: 10,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
    },
    tabLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    centerButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -22,
    },
  });

  return (
    <View style={styles.container}>
      {shortcuts.map((shortcut) => {
        const focused = activeName === shortcut.key;

        if (shortcut.key === 'MENU') {
          return (
            <TouchableOpacity
              key={shortcut.key}
              style={styles.tabButton}
              onPress={() => go(shortcut.key)}
              accessibilityRole="button"
              accessibilityLabel={shortcut.label}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.centerButton}>
                <Ionicons name={shortcut.icon as any} size={36} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={shortcut.key}
            style={styles.tabButton}
            onPress={() => go(shortcut.key)}
            accessibilityRole="button"
            accessibilityLabel={shortcut.label}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name={shortcut.icon as any} size={24} color={focused ? colors.primary : colors.muted} />
            <Text 
              style={[
                styles.tabLabel, 
                focused && styles.tabLabelActive,
                { fontSize: getCompactFontSize(11, menuTextCase) }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {shortcut.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
