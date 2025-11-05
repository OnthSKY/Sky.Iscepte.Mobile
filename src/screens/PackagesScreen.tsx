import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import packages from '../mocks/packages.json';
import { useAppStore } from '../store/useAppStore';
import { MODULE_CONFIGS } from '../core/config/moduleConfig';
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

export default function PackagesScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['packages', 'common', 'stock', 'customers', 'suppliers', 'sales', 'purchases', 'expenses', 'revenue', 'employees']);
  const { colors } = useTheme();
  const user = useAppStore((s) => s.user);
  const currentPackageId = (user as any)?.package || 'free';
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<Package | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const allPackages = packages as Package[];

  // Helper function to get accessible modules from package
  const getAccessibleModules = (pkg: Package): string[] => {
    const modules: string[] = [];
    const permSet = new Set(pkg.allowedPermissions);
    
    MODULE_CONFIGS.forEach((moduleConfig) => {
      const moduleKey = moduleConfig.key;
      // Check if package has view permission for this module
      if (permSet.has(`${moduleKey}:view`)) {
        modules.push(t(`${moduleConfig.translationNamespace}:${moduleConfig.translationKey}`, {
          defaultValue: moduleKey
        }));
      }
    });
    
    return modules;
  };

  const styles = getStyles(colors);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePackageSelect = (pkg: Package) => {
    if (pkg.id === currentPackageId) {
      Alert.alert(
        t('packages:current_package', { defaultValue: 'Mevcut Paket' }),
        t('packages:already_subscribed', { defaultValue: 'Bu pakete zaten abonesiniz.' }),
        [{ text: t('common:ok', { defaultValue: 'Tamam' }) }]
      );
      return;
    }

    // TODO: Navigate to payment screen or show payment options
    Alert.alert(
      t('packages:upgrade_package', { defaultValue: 'Paket Yükseltme' }),
      t('packages:upgrade_confirmation', { 
        defaultValue: '{{packageName}} paketine yükseltmek istediğinizden emin misiniz?',
        packageName: pkg.name 
      }),
      [
        {
          text: t('common:cancel', { defaultValue: 'İptal' }),
          style: 'cancel',
        },
        {
          text: t('packages:upgrade', { defaultValue: 'Yükselt' }),
          onPress: () => {
            // TODO: Implement payment logic
            Alert.alert(
              t('common:success', { defaultValue: 'Başarılı' }),
              t('packages:upgrade_success', { 
                defaultValue: 'Paket yükseltme işlemi başlatıldı. Ödeme işleminden sonra aktif olacaktır.',
                packageName: pkg.name 
              })
            );
          },
        },
      ]
    );
  };

  const formatPrice = (price: number, originalPrice?: number) => {
    if (price === 0) {
      return t('packages:free', { defaultValue: 'Ücretsiz' });
    }
    const priceText = `₺${price.toLocaleString('tr-TR')}/ay`;
    if (originalPrice && originalPrice > price) {
      return priceText;
    }
    return priceText;
  };

  const getPermissionCount = (pkg: Package) => {
    return pkg.allowedPermissions.length;
  };

  const getFeatureHighlights = (pkg: Package) => {
    const features: string[] = [];
    const permSet = new Set(pkg.allowedPermissions);

    // Check for CRUD permissions
    const hasFullCRUD = permSet.has('sales:view') && permSet.has('sales:create') && 
                        permSet.has('sales:edit') && permSet.has('sales:delete');
    if (hasFullCRUD) {
      features.push(t('packages:feature_full_crud', { defaultValue: 'Tam CRUD İşlemleri' }));
    }

    // Check for custom forms (with limits)
    if (pkg.maxCustomForms && pkg.maxCustomForms > 0) {
      if (pkg.allowedFormModules && pkg.allowedFormModules.length > 0) {
        features.push(
          t('packages:feature_custom_forms_limited', {
            defaultValue: `${pkg.maxCustomForms} özel form şablonu (${pkg.allowedFormModules.length} modülde)`,
            maxForms: pkg.maxCustomForms,
            moduleCount: pkg.allowedFormModules.length
          })
        );
      } else {
        features.push(
          t('packages:feature_custom_forms', {
            defaultValue: `${pkg.maxCustomForms} özel form şablonu`,
            maxForms: pkg.maxCustomForms
          })
        );
      }
    }

    // Check for custom fields
    const hasCustomFields = permSet.has('sales:custom_fields') || permSet.has('customers:custom_fields');
    if (hasCustomFields) {
      features.push(t('packages:feature_custom_fields', { defaultValue: 'Özel Alan Yönetimi' }));
    }

    // Check for reports
    if (permSet.has('reports:view')) {
      features.push(t('packages:feature_reports', { defaultValue: 'Raporlar' }));
    }

    // Add employee limit info
    if (pkg.maxEmployeeCount !== undefined) {
      if (pkg.maxEmployeeCount === 999) {
        features.push(t('packages:feature_unlimited_employees', { defaultValue: 'Sınırsız Personel' }));
      } else if (pkg.maxEmployeeCount > 5) {
        features.push(t('packages:feature_max_employees', { 
          defaultValue: 'Maksimum {{count}} Personel',
          count: pkg.maxEmployeeCount 
        }));
      }
    }

    return features;
  };

  return (
    <ScreenLayout 
      title={t('packages:packages', { defaultValue: 'Paketler' })}
      onBack={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          {t('packages:select_package', { defaultValue: 'İşletmeniz için en uygun paketi seçin' })}
        </Text>

        <View style={styles.packagesGrid}>
          {allPackages.map((pkg) => {
            const isCurrent = pkg.id === currentPackageId;
            const isPopular = pkg.id === 'premium' || pkg.id === 'premium+';
            const features = getFeatureHighlights(pkg);
            const permissionCount = getPermissionCount(pkg);

            return (
              <View
                key={pkg.id}
                style={[
                  styles.packageCard,
                  isCurrent && styles.packageCardCurrent,
                  isPopular && styles.packageCardPopular,
                ]}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>
                      {t('packages:popular', { defaultValue: 'Popüler' })}
                    </Text>
                  </View>
                )}

                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.currentBadgeText}>
                      {t('packages:current', { defaultValue: 'Mevcut' })}
                    </Text>
                  </View>
                )}

                <View style={styles.packageHeader}>
                  <View style={styles.packageHeaderTop}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedPackageForDetail(pkg);
                        setDetailModalVisible(true);
                      }}
                      style={styles.infoButton}
                    >
                      <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceContainer}>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <View style={styles.originalPriceContainer}>
                        <Text style={styles.originalPrice}>
                          ₺{pkg.originalPrice.toLocaleString('tr-TR')}/ay
                        </Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            %{Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}
                          </Text>
                        </View>
                      </View>
                    )}
                    <Text style={styles.packagePrice}>{formatPrice(pkg.price, pkg.originalPrice)}</Text>
                  </View>
                </View>

                <Text style={styles.packageDescription}>{pkg.description}</Text>

                <View style={styles.featuresSection}>
                  <Text style={styles.featuresTitle}>
                    {t('packages:features', { defaultValue: 'Özellikler' })}:
                  </Text>
                  {features.length > 0 ? (
                    features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons name="checkmark" size={16} color={colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noFeatures}>
                      {t('packages:basic_features', { defaultValue: 'Temel özellikler' })}
                    </Text>
                  )}
                  <View style={styles.permissionCount}>
                    <Ionicons name="key-outline" size={14} color={colors.muted} />
                    <Text style={styles.permissionCountText}>
                      {t('packages:permissions_count', { 
                        defaultValue: '{{count}} yetki',
                        count: permissionCount 
                      })}
                    </Text>
                  </View>
                  {pkg.maxEmployeeCount !== undefined && (
                    <View style={[styles.permissionCount, { marginTop: spacing.xs }]}>
                      <Ionicons name="people-outline" size={14} color={colors.muted} />
                      <Text style={styles.permissionCountText}>
                        {pkg.maxEmployeeCount === 999
                          ? t('packages:unlimited_employees', { defaultValue: 'Sınırsız personel' })
                          : t('packages:max_employees', { 
                              defaultValue: 'Maksimum {{count}} personel',
                              count: pkg.maxEmployeeCount 
                            })}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    isCurrent && styles.selectButtonCurrent,
                    isPopular && styles.selectButtonPopular,
                  ]}
                  onPress={() => handlePackageSelect(pkg)}
                  disabled={isCurrent}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      isCurrent && styles.selectButtonTextCurrent,
                    ]}
                  >
                    {isCurrent
                      ? t('packages:current_package', { defaultValue: 'Mevcut Paket' })
                      : pkg.price === 0
                      ? t('packages:select_free', { defaultValue: 'Seç' })
                      : t('packages:upgrade', { defaultValue: 'Yükselt' })}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            {t('packages:upgrade_note', { 
              defaultValue: 'Paket yükseltmeleri anında aktif olur. İptal ve iade koşulları için lütfen destek ekibimizle iletişime geçin.' 
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Package Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPackageForDetail && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedPackageForDetail.name}</Text>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  <Text style={styles.modalDescription}>{selectedPackageForDetail.description}</Text>

                  {/* Modules Access */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      {t('packages:modules_access', { defaultValue: 'Erişilebilir Modüller' })}:
                    </Text>
                    {getAccessibleModules(selectedPackageForDetail).map((module, idx) => (
                      <View key={idx} style={styles.modalItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={styles.modalItemText}>{module}</Text>
                      </View>
                    ))}
                    {getAccessibleModules(selectedPackageForDetail).length === 0 && (
                      <Text style={[styles.modalItemText, { color: colors.muted }]}>
                        {t('packages:no_modules', { defaultValue: 'Erişilebilir modül yok' })}
                      </Text>
                    )}
                  </View>

                  {/* Features */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      {t('packages:features', { defaultValue: 'Özellikler' })}:
                    </Text>
                    {getFeatureHighlights(selectedPackageForDetail).map((feature, idx) => (
                      <View key={idx} style={styles.modalItem}>
                        <Ionicons name="checkmark" size={16} color={colors.success} />
                        <Text style={styles.modalItemText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Permissions Count */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      {t('packages:permissions', { defaultValue: 'Yetkiler' })}:
                    </Text>
                    <Text style={styles.modalItemText}>
                      {t('packages:permissions_count', { 
                        defaultValue: '{{count}} yetki',
                        count: getPermissionCount(selectedPackageForDetail)
                      })}
                    </Text>
                  </View>

                  {/* Employee Limit */}
                  {selectedPackageForDetail.maxEmployeeCount !== undefined && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>
                        {t('packages:employee_limit', { defaultValue: 'Personel Limiti' })}:
                      </Text>
                      <Text style={styles.modalItemText}>
                        {selectedPackageForDetail.maxEmployeeCount === 999
                          ? t('packages:unlimited_employees', { defaultValue: 'Sınırsız personel' })
                          : t('packages:max_employees', { 
                              defaultValue: 'Maksimum {{count}} personel',
                              count: selectedPackageForDetail.maxEmployeeCount 
                            })}
                      </Text>
                    </View>
                  )}

                  {/* Custom Forms Limit */}
                  {selectedPackageForDetail.maxCustomForms && selectedPackageForDetail.maxCustomForms > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>
                        {t('packages:custom_forms', { defaultValue: 'Özel Form Şablonları' })}:
                      </Text>
                      <Text style={styles.modalItemText}>
                        {selectedPackageForDetail.allowedFormModules && selectedPackageForDetail.allowedFormModules.length > 0
                          ? t('packages:feature_custom_forms_limited', {
                              defaultValue: `${selectedPackageForDetail.maxCustomForms} özel form şablonu (${selectedPackageForDetail.allowedFormModules.length} modülde)`,
                              maxForms: selectedPackageForDetail.maxCustomForms,
                              moduleCount: selectedPackageForDetail.allowedFormModules.length
                            })
                          : t('packages:feature_custom_forms', {
                              defaultValue: `${selectedPackageForDetail.maxCustomForms} özel form şablonu`,
                              maxForms: selectedPackageForDetail.maxCustomForms
                            })}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.xl,
    },
    description: {
      fontSize: 16,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    packagesGrid: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    packageCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
      position: 'relative',
    },
    packageCardCurrent: {
      borderColor: colors.success,
      backgroundColor: colors.success + '10',
    },
    packageCardPopular: {
      borderColor: colors.primary,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    popularBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    currentBadge: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.success + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    currentBadgeText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: '600',
    },
    packageHeader: {
      marginBottom: spacing.md,
    },
    packageName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    priceContainer: {
      flexDirection: 'column',
      gap: spacing.xs,
    },
    originalPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    originalPrice: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.muted,
      textDecorationLine: 'line-through',
    },
    discountBadge: {
      backgroundColor: colors.error || '#DC2626',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: 8,
    },
    discountBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    packagePrice: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary,
    },
    packageDescription: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: spacing.lg,
      lineHeight: 20,
    },
    featuresSection: {
      marginBottom: spacing.lg,
    },
    featuresTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    featureText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    noFeatures: {
      fontSize: 14,
      color: colors.muted,
      fontStyle: 'italic',
    },
    permissionCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    permissionCountText: {
      fontSize: 12,
      color: colors.muted,
    },
    selectButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
    },
    selectButtonCurrent: {
      backgroundColor: colors.success,
    },
    selectButtonPopular: {
      backgroundColor: colors.primary,
    },
    selectButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    selectButtonTextCurrent: {
      color: '#FFFFFF',
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.primary + '10',
      borderRadius: 12,
      marginHorizontal: spacing.lg,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: colors.muted,
      lineHeight: 18,
    },
    packageHeaderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    infoButton: {
      padding: spacing.xs,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingTop: spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalCloseButton: {
      padding: spacing.xs,
    },
    modalScrollView: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    modalDescription: {
      fontSize: 16,
      color: colors.muted,
      marginBottom: spacing.lg,
      lineHeight: 24,
    },
    modalSection: {
      marginBottom: spacing.lg,
    },
    modalSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    modalItemText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
  });
