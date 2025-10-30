import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../core/constants/spacing';
import { useTranslation } from 'react-i18next';
import { Role, hasPermission } from '../../core/config/permissions';
import { useTheme } from '../../core/contexts/ThemeContext';

type MenuItem = {
  key: string;
  label: string;
  icon: string;
  routeName: string;
  requiredPermission?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (routeName: string) => void;
  availableRoutes?: string[];
  role?: Role;
};

const ITEMS: MenuItem[] = [
  { key: 'sales', label: '', icon: 'pricetag-outline', routeName: 'Sales', requiredPermission: 'sales:view' },
  { key: 'customers', label: '', icon: 'people-outline', routeName: 'Customers', requiredPermission: 'customers:view' },
  { key: 'expenses', label: '', icon: 'wallet-outline', routeName: 'Expenses', requiredPermission: 'expenses:view' },
  { key: 'reports', label: '', icon: 'stats-chart-outline', routeName: 'Reports', requiredPermission: 'reports:view' },
  { key: 'employees', label: '', icon: 'person-outline', routeName: 'Employees', requiredPermission: 'employees:view' },
  { key: 'profile', label: '', icon: 'person-circle-outline', routeName: 'Profile' }, // No permission required
  { key: 'settings', label: '', icon: 'settings-outline', routeName: 'Settings' }, // No permission required
  { key: 'notifications', label: '', icon: 'notifications-outline', routeName: 'Notifications' }, // No permission required
];

const QUICK_ACTIONS: MenuItem[] = [
  { key: 'qa-sale', label: '', icon: 'add-circle-outline', routeName: 'SalesCreate', requiredPermission: 'sales:create' },
  { key: 'qa-customer', label: '', icon: 'person-add-outline', routeName: 'CustomerCreate', requiredPermission: 'customers:create' },
  { key: 'qa-expense', label: '', icon: 'add-circle-outline', routeName: 'ExpenseCreate', requiredPermission: 'expenses:create' },
  { key: 'qa-reports', label: '', icon: 'stats-chart-outline', routeName: 'Reports', requiredPermission: 'reports:view' },
];

export default function FullScreenMenu({ visible, onClose, onNavigate, availableRoutes, role = 'guest' }: Props) {
  const { t } = useTranslation([
    'sales',
    'customers',
    'expenses',
    'reports',
    'employees',
    'settings',
    'notifications',
    'common',
  ]);
  const numColumns = 3;
  const { colors } = useTheme();
  const size = (Dimensions.get('window').width - spacing.xl * 2 - spacing.lg * (numColumns - 1)) / numColumns;

  const processedItems = useMemo(() => {
    const labelByRoute: Record<string, string> = {
      Sales: t('sales:sales'),
      Customers: t('customers:customers'),
      Expenses: t('expenses:expenses'),
      Reports: t('reports:reports'),
      Employees: t('settings:employees', { defaultValue: 'Employees' }),
      Profile: t('common:profile', { defaultValue: 'Profile' }),
      Settings: t('settings:settings', { defaultValue: 'Settings' }),
      Notifications: t('common:notifications', { defaultValue: 'Notifications' }),
    };
    
    return ITEMS.map((it) => {
      const hasAccess = !it.requiredPermission || hasPermission(role, it.requiredPermission);
      return {
        ...it,
        label: labelByRoute[it.routeName] ?? it.label,
        isLocked: !hasAccess,
      };
    });
  }, [t, role]);

  const processedQuickActions = useMemo(() => {
    const labelByRoute: Record<string, string> = {
      SalesCreate: t('sales:new_sale'),
      CustomerCreate: t('customers:new_customer'),
      ExpenseCreate: t('expenses:new_expense'),
      Reports: t('reports:reports'),
    };
    
    return QUICK_ACTIONS.map((qa) => {
      const hasAccess = !qa.requiredPermission || hasPermission(role, qa.requiredPermission);
      return {
        ...qa,
        label: labelByRoute[qa.routeName] ?? qa.label,
        isLocked: !hasAccess,
      };
    });
  }, [t, role]);

  const safeNavigate = (routeName: string) => {
    const canGo = availableRoutes?.includes(routeName);
    if (canGo) {
      onNavigate(routeName);
      return;
    }
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
    if (fallback && availableRoutes?.includes(fallback)) {
      onNavigate(fallback);
      return;
    }
    console.warn(`Route "${routeName}" is not registered in the current navigator.`);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('common:menu', { defaultValue: 'Menu' })}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={t('common:close', { defaultValue: 'Close' })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            {processedQuickActions.map((qa) => (
              <TouchableOpacity
                key={qa.key}
                style={styles.quickItem}
                onPress={() => {
                  if (qa.isLocked) return;
                  onClose();
                  safeNavigate(qa.routeName);
                }}
                activeOpacity={qa.isLocked ? 1 : 0.85}
                disabled={qa.isLocked}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}20` }, qa.isLocked && styles.locked]}>
                  <Ionicons name={qa.icon as any} size={22} color={qa.isLocked ? colors.muted : colors.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: qa.isLocked ? colors.muted : colors.text }]}>{qa.label}</Text>
                {qa.isLocked && (
                  <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}>
                    <Ionicons name="lock-closed" size={10} color={colors.surface} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            contentContainerStyle={{ padding: spacing.lg }}
            data={processedItems}
            numColumns={numColumns}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { width: size, height: size, backgroundColor: colors.surface }, item.isLocked && styles.locked]}
                onPress={() => {
                  if (item.isLocked) return;
                  onClose();
                  safeNavigate(item.routeName);
                }}
                activeOpacity={item.isLocked ? 1 : 0.8}
                disabled={item.isLocked}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.isLocked ? colors.muted : colors.primary} />
                </View>
                <Text style={[styles.itemLabel, { color: item.isLocked ? colors.muted : colors.text }]}>{item.label}</Text>
                {item.isLocked && (
                  <View style={[styles.lockIcon, { backgroundColor: colors.muted }]}>
                    <Ionicons name="lock-closed" size={16} color={colors.surface} />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: '600' },
  closeBtn: { padding: spacing.xs },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  item: {
    margin: spacing.sm,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }),
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemLabel: { fontSize: 12, fontWeight: '600' },
  locked: {
    opacity: 0.6,
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  }
});


