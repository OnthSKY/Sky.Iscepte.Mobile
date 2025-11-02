/**
 * EmployeePermissionsScreen - Permissions Management Screen
 * 
 * Shows list of employees (excluding current user) with permission edit buttons
 * Clicking edit opens a modal to edit that employee's permissions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Modal, FlatList, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import LoadingState from '../../../shared/components/LoadingState';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Employee } from '../store/employeeStore';
import { employeeService } from '../services/employeeService';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import { useAppStore } from '../../../store/useAppStore';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { useListScreen } from '../../../core/hooks/useListScreen';
import { permissionsRegistry } from '../../../core/config/permissions';
import { MODULE_CONFIGS, getModuleConfig } from '../../../core/config/moduleConfig';
import { getModuleActions } from '../utils/permissionsUtils';
import { ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import { StatCard } from '../../../shared/components/dashboard/StatCard';
import { useEmployeeStatsQuery } from '../hooks/useEmployeesQuery';
import { useWindowDimensions } from 'react-native';
import { useStaffPermissionGroupStore } from '../store/staffPermissionGroupStore';
import Select from '../../../shared/components/Select';
import { Role } from '../../../core/config/appConstants';

interface PermissionDetail {
  actions: string[];
}


export default function EmployeePermissionsScreen() {
  const route = useRoute<any>();
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();
  
  // Get available modules from MODULE_CONFIGS that also exist in permissionsRegistry
  // Exclude employees and settings
  // Reports is handled separately as it only has view permission
  const availableModules = useMemo(() => {
    const registryModules = new Set(permissionsRegistry.map(m => m.module));
    return MODULE_CONFIGS.filter(module => 
      module.key !== 'employees' && 
      module.key !== 'settings' &&
      module.key !== 'reports' && // Reports handled separately
      registryModules.has(module.key) // Only include modules that exist in permissionsRegistry
    );
  }, []);

  // Dynamically get modules from permissions registry (excluding settings)
  const ALL_MODULES = useMemo(() => {
    return permissionsRegistry
      .filter(m => m.module !== 'settings') // Exclude settings module
      .map(m => m.module);
  }, []);
  
  // Dynamically get required translation namespaces
  const translationNamespaces = useMemo(() => {
    const namespaces = new Set<string>(['employees', 'common']);
    availableModules.forEach(module => {
      namespaces.add(module.translationNamespace);
    });
    return Array.from(namespaces);
  }, [availableModules]);
  
  const { t } = useTranslation(translationNamespaces);
  const currentUser = useAppStore((s) => s.user);
  const currentUserId = currentUser?.id;
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modifiedPermissions, setModifiedPermissions] = useState<Record<string, PermissionDetail>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string>('');
  const { groups, loadGroups } = useStaffPermissionGroupStore();

  // Load permission groups on mount
  useEffect(() => {
    loadGroups();
  }, []);
  
  // Fetch employee stats
  const { data: stats, isLoading: statsLoading } = useEmployeeStatsQuery();

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeePermissions();
    }
  }, [selectedEmployee]);

  // Calculate total users and users with accounts count - fetch from list
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [usersWithAccountsCount, setUsersWithAccountsCount] = useState<number>(0);
  const [countsLoading, setCountsLoading] = useState(false);
  
  // Fetch employees count function - runs when currentUserId is available
  useEffect(() => {
    let isMounted = true;
    
    const fetchEmployeesCount = async () => {
      setCountsLoading(true);
      try {
        const response = await employeeEntityService.list({ page: 1, pageSize: 1000 });
        
        if (!isMounted) return;
        
        // Filter to exclude current user
        const allEmployees = (response.items || []).filter((emp: Employee) => {
          // Exclude current user
          if (currentUserId && emp.id && String(emp.id) === String(currentUserId)) {
            return false;
          }
          return true;
        });
        
        // Total users count (all employees excluding current user)
        setTotalUsersCount(allEmployees.length);
        
        // Users with accounts count (only those with username)
        const employeesWithAccounts = allEmployees.filter((emp: Employee) => {
          return !!emp.username;
        });
        
        setUsersWithAccountsCount(employeesWithAccounts.length);
      } catch (error) {
        if (!isMounted) return;
        // Set default values on error
        setTotalUsersCount(0);
        setUsersWithAccountsCount(0);
      } finally {
        if (isMounted) {
          setCountsLoading(false);
        }
      }
    };
    
    // Only fetch if component is mounted
    fetchEmployeesCount();
    
    return () => {
      isMounted = false;
    };
  }, [currentUserId]); // Re-fetch when currentUserId changes
  
  // Layout config for side by side cards
  const layoutConfig = useMemo(() => {
    const numColumns = 2; // Always 2 columns for side by side
    const containerPadding = spacing.lg;
    const availableWidth = width - containerPadding * 2;
    const gap = spacing.md;
    const totalGaps = gap * (numColumns - 1);
    const cardWidth = (availableWidth - totalGaps) / numColumns;
    return { cardWidth, gap };
  }, [width]);
  
  // Stats for header cards - both cards side by side (no main stat)
  const moduleStats: ModuleStat[] = useMemo(() => {
    return [
      {
        key: 'total-users',
        label: t('employees:total_users', { defaultValue: 'Kullanıcılar' }),
        value: totalUsersCount,
        icon: 'people-outline',
        color: colors.primary || '#1D4ED8',
      },
      {
        key: 'users-with-accounts',
        label: t('employees:users_with_accounts', { defaultValue: 'Hesabı Olanlar' }),
        value: usersWithAccountsCount,
        icon: 'person-circle-outline',
        color: colors.success || '#059669',
      },
    ];
  }, [totalUsersCount, usersWithAccountsCount, t, colors]);

  const loadEmployeePermissions = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const data = await employeeService.get(String(selectedEmployee.id));
      // Only keep actions, remove fields and notifications
      const cleanedPermissions: Record<string, PermissionDetail> = {};
      if (data.customPermissions) {
        Object.keys(data.customPermissions).forEach(moduleKey => {
          const modulePerms = data.customPermissions[moduleKey];
          cleanedPermissions[moduleKey] = {
            actions: modulePerms.actions || [],
          };
        });
      }
      setModifiedPermissions(cleanedPermissions);
      // Reset selected group when loading employee
      setSelectedPermissionGroup('');
    } catch (error) {
      console.error('Failed to load employee permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalVisible(true);
  };


  const handleSave = async () => {
    if (!selectedEmployee) return;
    
    try {
      setSaving(true);
      // Only save actions, ensure no fields or notifications are sent
      const cleanedPermissions: Record<string, { actions: string[] }> = {};
      Object.keys(modifiedPermissions).forEach(moduleKey => {
        const modulePerms = modifiedPermissions[moduleKey];
        cleanedPermissions[moduleKey] = {
          actions: modulePerms.actions || [],
        };
      });
      
      await employeeService.update(String(selectedEmployee.id), {
        customPermissions: cleanedPermissions,
      });
      
      alert(t('permissions_saved', { defaultValue: 'Yetkiler başarıyla kaydedildi' }));
      setModalVisible(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert(t('permissions_save_error', { defaultValue: 'Yetkiler kaydedilemedi' }));
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEmployee(null);
    setModifiedPermissions({});
  };


  const renderModuleSection = (module: any) => {
    const moduleKey = module.key;
    const modulePerms = modifiedPermissions[moduleKey] || {
      actions: [],
    };

    const moduleActions = getModuleActions(moduleKey);
    const isExpanded = expandedModules[moduleKey] || false;
    const allActionsSelected = moduleActions.every(action => modulePerms.actions?.includes(action));
    const isStockModule = moduleKey === 'stock';

    return (
      <View key={moduleKey} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', marginBottom: spacing.md }}>
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
                const current = modifiedPermissions || {};
                const currentModulePerms = current[moduleKey] || { actions: [] };
                const newActions = allActionsSelected ? [] : moduleActions;
                setModifiedPermissions({
                  ...current,
                  [moduleKey]: { actions: newActions },
                });
              }}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                }
              ]}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                {allActionsSelected ? t('employees:deselect_all', { defaultValue: 'Tümünü Kaldır' }) : t('employees:select_all', { defaultValue: 'Tümünü Ver' })}
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
            {/* Actions */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.muted }}>
                {t('employees:actions', { defaultValue: 'İşlemler' })}
              </Text>
              <View style={{ gap: spacing.xs }}>
                {moduleActions.map((action) => {
                  // Special handling for stock module special permissions
                  const isStockSpecialPermission = isStockModule && (action === 'manage_global_fields' || action === 'add_product_custom_fields');
                  const translationKey = isStockSpecialPermission 
                    ? `${module.translationNamespace}:${action}` 
                    : `common:permission_${action}`;
                  
                  return (
                    <View key={action} style={styles.permissionRow}>
                      <Text style={{ flex: 1, color: colors.text }}>
                        {t(translationKey, { 
                          defaultValue: isStockSpecialPermission 
                            ? action
                            : t(`common:${action}`, { defaultValue: action })
                        })}
                      </Text>
                      <Switch
                        value={modulePerms.actions?.includes(action) || false}
                      onValueChange={(value) => {
                        const current = modifiedPermissions || {};
                        const currentModulePerms = current[moduleKey] || { actions: [] };
                        const actions = value
                          ? [...(currentModulePerms.actions || []), action]
                          : (currentModulePerms.actions || []).filter(a => a !== action);
                        setModifiedPermissions({
                          ...current,
                          [moduleKey]: { actions },
                        });
                      }}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.surface}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

          </View>
        )}
      </View>
    );
  };

  const renderPermissionsModal = () => {
    if (!selectedEmployee) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
      >
        <ScreenLayout 
          title={t('manage_permissions', { defaultValue: 'Personel Yetkilerini Yönet' })}
          showBackButton
          onBackPress={handleCloseModal}
          footer={
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: activeTheme === 'dark' ? colors.surface : colors.background }]}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
                    flex: 1,
                    marginRight: spacing.sm,
                  }
                ]}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                  {t('common:cancel', { defaultValue: 'İptal' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: saving ? colors.muted : colors.primary,
                    flex: 1,
                    shadowColor: saving ? 'transparent' : colors.primary,
                  },
                  !saving && styles.actionButton
                ]}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                  {t('common:save', { defaultValue: 'Kaydet' })}
                </Text>
              </TouchableOpacity>
            </View>
          }
        >
          <ScrollView>
            <View style={styles.content}>
              <Card style={{ marginBottom: spacing.md }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  {t('employee_name', { defaultValue: 'Çalışan' })}: {selectedEmployee.name || `${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim()}
                </Text>
                {selectedEmployee.role && (
                  <Text style={{ fontSize: 14, color: colors.muted, marginTop: spacing.xs }}>
                    {t('employees:user_role', { defaultValue: 'Kullanıcı Rolü' })}: {t(`common:${selectedEmployee.role}`, { defaultValue: selectedEmployee.role })}
                  </Text>
                )}
                {selectedEmployee.position && (
                  <Text style={{ fontSize: 14, color: colors.muted, marginTop: spacing.xs }}>
                    {t('employees:position', { defaultValue: 'Pozisyon' })}: {selectedEmployee.position}
                  </Text>
                )}
              </Card>

              {loading ? (
                <LoadingState />
              ) : (
                <View style={{ gap: spacing.md }}>
                  {/* Permission Group Selection - Only for STAFF role */}
                  {selectedEmployee?.role === Role.STAFF && (
                    <Card style={{ marginBottom: spacing.md }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.sm, color: colors.text }}>
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
                              const groupPermissions: Record<string, PermissionDetail> = {};
                              Object.keys(group.permissions).forEach(moduleKey => {
                                groupPermissions[moduleKey] = {
                                  actions: group.permissions[moduleKey].actions || [],
                                };
                              });
                              setModifiedPermissions(groupPermissions);
                            }
                          } else {
                            // Clear permissions if no group selected
                            setModifiedPermissions({});
                          }
                        }}
                      />
                    </Card>
                  )}

                  <View style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.primary + '10', borderRadius: 8, borderWidth: 1, borderColor: colors.primary + '30' }}>
                    <Text style={{ fontSize: 13, color: colors.text }}>
                      {t('employees:view_all_data_note', { defaultValue: 'Not: Görüntüle izni ile bu kullanıcı, başkaları tarafından girilen verileri de görüntüleyebilir.' })}
                    </Text>
                  </View>
                  {availableModules.map(renderModuleSection)}
                  
                  {/* Reports Module - Special case with only view permission */}
                  {(() => {
                    const reportsModule = MODULE_CONFIGS.find(m => m.key === 'reports');
                    if (!reportsModule) return null;
                    // Check if reports exists in permissionsRegistry
                    const hasReportsInRegistry = permissionsRegistry.some(m => m.module === 'reports');
                    if (!hasReportsInRegistry) return null;
                    
                    return renderModuleSection(reportsModule);
                  })()}
                </View>
              )}
            </View>
          </ScrollView>
        </ScreenLayout>
      </Modal>
    );
  };

  return (
    <ScreenLayout 
      title={t('manage_permissions', { defaultValue: 'Personel Yetkilerini Yönet' })} 
      showBackButton
      noPadding
    >
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        {/* Stats Header - Side by side cards */}
        {countsLoading ? (
          <View style={{ padding: spacing.lg }}>
            <LoadingState />
          </View>
        ) : (
          <View style={[styles.statsContainer, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
            <View style={styles.statsRow}>
              {moduleStats && moduleStats.length > 0 ? moduleStats.map((stat, index) => {
                const valueStr = typeof stat.value === 'number' 
                  ? stat.value.toLocaleString() 
                  : String(stat.value ?? '—');
                const marginRight = index === 0 ? layoutConfig.gap : 0;
                
                return (
                  <StatCard
                    key={stat.key}
                    stat={{
                      key: stat.key,
                      label: stat.label,
                      value: valueStr,
                      icon: stat.icon,
                      color: stat.color,
                      route: stat.route || '',
                    }}
                    onPress={() => {}}
                    width={layoutConfig.cardWidth}
                    marginRight={marginRight}
                  />
                );
              }) : (
                <View style={{ padding: spacing.md }}>
                  <Text style={{ color: colors.text }}>
                    {t('employees:no_data', { defaultValue: 'Veri yükleniyor...' })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Info Description */}
        <View style={styles.infoContainer}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {t('employees:permissions_management_info', { 
                defaultValue: 'Bu ekrandan personellerin yetkilerini yönetebilirsiniz. Kullanıcı hesabı olan personellerin yetkilerini düzenleyebilirsiniz.' 
              })}
            </Text>
          </View>
        </View>

        {/* List Section */}
        <View style={styles.listContainer}>
          <ListScreenContainer
            service={employeeEntityService}
            config={{
              entityName: 'employee',
              translationNamespace: 'employees',
              defaultPageSize: 20,
            }}
            hideSearch={true}
            hideCreate={true}
            showFilters={false}
            emptyStateTitle={t('employees:no_employees_found', { defaultValue: 'Henüz çalışan yok' })}
            emptyStateSubtitle={t('employees:no_employees_found_subtitle', { defaultValue: 'Yeni çalışan eklemek için menüden ilgili seçeneği kullanabilirsiniz.' })}
            filterItems={React.useCallback((items: Employee[]) => {
              // Filter out current user from the list
              return items.filter((item: Employee) => {
                if (currentUserId && item.id) {
                  const itemIdStr = String(item.id);
                  const currentUserIdStr = String(currentUserId);
                  if (itemIdStr === currentUserIdStr) {
                    return false; // Exclude current user
                  }
                }
                return true;
              });
            }, [currentUserId])}
            renderItem={(item: Employee) => {
              // Show all employees, but only allow editing permissions for those with user accounts
              const hasUserAccount = !!item.username;
              
              return (
              <Card style={{ marginBottom: 12 }}>
                <View style={styles.employeeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.employeeName, { color: colors.text }]}>
                      {item.firstName || item.name} {item.lastName}
                    </Text>
                    {item.role && (
                      <Text style={[styles.employeeRole, { color: colors.muted }]}>
                        {t(`common:${item.role}`, { defaultValue: item.role })}
                      </Text>
                    )}
                    {item.position && (
                      <Text style={[styles.employeeUsername, { color: colors.muted, fontSize: 12 }]}>
                        {item.position}
                      </Text>
                    )}
                    {item.username && (
                      <Text style={[styles.employeeUsername, { color: colors.muted }]}>
                        @{item.username}
                      </Text>
                    )}
                    {!hasUserAccount && (
                      <Text style={[styles.employeeUsername, { color: colors.muted, fontStyle: 'italic' }]}>
                        {t('employees:no_user_account', { defaultValue: 'Kullanıcı hesabı yok' })}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => hasUserAccount ? handleEditPermissions(item) : undefined}
                    disabled={!hasUserAccount}
                    style={[
                      styles.editButton, 
                      {
                        backgroundColor: hasUserAccount ? (activeTheme === 'dark' ? colors.surface : colors.card) : `${colors.border}15`,
                        borderColor: hasUserAccount ? colors.border : colors.border,
                        opacity: hasUserAccount ? 1 : 0.5,
                        shadowColor: hasUserAccount ? '#000' : 'transparent',
                      },
                      hasUserAccount && activeTheme === 'dark' ? styles.cardDarkShadow : hasUserAccount ? styles.cardLightShadow : {}
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.editButtonIconWrap,
                      { backgroundColor: hasUserAccount ? `${colors.primary}20` : `${colors.muted}20` }
                    ]}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={18} 
                        color={hasUserAccount ? colors.primary : colors.muted} 
                      />
                    </View>
                    <Text style={[
                      styles.editButtonText, 
                      { color: hasUserAccount ? colors.text : colors.muted }
                    ]}>
                      {t('employees:edit_permissions', { defaultValue: 'Yetkileri Düzenle' })}
                    </Text>
                    {hasUserAccount && (
                      <Ionicons 
                        name="chevron-forward-outline" 
                        size={18} 
                        color={colors.muted} 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
              );
            }}
            keyExtractor={(item: Employee) => String(item.id)}
          />
        </View>
      </View>
      
      {renderPermissionsModal()}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    paddingBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  employeeRole: {
    fontSize: 14,
    marginBottom: spacing.xs / 2,
  },
  employeeUsername: {
    fontSize: 12,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      },
    }),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
  },
  editButtonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  cardLightShadow: Platform.select({
    web: {
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.05)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 15,
      elevation: 2,
    },
  }),
  cardDarkShadow: Platform.select({
    web: {
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
  }),
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
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  footerButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});