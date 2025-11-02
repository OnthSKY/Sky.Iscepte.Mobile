/**
 * EmployeeFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Employee, EmployeeCustomField } from '../store/employeeStore';
import { employeeFormFields, employeeUserAccountFields, employeeValidator } from '../config/employeeFormConfig';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import spacing from '../../../core/constants/spacing';
import Card from '../../../shared/components/Card';
import Select from '../../../shared/components/Select';
import Input from '../../../shared/components/Input';
import { Role } from '../../../core/config/appConstants';
import { MODULE_CONFIGS } from '../../../core/config/moduleConfig';
import { permissionsRegistry } from '../../../core/config/permissions';
import { useAppStore } from '../../../store/useAppStore';
import { getModuleActions, ALL_FIELDS, ALL_NOTIFICATIONS } from '../utils/permissionsUtils';
import { useStaffPermissionGroupStore } from '../store/staffPermissionGroupStore';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import globalFieldsService from '../services/globalFieldsService';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';

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
  const currentUserRole = useAppStore((state) => state.role);
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string>('');
  const { groups, loadGroups } = useStaffPermissionGroupStore();
  const [globalFields, setGlobalFields] = useState<EmployeeCustomField[]>([]);

  // Load permission groups on mount
  useEffect(() => {
    loadGroups();
    loadGlobalFields();
  }, []);

  const loadGlobalFields = async () => {
    try {
      const fields = await globalFieldsService.getAll();
      setGlobalFields(fields);
    } catch (error) {
      console.error('Failed to load global fields:', error);
    }
  };
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');
  const isCreateMode = formMode === 'create';
  
  // Get modules from MODULE_CONFIGS (exclude employees, settings, and reports modules)
  // Reports is handled separately as it only has view permission
  const availableModules = useMemo(() => {
    return MODULE_CONFIGS.filter(module => 
      module.key !== 'employees' && 
      module.key !== 'settings' &&
      module.key !== 'reports'
    );
  }, []);

  const handleGlobalFieldsChange = async (fields: EmployeeCustomField[]) => {
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
    } catch (error) {
      console.error('Failed to save global fields:', error);
    }
  };

  const getInitialData = (): Partial<Employee> => {
    return getInitialDataWithCustomFields<Employee>(formMode, {});
  };

  const enhancedValidator = createEnhancedValidator<Employee>(
    employeeValidator,
    globalFields,
    'employees'
  );

  // Get all possible actions from permissions registry
  const ALL_ACTIONS = useMemo(() => {
    const actions = new Set<string>();
    permissionsRegistry.forEach(module => {
      module.permissions.forEach(permission => {
        const action = permission.split(':')[1];
        if (action) actions.add(action);
      });
    });
    return Array.from(actions);
  }, []);

  // Role hierarchy: ADMIN > OWNER > STAFF > GUEST
  // Users can only assign roles equal to or below their own role
  const roleOptions = useMemo(() => {
    const allRoles = [
      { label: t('common:admin', { defaultValue: 'Admin' }), value: Role.ADMIN },
      { label: t('common:owner', { defaultValue: 'Owner' }), value: Role.OWNER },
      { label: t('common:staff', { defaultValue: 'Staff' }), value: Role.STAFF },
    ];
    
    // Filter roles based on current user's role
    // ADMIN can assign all roles, OWNER can assign OWNER and STAFF, STAFF can only assign STAFF
    const roleHierarchy: Record<Role, Role[]> = {
      [Role.ADMIN]: [Role.ADMIN, Role.OWNER, Role.STAFF],
      [Role.OWNER]: [Role.OWNER, Role.STAFF],
      [Role.STAFF]: [Role.STAFF],
      [Role.GUEST]: [], // GUEST cannot assign any roles
    };
    
    const allowedRoles = roleHierarchy[currentUserRole] || [];
    return allRoles.filter(role => allowedRoles.includes(role.value));
  }, [currentUserRole, t]);

  return (
    <FormScreenContainer
      service={employeeEntityService}
      config={{
        entityName: 'employee',
        translationNamespace: 'employees',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={enhancedValidator}
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

        const customFields = (formData.customFields as EmployeeCustomField[]) || [];

        const handleCustomFieldsChange = (fields: EmployeeCustomField[]) => {
          updateField('customFields' as keyof Employee, fields);
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

            {/* Custom Fields */}
            <Card>
              <CustomFieldsManager<EmployeeCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                availableGlobalFields={globalFields}
                onGlobalFieldsChange={handleGlobalFieldsChange}
                module="employees"
              />
            </Card>

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
                        
                        {/* Permission Group Selection */}
                        <View style={{ marginBottom: spacing.md }}>
                          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.text }}>
                            {t('employees:permission_group', { defaultValue: 'Yetki Grubu' })}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.sm }}>
                            {t('employees:permission_group_desc', { defaultValue: 'Hızlıca yetki vermek için bir grup seçin (isteğe bağlı)' })}
                          </Text>
                          <Select
                            value={selectedPermissionGroup}
                            options={[
                              { label: t('employees:none', { defaultValue: 'Grup Seçme' }), value: '' },
                              ...groups.map(g => ({ label: g.name, value: g.id })),
                            ]}
                            placeholder={t('employees:select_permission_group', { defaultValue: 'Yetki Grubu Seç' })}
                            onChange={(value) => {
                              setSelectedPermissionGroup(value);
                              if (value) {
                                // Load group permissions
                                const group = groups.find(g => g.id === value);
                                if (group) {
                                  updateField('customPermissions', group.permissions);
                                }
                              } else {
                                // Clear permissions if no group selected
                                updateField('customPermissions', {});
                              }
                            }}
                          />
                        </View>

                        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: spacing.md }}>
                          {t('select_permissions_desc', { defaultValue: 'Veya manuel olarak yetkileri seçin:' })}
                        </Text>
                        <View style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.primary + '10', borderRadius: 8, borderWidth: 1, borderColor: colors.primary + '30' }}>
                          <Text style={{ fontSize: 13, color: colors.text }}>
                            {t('view_all_data_note', { defaultValue: 'Not: Görüntüle izni ile bu kullanıcı, başkaları tarafından girilen verileri de görüntüleyebilir.' })}
                          </Text>
                        </View>
                        <View style={{ gap: spacing.md }}>
                          {availableModules.map((module) => {
                            const moduleKey = module.key;
                            const moduleActions = getModuleActions(moduleKey);
                            const isExpanded = expandedModules[moduleKey] || false;
                            const currentPerms = formData.customPermissions?.[moduleKey] || { actions: [], fields: [], notifications: [] };
                            const allSelected = moduleActions.every(action => currentPerms.actions?.includes(action));
                            
                            return (
                              <View key={moduleKey} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                                <TouchableOpacity 
                                  onPress={() => setExpandedModules({ ...expandedModules, [moduleKey]: !isExpanded })}
                                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                                >
                                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                    {t(`${module.translationNamespace}:${module.translationKey}`, { defaultValue: module.key })}
                                  </Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                    <TouchableOpacity
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        const current = formData.customPermissions || {};
                                        const modulePerms = current[moduleKey] || { actions: [], fields: [], notifications: [] };
                                        const newActions = allSelected ? [] : moduleActions;
                                        updateField('customPermissions', {
                                          ...current,
                                          [moduleKey]: { ...modulePerms, actions: newActions },
                                        });
                                      }}
                                      style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                    >
                                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                        {allSelected ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                      </Text>
                                    </TouchableOpacity>
                                    <Ionicons 
                                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                                      size={20} 
                                      color={colors.text} 
                                    />
                                  </View>
                                </TouchableOpacity>
                                {isExpanded && (
                                  <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                    <View style={{ gap: spacing.xs }}>
                                      {moduleActions.map((action) => (
                                        <View key={`${moduleKey}_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                          <Text style={{ flex: 1, color: colors.text }}>
                                            {t(`common:permission_${action}`, { defaultValue: t(`common:${action}`, { defaultValue: action }) })}
                                          </Text>
                                          <Switch
                                            value={currentPerms.actions?.includes(action) || false}
                                            onValueChange={(value) => {
                                              const current = formData.customPermissions || {};
                                              const modulePerms = current[moduleKey] || { actions: [], fields: [], notifications: [] };
                                              const actions = value
                                                ? [...(modulePerms.actions || []), action]
                                                : (modulePerms.actions || []).filter(a => a !== action);
                                              updateField('customPermissions', {
                                                ...current,
                                                [moduleKey]: { ...modulePerms, actions },
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
                            );
                          })}
                          
                          {/* Reports Module - Special case with only view permission */}
                          {(() => {
                            const reportsModule = MODULE_CONFIGS.find(m => m.key === 'reports');
                            if (!reportsModule) return null;
                            
                            const moduleKey = 'reports';
                            const moduleActions = ['view'];
                            const isExpanded = expandedModules[moduleKey] || false;
                            const currentPerms = formData.customPermissions?.[moduleKey] || { actions: [], fields: [], notifications: [] };
                            const allSelected = moduleActions.every(action => currentPerms.actions?.includes(action));
                            
                            return (
                              <View key={moduleKey} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                                <TouchableOpacity 
                                  onPress={() => setExpandedModules({ ...expandedModules, [moduleKey]: !isExpanded })}
                                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                                >
                                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                    {t(`${reportsModule.translationNamespace}:${reportsModule.translationKey}`, { defaultValue: 'Reports' })}
                                  </Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                    <TouchableOpacity
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        const current = formData.customPermissions || {};
                                        const modulePerms = current[moduleKey] || { actions: [], fields: [], notifications: [] };
                                        const newActions = allSelected ? [] : moduleActions;
                                        updateField('customPermissions', {
                                          ...current,
                                          [moduleKey]: { ...modulePerms, actions: newActions },
                                        });
                                      }}
                                      style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                                    >
                                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                        {allSelected ? t('deselect_all', { defaultValue: 'Deselect All' }) : t('select_all', { defaultValue: 'Select All' })}
                                      </Text>
                                    </TouchableOpacity>
                                    <Ionicons 
                                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                                      size={20} 
                                      color={colors.text} 
                                    />
                                  </View>
                                </TouchableOpacity>
                                {isExpanded && (
                                  <View style={{ padding: spacing.md, backgroundColor: colors.background }}>
                                    <View style={{ gap: spacing.xs }}>
                                      {moduleActions.map((action) => (
                                        <View key={`${moduleKey}_${action}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                                          <Text style={{ flex: 1, color: colors.text }}>
                                            {t(`common:permission_${action}`, { defaultValue: t(`common:${action}`, { defaultValue: action }) })}
                                          </Text>
                                          <Switch
                                            value={currentPerms.actions?.includes(action) || false}
                                            onValueChange={(value) => {
                                              const current = formData.customPermissions || {};
                                              const modulePerms = current[moduleKey] || { actions: [], fields: [], notifications: [] };
                                              const actions = value
                                                ? [...(modulePerms.actions || []), action]
                                                : (modulePerms.actions || []).filter(a => a !== action);
                                              updateField('customPermissions', {
                                                ...current,
                                                [moduleKey]: { ...modulePerms, actions },
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
                            );
                          })()}
                          </View>
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

