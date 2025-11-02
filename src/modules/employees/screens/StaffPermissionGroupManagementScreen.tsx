/**
 * Staff Permission Group Management Screen
 * 
 * Allows creating, editing, and deleting staff permission groups
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { useStaffPermissionGroupStore } from '../store/staffPermissionGroupStore';
import { StaffPermissionGroup } from '../../../core/config/staffPermissionGroups';
import { permissionsRegistry } from '../../../core/config/permissions';
import { MODULE_CONFIGS } from '../../../core/config/moduleConfig';
import { getModuleActions } from '../utils/permissionsUtils';
import LoadingState from '../../../shared/components/LoadingState';

export default function StaffPermissionGroupManagementScreen() {
  const { colors, activeTheme } = useTheme();
  const { t } = useTranslation(['employees', 'common']);
  const { groups, isLoading, loadGroups, addGroup, updateGroup, removeGroup } = useStaffPermissionGroupStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StaffPermissionGroup | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadGroups();
  }, []);

  // Get available modules (excluding employees, settings, reports)
  const availableModules = useMemo(() => {
    return MODULE_CONFIGS.filter(module => 
      module.key !== 'employees' && 
      module.key !== 'settings' &&
      module.key !== 'reports'
    );
  }, []);

  const handleCreateNew = () => {
    const newGroup: StaffPermissionGroup = {
      id: `group-${Date.now()}`,
      name: '',
      description: '',
      permissions: {},
    };
    setEditingGroup(newGroup);
    setExpandedModules({});
    setModalVisible(true);
  };

  const handleEdit = (group: StaffPermissionGroup) => {
    setEditingGroup({ ...group });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('common:delete', { defaultValue: 'Sil' }),
      t('employees:delete_group_confirm', { defaultValue: 'Bu yetki grubunu silmek istediğinizden emin misiniz?' }),
      [
        { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
        {
          text: t('common:delete', { defaultValue: 'Sil' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeGroup(id);
            } catch (error: any) {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message);
            }
          },
        },
      ]
    );
  };

  const handleSaveGroup = async () => {
    if (!editingGroup) return;

    if (!editingGroup.name.trim()) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('employees:group_name_required', { defaultValue: 'Grup adı gereklidir' }));
      return;
    }

    try {
      // Check if this is a new group (check if ID exists in current groups)
      const existing = groups.find(g => g.id === editingGroup.id);
      if (existing) {
        // Update existing group
        await updateGroup(editingGroup.id, editingGroup);
      } else {
        // Create new group - generate new ID if needed
        const newId = editingGroup.id || `group-${Date.now()}`;
        await addGroup({ ...editingGroup, id: newId });
      }
      setModalVisible(false);
      setEditingGroup(null);
      setExpandedModules({});
    } catch (error: any) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingGroup(null);
    setExpandedModules({});
  };

  const togglePermission = (moduleKey: string, action: string) => {
    if (!editingGroup) return;

    const modulePerms = editingGroup.permissions[moduleKey] || { actions: [] };
    const hasAction = modulePerms.actions.includes(action);
    const newActions = hasAction
      ? modulePerms.actions.filter(a => a !== action)
      : [...modulePerms.actions, action];

    setEditingGroup({
      ...editingGroup,
      permissions: {
        ...editingGroup.permissions,
        [moduleKey]: { actions: newActions },
      },
    });
  };

  const renderGroupCard = (group: StaffPermissionGroup) => {
    const moduleCount = Object.keys(group.permissions).length;
    const totalPermissions = Object.values(group.permissions).reduce((sum, perm) => sum + perm.actions.length, 0);

    return (
      <Card key={group.id} style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs }}>
              {group.name}
            </Text>
            {group.description && (
              <Text style={{ fontSize: 14, color: colors.muted, marginBottom: spacing.sm }}>
                {group.description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {moduleCount} {t('employees:modules', { defaultValue: 'Modül' })}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {totalPermissions} {t('employees:permissions', { defaultValue: 'Yetki' })}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={() => handleEdit(group)}
              style={{ padding: spacing.sm }}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(group.id)}
              style={{ padding: spacing.sm }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const renderEditModal = () => {
    if (!editingGroup) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
      >
        <ScreenLayout
          title={groups.find(g => g.id === editingGroup.id)
            ? t('employees:edit_permission_group', { defaultValue: 'Yetki Grubunu Düzenle' })
            : t('employees:new_permission_group', { defaultValue: 'Yeni Yetki Grubu' })}
          showBackButton
          onBackPress={handleCloseModal}
          footer={
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: activeTheme === 'dark' ? colors.surface : colors.background }]}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={[styles.footerButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, flex: 1, marginRight: spacing.sm }]}
              >
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                  {t('common:cancel', { defaultValue: 'İptal' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveGroup}
                style={[styles.footerButton, { backgroundColor: colors.primary, flex: 1 }]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', textAlign: 'center' }}>
                  {t('common:save', { defaultValue: 'Kaydet' })}
                </Text>
              </TouchableOpacity>
            </View>
          }
        >
          <ScrollView style={{ padding: spacing.lg }}>
            <View style={{ gap: spacing.lg }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.text }}>
                  {t('employees:group_name', { defaultValue: 'Grup Adı' })}
                  <Text style={{ color: colors.error }}> *</Text>
                </Text>
                <Input
                  value={editingGroup.name}
                  onChangeText={(text) => setEditingGroup({ ...editingGroup, name: text })}
                  placeholder={t('employees:group_name_placeholder', { defaultValue: 'Örn: Arabalı Satıcı' })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.text }}>
                  {t('employees:description', { defaultValue: 'Açıklama' })}
                </Text>
                <Input
                  value={editingGroup.description || ''}
                  onChangeText={(text) => setEditingGroup({ ...editingGroup, description: text })}
                  placeholder={t('employees:description_placeholder', { defaultValue: 'Grup açıklaması' })}
                  multiline
                />
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
                  {t('employees:permissions', { defaultValue: 'Yetkiler' })}
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: spacing.md }}>
                  {t('employees:select_permissions_for_group', { defaultValue: 'Bu grup için yetkileri seçin' })}
                </Text>

                <View style={{ gap: spacing.md }}>
                  {availableModules.map((module) => {
                    const moduleKey = module.key;
                    const moduleActions = getModuleActions(moduleKey);
                    const isExpanded = expandedModules[moduleKey] || false;
                    const modulePerms = editingGroup.permissions[moduleKey] || { actions: [] };
                    const allSelected = moduleActions.every(action => modulePerms.actions.includes(action));

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
                                const newActions = allSelected ? [] : moduleActions;
                                setEditingGroup({
                                  ...editingGroup,
                                  permissions: {
                                    ...editingGroup.permissions,
                                    [moduleKey]: { actions: newActions },
                                  },
                                });
                              }}
                              style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 4, backgroundColor: colors.primary }}
                            >
                              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                                {allSelected ? t('common:deselect_all', { defaultValue: 'Tümünü Kaldır' }) : t('common:select_all', { defaultValue: 'Tümünü Seç' })}
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
                                    value={modulePerms.actions.includes(action)}
                                    onValueChange={() => togglePermission(moduleKey, action)}
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

                  {/* Reports Module */}
                  {(() => {
                    const reportsModule = MODULE_CONFIGS.find(m => m.key === 'reports');
                    if (!reportsModule) return null;

                    const moduleKey = 'reports';
                    const moduleActions = ['view'];
                    const isExpanded = expandedModules[moduleKey] || false;
                    const modulePerms = editingGroup.permissions[moduleKey] || { actions: [] };

                    return (
                      <View key={moduleKey} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>
                        <TouchableOpacity
                          onPress={() => setExpandedModules({ ...expandedModules, [moduleKey]: !isExpanded })}
                          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                            {t(`${reportsModule.translationNamespace}:${reportsModule.translationKey}`, { defaultValue: 'Reports' })}
                          </Text>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.text}
                          />
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
                                    value={modulePerms.actions.includes(action)}
                                    onValueChange={() => togglePermission(moduleKey, action)}
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
              </View>
            </View>
          </ScrollView>
        </ScreenLayout>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('employees:permission_groups', { defaultValue: 'Yetki Grupları' })} showBackButton>
        <LoadingState />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('employees:permission_groups', { defaultValue: 'Yetki Grupları' })} showBackButton>
      <ScrollView style={{ padding: spacing.lg }}>
        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.primary + '10', borderWidth: 1, borderColor: colors.primary + '30' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={{ flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 }}>
              {t('employees:permission_groups_info', {
                defaultValue: 'Yetki grupları, staff kullanıcılarına hızlıca yetki vermek için kullanılır. Bir grup seçildiğinde, o grubun içindeki tüm yetkiler otomatik olarak verilir.'
              })}
            </Text>
          </View>
        </Card>

        <TouchableOpacity
          onPress={handleCreateNew}
          style={[styles.createButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: spacing.sm }}>
            {t('employees:create_new_group', { defaultValue: 'Yeni Grup Oluştur' })}
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.lg }}>
          {groups.length === 0 ? (
            <Card style={{ padding: spacing.xl }}>
              <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 14 }}>
                {t('employees:no_groups_found', { defaultValue: 'Henüz yetki grubu yok' })}
              </Text>
            </Card>
          ) : (
            groups.map(renderGroupCard)
          )}
        </View>
      </ScrollView>

      {renderEditModal()}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.md,
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

