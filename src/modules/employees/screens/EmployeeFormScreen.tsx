/**
 * EmployeeFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, Switch, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Employee } from '../store/employeeStore';
import { employeeFormFields, employeeUserAccountFields, employeeValidator } from '../config/employeeFormConfig';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import spacing from '../../../core/constants/spacing';
import Card from '../../../shared/components/Card';
import Select from '../../../shared/components/Select';
import Input from '../../../shared/components/Input';
import { Role } from '../../../core/config/appConstants';

interface EmployeeFormScreenProps {
  mode?: 'create' | 'edit';
}

// Username suggestion function
const generateUsername = (firstName: string = '', lastName: string = ''): string => {
  const clean = (str: string) => str
    .toLowerCase()
    .replace(/ı/gi, 'i')
    .replace(/ğ/gi, 'g')
    .replace(/ü/gi, 'u')
    .replace(/ş/gi, 's')
    .replace(/ö/gi, 'o')
    .replace(/ç/gi, 'c')
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric AFTER Turkish char replacement
  
  const cleanFirst = clean(firstName);
  const cleanLast = clean(lastName);
  
  if (!cleanFirst && !cleanLast) return '';
  if (!cleanFirst) return cleanLast;
  if (!cleanLast) return cleanFirst;
  
  // Combine first + last, max 20 chars
  return `${cleanFirst}.${cleanLast}`.slice(0, 20);
};

export default function EmployeeFormScreen({ mode }: EmployeeFormScreenProps = {}) {
  const route = useRoute<any>();
  const { colors, activeTheme } = useTheme();
  const { t } = useTranslation(['employees', 'common']);
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');
  const isCreateMode = formMode === 'create';
  
  // Module definitions
  const ALL_MODULES = ['sales', 'customers', 'expenses', 'employees', 'reports', 'stock'];
  const ALL_ACTIONS = ['view', 'create', 'edit', 'delete'];

  // Role options for select (NO GUEST)
  const roleOptions = [
    { label: t('common:admin', { defaultValue: 'Admin' }), value: Role.ADMIN },
    { label: t('common:owner', { defaultValue: 'Owner' }), value: Role.OWNER },
    { label: t('common:staff', { defaultValue: 'Staff' }), value: Role.STAFF },
  ];

  return (
    <FormScreenContainer
      service={employeeEntityService}
      config={{
        entityName: 'employee',
        translationNamespace: 'employees',
        mode: formMode,
      }}
      validator={employeeValidator}
      renderForm={(formData, updateField, errors) => {
        // Auto-generate username when firstName/lastName changes
        const handleFieldChange = (field: keyof Employee, value: any) => {
          updateField(field, value);
          
          // Auto-suggest username when creating account and firstName/lastName is filled
          if (isCreateMode && createUserAccount && !formData.username) {
            if (field === 'firstName' || field === 'lastName') {
              const newFirstName = field === 'firstName' ? value : formData.firstName;
              const newLastName = field === 'lastName' ? value : formData.lastName;
              const suggested = generateUsername(newFirstName as string, newLastName as string);
              if (suggested) {
                updateField('username', suggested);
              }
            }
          }
        };

        return (
          <View style={{ gap: spacing.lg }}>
            {/* Basic Information */}
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
                {t('basic_information', { defaultValue: 'Basic Information' })}
              </Text>
              <DynamicForm
                namespace="employees"
                columns={2}
                fields={employeeFormFields}
                values={formData}
                onChange={(v) => {
                  Object.keys(v).forEach((key) => {
                    handleFieldChange(key as keyof Employee, v[key]);
                  });
                }}
              />
            </View>

          {/* User Account Section */}
          {isCreateMode && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />
              
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
                  {t('user_account', { defaultValue: 'User Account' })}
                </Text>
                
                <View style={{ gap: spacing.md }}>
                  <Text style={{ fontSize: 16, color: colors.muted }}>
                    {t('create_user_account_desc', { defaultValue: 'Do you want to create a user account for this employee?' })}
                  </Text>
                  
                  <Select
                    value={createUserAccount ? 'yes' : 'no'}
                    options={[
                      { label: t('common:yes', { defaultValue: 'Yes' }), value: 'yes' },
                      { label: t('common:no', { defaultValue: 'No' }), value: 'no' },
                    ]}
                    placeholder={t('select', { defaultValue: 'Select' })}
                    onChange={(value) => {
                      const shouldCreate = value === 'yes';
                      setCreateUserAccount(shouldCreate);
                      if (!shouldCreate) {
                        // Clear user account fields if user doesn't want to create account
                        updateField('username', undefined);
                        updateField('password', undefined);
                        updateField('userRole', undefined);
                      } else {
                        // Auto-generate username when enabling user account
                        const suggested = generateUsername(formData.firstName as string, formData.lastName as string);
                        if (suggested && !formData.username) {
                          updateField('username', suggested);
                        }
                      }
                    }}
                  />
                </View>

                {createUserAccount && (
                  <>
                    <Card style={{ marginTop: spacing.md }}>
                      <View style={{ gap: spacing.md }}>
                        {/* Username field */}
                        <View>
                          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.xs, color: colors.text }}>
                            {t('username', { defaultValue: 'Username' })}
                            <Text style={{ color: colors.error }}> *</Text>
                          </Text>
                          <Input
                            value={formData.username}
                            onChangeText={(text) => updateField('username', text)}
                            placeholder={t('username_placeholder', { defaultValue: 'Username' })}
                            error={!!errors.username}
                          />
                          {errors.username && (
                            <Text style={{ fontSize: 12, color: colors.error, marginTop: spacing.xs }}>
                              {errors.username}
                            </Text>
                          )}
                        </View>

                        {/* Password field */}
                        <View>
                          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.xs, color: colors.text }}>
                            {t('password', { defaultValue: 'Password' })}
                            <Text style={{ color: colors.error }}> *</Text>
                          </Text>
                          <Input
                            value={formData.password}
                            onChangeText={(text) => updateField('password', text)}
                            placeholder={t('password_placeholder', { defaultValue: 'Password' })}
                            secureTextEntry
                            error={!!errors.password}
                          />
                          {errors.password && (
                            <Text style={{ fontSize: 12, color: colors.error, marginTop: spacing.xs }}>
                              {errors.password}
                            </Text>
                          )}
                        </View>
                        
                        {/* User Role */}
                        <View>
                          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.text }}>
                            {t('user_role', { defaultValue: 'User Role' })}
                          </Text>
                          <Select
                            value={formData.userRole}
                            options={roleOptions}
                            placeholder={t('select_role', { defaultValue: 'Select Role' })}
                            onChange={(value) => updateField('userRole', value)}
                          />
                        </View>
                      </View>
                    </Card>

                    {/* Permissions Section */}
                    {formData.userRole === Role.ADMIN || formData.userRole === Role.OWNER ? (
                      <Card style={{ marginTop: spacing.md, backgroundColor: colors.success + '10', borderWidth: 1, borderColor: colors.success + '30' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                          </View>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 }}>
                            {formData.userRole === Role.ADMIN 
                              ? t('admin_full_access', { defaultValue: 'Admin has full access to all modules' })
                              : t('owner_full_access', { defaultValue: 'Owner has full access to all modules' })
                            }
                          </Text>
                        </View>
                      </Card>
                    ) : formData.userRole === Role.STAFF ? (
                      <Card style={{ marginTop: spacing.md }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
                          {t('permissions', { defaultValue: 'Permissions' })}
                        </Text>
                        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: spacing.md }}>
                          {t('select_permissions_desc', { defaultValue: 'Select the permissions this user will have:' })}
                        </Text>
                        <ScrollView style={{ maxHeight: 500 }}>
                          <View style={{ gap: spacing.md }}>
                            {/* Sales Module */}
                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                              <TouchableOpacity 
                                onPress={() => setExpandedModules({ ...expandedModules, sales: !expandedModules.sales })}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                              >
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                  {t('common:sales', { defaultValue: 'Sales' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      const current = formData.customPermissions || {};
                                      const sales = current.sales || { actions: [], fields: [], notifications: [] };
                                      const allSelected = ['view', 'create', 'edit', 'delete'].every(action => sales.actions?.includes(action));
                                      const newActions = allSelected ? [] : ['view', 'create', 'edit', 'delete'];
                                      updateField('customPermissions', {
                                        ...current,
                                        sales: { ...sales, actions: newActions },
                                      });
                                    }}
                                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                      {['view', 'create', 'edit', 'delete'].every(action => formData.customPermissions?.sales?.actions?.includes(action)) ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                    </Text>
                                  </TouchableOpacity>
                                  <Ionicons 
                                    name={expandedModules.sales ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color={colors.text} 
                                  />
                                </View>
                              </TouchableOpacity>
                              {expandedModules.sales && (
                                <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                  <View style={{ gap: spacing.xs }}>
                                    {['view', 'create', 'edit', 'delete'].map((action) => (
                                      <View key={`sales_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                        <Text style={{ flex: 1, color: colors.text }}>
                                          {t(`common:${action}`, { defaultValue: action })}
                                        </Text>
                                        <Switch
                                          value={formData.customPermissions?.sales?.actions?.includes(action) || false}
                                          onValueChange={(value) => {
                                            const current = formData.customPermissions || {};
                                            const sales = current.sales || { actions: [], fields: [], notifications: [] };
                                            const actions = value
                                              ? [...(sales.actions || []), action]
                                              : (sales.actions || []).filter(a => a !== action);
                                            updateField('customPermissions', {
                                              ...current,
                                              sales: { ...sales, actions },
                                            });
                                          }}
                                          trackColor={{ false: colors.border, true: colors.primary }}
                                          thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>

                            {/* Customers Module */}
                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                              <TouchableOpacity 
                                onPress={() => setExpandedModules({ ...expandedModules, customers: !expandedModules.customers })}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                              >
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                  {t('common:customers', { defaultValue: 'Customers' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      const current = formData.customPermissions || {};
                                      const customers = current.customers || { actions: [], fields: [], notifications: [] };
                                      const allSelected = ['view', 'create', 'edit', 'delete'].every(action => customers.actions?.includes(action));
                                      const newActions = allSelected ? [] : ['view', 'create', 'edit', 'delete'];
                                      updateField('customPermissions', {
                                        ...current,
                                        customers: { ...customers, actions: newActions },
                                      });
                                    }}
                                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                      {['view', 'create', 'edit', 'delete'].every(action => formData.customPermissions?.customers?.actions?.includes(action)) ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                    </Text>
                                  </TouchableOpacity>
                                  <Ionicons 
                                    name={expandedModules.customers ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color={colors.text} 
                                  />
                                </View>
                              </TouchableOpacity>
                              {expandedModules.customers && (
                                <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                  <View style={{ gap: spacing.xs }}>
                                    {['view', 'create', 'edit', 'delete'].map((action) => (
                                      <View key={`customers_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                        <Text style={{ flex: 1, color: colors.text }}>
                                          {t(`common:${action}`, { defaultValue: action })}
                                        </Text>
                                        <Switch
                                          value={formData.customPermissions?.customers?.actions?.includes(action) || false}
                                          onValueChange={(value) => {
                                            const current = formData.customPermissions || {};
                                            const customers = current.customers || { actions: [], fields: [], notifications: [] };
                                            const actions = value
                                              ? [...(customers.actions || []), action]
                                              : (customers.actions || []).filter(a => a !== action);
                                            updateField('customPermissions', {
                                              ...current,
                                              customers: { ...customers, actions },
                                            });
                                          }}
                                          trackColor={{ false: colors.border, true: colors.primary }}
                                          thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>

                            {/* Expenses Module */}
                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                              <TouchableOpacity 
                                onPress={() => setExpandedModules({ ...expandedModules, expenses: !expandedModules.expenses })}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                              >
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                  {t('common:expenses', { defaultValue: 'Expenses' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      const current = formData.customPermissions || {};
                                      const expenses = current.expenses || { actions: [], fields: [], notifications: [] };
                                      const allSelected = ['view', 'create', 'edit', 'delete'].every(action => expenses.actions?.includes(action));
                                      const newActions = allSelected ? [] : ['view', 'create', 'edit', 'delete'];
                                      updateField('customPermissions', {
                                        ...current,
                                        expenses: { ...expenses, actions: newActions },
                                      });
                                    }}
                                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                      {['view', 'create', 'edit', 'delete'].every(action => formData.customPermissions?.expenses?.actions?.includes(action)) ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                    </Text>
                                  </TouchableOpacity>
                                  <Ionicons 
                                    name={expandedModules.expenses ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color={colors.text} 
                                  />
                                </View>
                              </TouchableOpacity>
                              {expandedModules.expenses && (
                                <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                  <View style={{ gap: spacing.xs }}>
                                    {['view', 'create', 'edit', 'delete'].map((action) => (
                                      <View key={`expenses_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                        <Text style={{ flex: 1, color: colors.text }}>
                                          {t(`common:${action}`, { defaultValue: action })}
                                        </Text>
                                        <Switch
                                          value={formData.customPermissions?.expenses?.actions?.includes(action) || false}
                                          onValueChange={(value) => {
                                            const current = formData.customPermissions || {};
                                            const expenses = current.expenses || { actions: [], fields: [], notifications: [] };
                                            const actions = value
                                              ? [...(expenses.actions || []), action]
                                              : (expenses.actions || []).filter(a => a !== action);
                                            updateField('customPermissions', {
                                              ...current,
                                              expenses: { ...expenses, actions },
                                            });
                                          }}
                                          trackColor={{ false: colors.border, true: colors.primary }}
                                          thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>

                            {/* Stock Module */}
                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                              <TouchableOpacity 
                                onPress={() => setExpandedModules({ ...expandedModules, stock: !expandedModules.stock })}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                              >
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                  {t('common:stock', { defaultValue: 'Stock' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      const current = formData.customPermissions || {};
                                      const stock = current.stock || { actions: [], fields: [], notifications: [] };
                                      const allSelected = ['view', 'create', 'edit', 'delete'].every(action => stock.actions?.includes(action));
                                      const newActions = allSelected ? [] : ['view', 'create', 'edit', 'delete'];
                                      updateField('customPermissions', {
                                        ...current,
                                        stock: { ...stock, actions: newActions },
                                      });
                                    }}
                                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                      {['view', 'create', 'edit', 'delete'].every(action => formData.customPermissions?.stock?.actions?.includes(action)) ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                    </Text>
                                  </TouchableOpacity>
                                  <Ionicons 
                                    name={expandedModules.stock ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color={colors.text} 
                                  />
                                </View>
                              </TouchableOpacity>
                              {expandedModules.stock && (
                                <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                  <View style={{ gap: spacing.xs }}>
                                    {['view', 'create', 'edit', 'delete'].map((action) => (
                                      <View key={`stock_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                        <Text style={{ flex: 1, color: colors.text }}>
                                          {t(`common:${action}`, { defaultValue: action })}
                                        </Text>
                                        <Switch
                                          value={formData.customPermissions?.stock?.actions?.includes(action) || false}
                                          onValueChange={(value) => {
                                            const current = formData.customPermissions || {};
                                            const stock = current.stock || { actions: [], fields: [], notifications: [] };
                                            const actions = value
                                              ? [...(stock.actions || []), action]
                                              : (stock.actions || []).filter(a => a !== action);
                                            updateField('customPermissions', {
                                              ...current,
                                              stock: { ...stock, actions },
                                            });
                                          }}
                                          trackColor={{ false: colors.border, true: colors.primary }}
                                          thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>

                            {/* Reports Module */}
                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                              <TouchableOpacity 
                                onPress={() => setExpandedModules({ ...expandedModules, reports: !expandedModules.reports })}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                              >
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                  {t('common:reports', { defaultValue: 'Reports' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      const current = formData.customPermissions || {};
                                      const reports = current.reports || { actions: [], fields: [], notifications: [] };
                                      const allSelected = ['view'].every(action => reports.actions?.includes(action));
                                      const newActions = allSelected ? [] : ['view'];
                                      updateField('customPermissions', {
                                        ...current,
                                        reports: { ...reports, actions: newActions },
                                      });
                                    }}
                                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                      {['view'].every(action => formData.customPermissions?.reports?.actions?.includes(action)) ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                    </Text>
                                  </TouchableOpacity>
                                  <Ionicons 
                                    name={expandedModules.reports ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color={colors.text} 
                                  />
                                </View>
                              </TouchableOpacity>
                              {expandedModules.reports && (
                                <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                  <View style={{ gap: spacing.xs }}>
                                    {['view'].map((action) => (
                                      <View key={`reports_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                        <Text style={{ flex: 1, color: colors.text }}>
                                          {t(`common:${action}`, { defaultValue: action })}
                                        </Text>
                                        <Switch
                                          value={formData.customPermissions?.reports?.actions?.includes(action) || false}
                                          onValueChange={(value) => {
                                            const current = formData.customPermissions || {};
                                            const reports = current.reports || { actions: [], fields: [], notifications: [] };
                                            const actions = value
                                              ? [...(reports.actions || []), action]
                                              : (reports.actions || []).filter(a => a !== action);
                                            updateField('customPermissions', {
                                              ...current,
                                              reports: { ...reports, actions },
                                            });
                                          }}
                                          trackColor={{ false: colors.border, true: colors.primary }}
                                          thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>

                            {/* Employees Module */}
                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                              <TouchableOpacity 
                                onPress={() => setExpandedModules({ ...expandedModules, employees: !expandedModules.employees })}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                              >
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                  {t('common:employees', { defaultValue: 'Employees' })}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <TouchableOpacity
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      const current = formData.customPermissions || {};
                                      const employees = current.employees || { actions: [], fields: [], notifications: [] };
                                      const allSelected = ['view', 'create', 'edit', 'delete'].every(action => employees.actions?.includes(action));
                                      const newActions = allSelected ? [] : ['view', 'create', 'edit', 'delete'];
                                      updateField('customPermissions', {
                                        ...current,
                                        employees: { ...employees, actions: newActions },
                                      });
                                    }}
                                    style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                      {['view', 'create', 'edit', 'delete'].every(action => formData.customPermissions?.employees?.actions?.includes(action)) ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                    </Text>
                                  </TouchableOpacity>
                                  <Ionicons 
                                    name={expandedModules.employees ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color={colors.text} 
                                  />
                                </View>
                              </TouchableOpacity>
                              {expandedModules.employees && (
                                <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                  <View style={{ gap: spacing.xs }}>
                                    {['view', 'create', 'edit', 'delete'].map((action) => (
                                      <View key={`employees_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                        <Text style={{ flex: 1, color: colors.text }}>
                                          {t(`common:${action}`, { defaultValue: action })}
                                        </Text>
                                        <Switch
                                          value={formData.customPermissions?.employees?.actions?.includes(action) || false}
                                          onValueChange={(value) => {
                                            const current = formData.customPermissions || {};
                                            const employees = current.employees || { actions: [], fields: [], notifications: [] };
                                            const actions = value
                                              ? [...(employees.actions || []), action]
                                              : (employees.actions || []).filter(a => a !== action);
                                            updateField('customPermissions', {
                                              ...current,
                                              employees: { ...employees, actions },
                                            });
                                          }}
                                          trackColor={{ false: colors.border, true: colors.primary }}
                                          thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>
                          </View>
                        </ScrollView>
                      </Card>
                    ) : null}
                  </>
                )}
              </View>
            </>
          )}
        </View>
        );
      }}
    />
  );
}

