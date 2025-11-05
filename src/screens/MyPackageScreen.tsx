/**
 * My Package Screen
 * Shows current user's package details and summary
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import packages from '../mocks/packages.json';
import users from '../mocks/users.json';
import { useAppStore } from '../store/useAppStore';
import { MODULE_CONFIGS } from '../core/config/moduleConfig';
import { Role } from '../core/config/appConstants';
import Card from '../shared/components/Card';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  maxEmployeeCount?: number;
  maxCustomForms?: number;
  allowedFormModules?: string[];
  allowedPermissions: string[];
}

export default function MyPackageScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['packages', 'common', 'stock', 'customers', 'suppliers', 'sales', 'purchases', 'expenses', 'revenue', 'employees']);
  const { colors } = useTheme();
  const user = useAppStore((s) => s.user);
  const role = useAppStore((s) => s.role);

  // Get current package
  const currentPackage = useMemo(() => {
    let packageId = (user as any)?.package || 'free';
    // For STAFF: Use owner's package
    if (role === Role.STAFF && (user as any)?.ownerId) {
      const owner: any = (users as any).find((u: any) => u.id === (user as any).ownerId);
      packageId = owner?.package || 'free';
    }
    const pkg: any = (packages as any).find((p: any) => p.id === packageId);
    return pkg as Package | undefined;
  }, [user, role]);

  // Get accessible modules
  interface ModuleInfo {
    key: string;
    name: string;
    hasCreate: boolean;
    hasEdit: boolean;
    hasDelete: boolean;
    hasCustomFields: boolean;
    hasCustomForm: boolean;
  }

  const accessibleModules = useMemo(() => {
    if (!currentPackage) return [];
    const modules: ModuleInfo[] = [];
    const permSet = new Set(currentPackage.allowedPermissions);
    
    MODULE_CONFIGS.forEach((moduleConfig) => {
      const moduleKey = moduleConfig.key;
      if (permSet.has(`${moduleKey}:view`)) {
        modules.push({
          key: moduleKey,
          name: t(`${moduleConfig.translationNamespace}:${moduleConfig.translationKey}`, {
            defaultValue: moduleKey
          }),
          hasCreate: permSet.has(`${moduleKey}:create`),
          hasEdit: permSet.has(`${moduleKey}:edit`),
          hasDelete: permSet.has(`${moduleKey}:delete`),
          hasCustomFields: permSet.has(`${moduleKey}:custom_fields`),
          hasCustomForm: permSet.has(`${moduleKey}:custom_form`),
        });
      }
    });
    
    return modules;
  }, [currentPackage, t]);

  // Get feature highlights
  const features = useMemo(() => {
    if (!currentPackage) return [];
    const featureList: string[] = [];
    const permSet = new Set(currentPackage.allowedPermissions);

    // Check for CRUD permissions
    const hasFullCRUD = permSet.has('sales:view') && permSet.has('sales:create') && 
                        permSet.has('sales:edit') && permSet.has('sales:delete');
    if (hasFullCRUD) {
      featureList.push(t('packages:feature_full_crud', { defaultValue: 'Tam CRUD İşlemleri' }));
    }

    // Check for custom forms
    if (currentPackage.maxCustomForms && currentPackage.maxCustomForms > 0) {
      if (currentPackage.allowedFormModules && currentPackage.allowedFormModules.length > 0) {
        featureList.push(
          t('packages:feature_custom_forms_limited', {
            defaultValue: `${currentPackage.maxCustomForms} özel form şablonu (${currentPackage.allowedFormModules.length} modülde)`,
            maxForms: currentPackage.maxCustomForms,
            moduleCount: currentPackage.allowedFormModules.length
          })
        );
      } else {
        featureList.push(
          t('packages:feature_custom_forms', {
            defaultValue: `${currentPackage.maxCustomForms} özel form şablonu`,
            maxForms: currentPackage.maxCustomForms
          })
        );
      }
    }

    // Check for custom fields
    const hasCustomFields = permSet.has('sales:custom_fields') || permSet.has('customers:custom_fields');
    if (hasCustomFields) {
      featureList.push(t('packages:feature_custom_fields', { defaultValue: 'Özel Alan Yönetimi' }));
    }

    // Check for reports
    if (permSet.has('reports:view')) {
      featureList.push(t('packages:feature_reports', { defaultValue: 'Raporlar' }));
    }

    return featureList;
  }, [currentPackage, t]);

  const formatPrice = (price: number, originalPrice?: number) => {
    if (price === 0) {
      return t('packages:free', { defaultValue: 'Ücretsiz' });
    }
    return `₺${price.toLocaleString('tr-TR')}/ay`;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleUpgradePress = () => {
    navigation.navigate('Packages');
  };

  if (!currentPackage) {
    return (
      <ScreenLayout
        title={t('packages:my_package', { defaultValue: 'Paketim' })}
        onBack={handleBackPress}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {t('packages:package_not_found', { defaultValue: 'Paket bulunamadı' })}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const styles = getStyles(colors);

  return (
    <ScreenLayout
      title={t('packages:my_package', { defaultValue: 'Paketim' })}
      onBack={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Package Info Card */}
        <Card style={styles.packageCard}>
          <View style={styles.packageHeader}>
            <View style={styles.packageInfoContainer}>
              <Text style={styles.packageName} numberOfLines={2} ellipsizeMode="tail">
                {currentPackage.name}
              </Text>
              <Text style={styles.packageDescription} numberOfLines={3} ellipsizeMode="tail">
                {currentPackage.description}
              </Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText} numberOfLines={1}>
                {formatPrice(currentPackage.price, currentPackage.originalPrice)}
              </Text>
              {currentPackage.originalPrice && currentPackage.originalPrice > currentPackage.price && (
                <Text style={styles.originalPriceText} numberOfLines={1}>
                  ₺{currentPackage.originalPrice.toLocaleString('tr-TR')}/ay
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Features */}
        {features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('packages:features', { defaultValue: 'Özellikler' })}
            </Text>
            <Card style={styles.featuresCard}>
              {features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Accessible Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('packages:accessible_modules', { defaultValue: 'Erişilebilir Modüller' })}
          </Text>
          <Card style={styles.modulesCard}>
            {accessibleModules.map((module, idx) => (
              <View key={idx} style={styles.moduleItem}>
                <View style={styles.moduleHeader}>
                  <Ionicons name="cube-outline" size={20} color={colors.primary} />
                  <Text style={styles.moduleName}>{module.name}</Text>
                </View>
                <View style={styles.modulePermissions}>
                  {module.hasCreate && (
                    <View style={styles.permissionBadge}>
                      <Ionicons name="add-circle-outline" size={14} color={colors.success} />
                      <Text style={styles.permissionText}>
                        {t('common:create', { defaultValue: 'Oluştur' })}
                      </Text>
                    </View>
                  )}
                  {module.hasEdit && (
                    <View style={styles.permissionBadge}>
                      <Ionicons name="create-outline" size={14} color={colors.primary} />
                      <Text style={styles.permissionText}>
                        {t('common:edit', { defaultValue: 'Düzenle' })}
                      </Text>
                    </View>
                  )}
                  {module.hasDelete && (
                    <View style={styles.permissionBadge}>
                      <Ionicons name="trash-outline" size={14} color={colors.error} />
                      <Text style={styles.permissionText}>
                        {t('common:delete', { defaultValue: 'Sil' })}
                      </Text>
                    </View>
                  )}
                  {module.hasCustomFields && (
                    <View style={styles.permissionBadge}>
                      <Ionicons name="list-outline" size={14} color={colors.primary} />
                      <Text style={styles.permissionText}>
                        {t('packages:custom_fields', { defaultValue: 'Özel Alanlar' })}
                      </Text>
                    </View>
                  )}
                  {module.hasCustomForm && (
                    <View style={styles.permissionBadge}>
                      <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                      <Text style={styles.permissionText}>
                        {t('packages:custom_forms', { defaultValue: 'Özel Formlar' })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Package Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('packages:package_limits', { defaultValue: 'Paket Limitleri' })}
          </Text>
          <Card style={styles.limitsCard}>
            {currentPackage.maxEmployeeCount !== undefined && (
              <View style={styles.limitItem}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <View style={styles.limitInfo}>
                  <Text style={styles.limitLabel}>
                    {t('packages:employee_limit', { defaultValue: 'Personel Limiti' })}
                  </Text>
                  <Text style={styles.limitValue}>
                    {currentPackage.maxEmployeeCount === 999
                      ? t('packages:unlimited_employees', { defaultValue: 'Sınırsız' })
                      : currentPackage.maxEmployeeCount.toString()}
                  </Text>
                </View>
              </View>
            )}
            {currentPackage.maxCustomForms && currentPackage.maxCustomForms > 0 && (
              <View style={styles.limitItem}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                <View style={styles.limitInfo}>
                  <Text style={styles.limitLabel}>
                    {t('packages:custom_forms', { defaultValue: 'Özel Form Şablonları' })}
                  </Text>
                  <Text style={styles.limitValue}>
                    {currentPackage.maxCustomForms.toString()}
                    {currentPackage.allowedFormModules && currentPackage.allowedFormModules.length > 0 && (
                      <Text style={styles.limitSubtext}>
                        {' '}({currentPackage.allowedFormModules.length} {t('packages:modules', { defaultValue: 'modülde' })})
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.limitItem}>
              <Ionicons name="key-outline" size={20} color={colors.primary} />
              <View style={styles.limitInfo}>
                <Text style={styles.limitLabel}>
                  {t('packages:permissions', { defaultValue: 'Toplam Yetki' })}
                </Text>
                <Text style={styles.limitValue}>
                  {currentPackage.allowedPermissions.length.toString()}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Upgrade Button */}
        {currentPackage.id !== 'platinum' && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
          >
            <Ionicons name="arrow-up-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>
              {t('packages:upgrade_package', { defaultValue: 'Paket Yükselt' })}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  packageCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  packageInfoContainer: {
    flex: 1,
    minWidth: 0, // Important for flex items to shrink properly
  },
  packageName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  packageDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  priceBadge: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 90,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  originalPriceText: {
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: 'line-through',
    marginTop: spacing.xs / 2,
  },
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  featuresCard: {
    padding: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  modulesCard: {
    padding: spacing.md,
  },
  moduleItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modulePermissions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginLeft: spacing.xl,
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionText: {
    fontSize: 11,
    color: colors.text,
  },
  limitsCard: {
    padding: spacing.md,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  limitInfo: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.xs / 2,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  limitSubtext: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: 'normal',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

