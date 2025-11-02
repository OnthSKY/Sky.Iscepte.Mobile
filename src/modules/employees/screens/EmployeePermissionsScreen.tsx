/**
 * EmployeePermissionsScreen - Permissions Management Screen
 * 
 * Single Responsibility: Manages employee user permissions
 * Dependency Inversion: Depends on service adapter interface
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import LoadingState from '../../../shared/components/LoadingState';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import spacing from '../../../core/constants/spacing';
import { Employee } from '../store/employeeStore';
import { employeeService } from '../services/employeeService';

interface PermissionDetail {
  actions: string[];
  fields: string[];
  notifications: string[];
}

const ALL_MODULES = ['sales', 'customers', 'expenses', 'employees', 'reports', 'stock', 'products'];
const ALL_ACTIONS = ['view', 'create', 'edit', 'delete'];
const ALL_FIELDS = ['category', 'price', 'group', 'phone', 'expenseType', 'amount', 'role', 'dateRange'];
const ALL_NOTIFICATIONS = ['dailyReport', 'lowStock'];

// Stock-specific permissions that owner can grant to staff
const STOCK_SPECIAL_PERMISSIONS = ['manage_global_fields', 'add_product_custom_fields'];

export default function EmployeePermissionsScreen() {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { t } = useTranslation(['employees', 'common', 'sales', 'customers', 'expenses', 'reports', 'stock', 'products']);
  const { employeeId, employeeName } = route.params || {};
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifiedPermissions, setModifiedPermissions] = useState<Record<string, PermissionDetail>>({});

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.get(String(employeeId));
      setEmployee(data);
      setModifiedPermissions(data.customPermissions || {});
    } catch (error) {
      console.error('Failed to load employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (
    module: string,
    type: 'actions' | 'fields' | 'notifications',
    permission: string
  ) => {
    const modulePerms = modifiedPermissions[module] || {
      actions: [],
      fields: [],
      notifications: [],
    };

    const list = modulePerms[type];
    const index = list.indexOf(permission);
    
    const updatedList = index >= 0
      ? list.filter(p => p !== permission)
      : [...list, permission];

    setModifiedPermissions({
      ...modifiedPermissions,
      [module]: {
        ...modulePerms,
        [type]: updatedList,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await employeeService.update(String(employeeId), {
        customPermissions: modifiedPermissions,
      });
      
      // Show success message
      // In a real app, you'd use a toast/notification system here
      alert(t('permissions_saved', { defaultValue: 'Permissions saved successfully' }));
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert(t('permissions_save_error', { defaultValue: 'Failed to save permissions' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout title={t('manage_permissions', { defaultValue: 'Manage Permissions' })} showBackButton>
        <LoadingState />
      </ScreenLayout>
    );
  }

  const renderModuleSection = (module: string) => {
    const modulePerms = modifiedPermissions[module] || {
      actions: [],
      fields: [],
      notifications: [],
    };

    const isStockModule = module === 'stock';

    return (
      <Card key={module} style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
          {t(`${module}:${module}`, { defaultValue: module })}
        </Text>

        {/* Actions */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.muted }}>
            {t('employees:actions', { defaultValue: 'Actions' })}
          </Text>
          <View style={{ gap: spacing.xs }}>
            {ALL_ACTIONS.map((action) => (
              <View key={action} style={styles.permissionRow}>
                <Text style={{ flex: 1, color: colors.text }}>
                  {t(`common:${action}`, { defaultValue: action })}
                </Text>
                <Switch
                  value={modulePerms.actions.includes(action)}
                  onValueChange={() => togglePermission(module, 'actions', action)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Stock Special Permissions - Only for stock module */}
        {isStockModule && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.muted }}>
              {t('employees:special_permissions', { defaultValue: 'Special Permissions' })}
            </Text>
            <View style={{ gap: spacing.xs }}>
              {STOCK_SPECIAL_PERMISSIONS.map((permission) => {
                // Check if permission is in actions list (for backward compatibility)
                // or handle it separately
                const hasPermission = modulePerms.actions.includes(permission);
                return (
                  <View key={permission} style={styles.permissionRow}>
                    <Text style={{ flex: 1, color: colors.text }}>
                      {t(`stock:${permission}`, { 
                        defaultValue: permission === 'manage_global_fields' 
                          ? 'Genel Alanları Yönet' 
                          : 'Özel Ürün Alanları Ekle' 
                      })}
                    </Text>
                    <Switch
                      value={hasPermission}
                      onValueChange={() => togglePermission(module, 'actions', permission)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.surface}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Fields */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.muted }}>
            {t('employees:fields', { defaultValue: 'Fields' })}
          </Text>
          <View style={{ gap: spacing.xs }}>
            {ALL_FIELDS.map((field) => (
              <View key={field} style={styles.permissionRow}>
                <Text style={{ flex: 1, color: colors.text }}>
                  {t(`common:${field}`, { defaultValue: field })}
                </Text>
                <Switch
                  value={modulePerms.fields.includes(field)}
                  onValueChange={() => togglePermission(module, 'fields', field)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.muted }}>
            {t('employees:notifications', { defaultValue: 'Notifications' })}
          </Text>
          <View style={{ gap: spacing.xs }}>
            {ALL_NOTIFICATIONS.map((notification) => (
              <View key={notification} style={styles.permissionRow}>
                <Text style={{ flex: 1, color: colors.text }}>
                  {t(`common:${notification}`, { defaultValue: notification })}
                </Text>
                <Switch
                  value={modulePerms.notifications.includes(notification)}
                  onValueChange={() => togglePermission(module, 'notifications', notification)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            ))}
          </View>
        </View>
      </Card>
    );
  };

  const renderFooter = () => (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <Button
        title={t('common:save', { defaultValue: 'Save' })}
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={{ flex: 1 }}
      />
    </View>
  );

  return (
    <ScreenLayout 
      title={t('manage_permissions', { defaultValue: 'Manage Permissions' })} 
      showBackButton
      footer={renderFooter()}
    >
      <ScrollView>
        <View style={styles.content}>
          {employeeName && (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                {t('employee_name', { defaultValue: 'Employee' })}: {employeeName}
              </Text>
            </Card>
          )}

          {ALL_MODULES.map(renderModuleSection)}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.md,
  },
});

