import React, { Suspense, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { filterRoutesByRole } from './routes';
import { hasPermission, Role } from '../config/permissions';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import FullScreenMenu from '../../shared/components/FullScreenMenu';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import AdminDashboardScreen from '../../screens/AdminDashboardScreen';
import OwnerDashboardScreen from '../../screens/OwnerDashboardScreen';
import StaffDashboardScreen from '../../screens/StaffDashboardScreen';

type Props = {
  role: Role;
};

export default function RootNavigator({ role }: Props) {
  const navigation = useNavigation<any>();
  const allRoutes = filterRoutesByRole(role, hasPermission);
  const [menuVisible, setMenuVisible] = useState(false);
  const { colors } = useTheme();
  
  // Get all available route names based on permissions
  const availableRouteNames = React.useMemo(() => {
    return allRoutes.map(r => r.name);
  }, [allRoutes]);

  return (
    <>
      <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator size="large" color={colors.primary} /></View>}>
        <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Dashboard"
        tabBar={(tabProps) => (
          <CustomTabBar {...tabProps} onOpenMenu={() => setMenuVisible(true)} />
        )}
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
        onNavigate={(routeName: string) => {
          setMenuVisible(false);
          // Prefer navigating to routes that are actually registered on the current navigator
          if (availableRouteNames.includes(routeName)) {
            navigation.navigate(routeName as never);
            return;
          }

          // Fallback: if a create/edit screen isn't registered, try navigating to its corresponding list screen
          const fallbackMap: Record<string, string> = {
            SalesCreate: 'Sales',
            SalesEdit: 'Sales',
            CustomerCreate: 'Customers',
            CustomerEdit: 'Customers',
            ExpenseCreate: 'Expenses',
            ExpenseEdit: 'Expenses',
            EmployeeCreate: 'Employees',
            EmployeeEdit: 'Employees',
          };
          const fallback = fallbackMap[routeName];
          if (fallback && availableRouteNames.includes(fallback)) {
            navigation.navigate(fallback as never);
            return;
          }

          console.warn(`Route "${routeName}" is not registered in the current navigator.`);
        }}
        availableRoutes={availableRouteNames}
        role={role}
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

function CustomTabBar({ state, navigation, onOpenMenu }: TabBarProps & { onOpenMenu: () => void }) {
  const { t } = useTranslation(['common']);
  const { colors } = useTheme();
  const shortcuts = [
    { key: 'Dashboard', label: t('dashboard') || 'Dashboard', icon: 'home-outline' },
    { key: 'MENU', label: t('menu', { defaultValue: 'Menu' }) || 'Menu', icon: 'apps-outline' },
    { key: 'Profile', label: t('profile') || 'Profile', icon: 'person-circle-outline' },
  ];

  const activeName = state.routeNames[state.index];

  const go = (routeName: string) => {
    if (routeName === 'MENU') {
      onOpenMenu();
      return;
    }
    if (state.routeNames.includes(routeName)) {
      navigation.navigate(routeName as never);
    } else {
      console.warn(`Route "${routeName}" does not exist for the current user.`);
    }
  };

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
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -4,
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
                <Ionicons name={shortcut.icon as any} size={28} color="#FFFFFF" />
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
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{shortcut.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
