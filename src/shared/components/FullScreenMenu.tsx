import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet, Platform, useWindowDimensions, ScrollView, TextInput, Animated, StatusBar, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../core/constants/spacing';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../../core/config/permissions';
import { Role } from '../../core/config/appConstants';
import { useTheme } from '../../core/contexts/ThemeContext';
import ConfirmDialog from './ConfirmDialog';
import AppModal from './Modal';
import storage from '../services/storageService';
import { MODULE_CONFIGS, ALL_QUICK_ACTIONS, getQuickActionFallback } from '../../core/config/moduleConfig';
import { allRoutes } from '../../core/navigation/routes';

type MenuItem = {
  key: string;
  label: string;
  icon: string;
  routeName: string;
  requiredPermission?: string;
  isLocked?: boolean;
  isAvailable?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (routeName: string) => void;
  availableRoutes?: string[];
  role?: Role;
};

export default function FullScreenMenu({ visible, onClose, onNavigate, availableRoutes, role = 'guest' }: Props) {
  // Get all unique translation namespaces from module configs
  const translationNamespaces = useMemo(() => {
    const namespaces = new Set<string>();
    MODULE_CONFIGS.forEach((module) => {
      namespaces.add(module.translationNamespace);
      module.quickActions?.forEach((qa) => {
        namespaces.add(qa.translationNamespace);
      });
    });
    namespaces.add('settings');
    namespaces.add('dashboard');
    namespaces.add('common');
    return Array.from(namespaces);
  }, []);

  const { t } = useTranslation(translationNamespaces);
  const { width, height } = useWindowDimensions();
  // Responsive breakpoints for grid columns (items)
  // phones: 2-3, tablets: 3-4, large tablets/desktop: 4-5 (max 6 for very wide)
  const numColumns = width > 1200
  ? 4
  : width > 900
    ? 3
    : width > 600
      ? 2
      : 1;

  // Responsive breakpoints for quick actions row - single row with more items
  const qaCols = 6; // Fixed to 6 quick actions
  // Icon/label sizes scale with width - icon wrapper smaller, icons larger
  const itemIconSize = width > 1200 ? 28 : width > 900 ? 24 : 22;
  const iconWrapSize = width > 1200 ? 60 : width > 900 ? 54 : 36;
  const itemLabelSize = width > 1200 ? 12 : 11;
  
  
  // Quick action sizes - smaller wrappers, larger icons for single row
  const quickIconSize = width > 1600 ? 20 : width > 1280 ? 18 : width > 980 ? 17 : width > 640 ? 16 : 14;
  const quickIconWrapSize = width > 640 ? 36 : 32;
  const { colors, activeTheme } = useTheme();
  const QUICK_MAX = 6; // Fixed to 6 quick actions
  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState<string | null>(null);
  const [addQaVisible, setAddQaVisible] = useState(false);
  const [removeQaVisible, setRemoveQaVisible] = useState(false);
  const [removeQaKey, setRemoveQaKey] = useState<string | null>(null);
  const [customQuickActions, setCustomQuickActions] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      const useNative = Platform.OS !== 'web';
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: useNative,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: useNative,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: useNative,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  // Handle Android back button - close menu instead of navigating away
  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true; // Prevent default back button behavior
      });

      return () => backHandler.remove();
    }
  }, [visible, onClose]);
  
  const processedItems = useMemo(() => {
    const mapped = MODULE_CONFIGS.map((module) => {
      const hasAccess = !module.requiredPermission || hasPermission(role, module.requiredPermission);
      const isAvailable = availableRoutes?.includes(module.routeName) ?? false;
      
      // Get label from translation
      const label = t(`${module.translationNamespace}:${module.translationKey}`, {
        defaultValue: module.key,
      });
      
      return {
        key: module.key,
        label,
        icon: module.icon,
        routeName: module.routeName,
        requiredPermission: module.requiredPermission,
        isLocked: !hasAccess,
        isAvailable,
      };
    });
    
    // Sadece navigator'da mevcut olan route'ları göster
    const available = mapped.filter(it => it.isAvailable);
    
    // Owner: Tüm öğeleri göster (kilitli olanlar dahil)
    // Staff: Sadece erişim izni olanları göster
    // Admin: Tüm öğeleri göster (hepsi açık)
    if (role === 'staff') {
      return available.filter(it => !it.isLocked);
    }
    // Owner ve admin için tüm öğeleri göster
    return available;
  }, [t, role, availableRoutes]);

  const quickActionLabelByRoute = useMemo(() => {
    const labels: Record<string, string> = {};
    ALL_QUICK_ACTIONS.forEach((qa) => {
      labels[qa.routeName] = t(`${qa.translationNamespace}:${qa.translationKey}`, {
        defaultValue: qa.routeName,
      });
    });
    return labels;
  }, [t]);

  // Note: processedQuickActions is not used - we only show custom quick actions
  // ALL_QUICK_ACTIONS is only used for the "Add Quick Action" modal

  const processedCustomQuickActions = useMemo(() => {
    return customQuickActions
      .map((qa) => {
        const hasAccess = !qa.requiredPermission || hasPermission(role, qa.requiredPermission);
        const routeName = (qa as any).routeName;
        // Check if the route or its fallback is available
        const isAvailable = availableRoutes?.includes(routeName) ?? false;
        const fallback = getQuickActionFallback(routeName);
        const fallbackAvailable = fallback && (availableRoutes?.includes(fallback) ?? false);
        const label = quickActionLabelByRoute[routeName] ?? qa.label;
        return { ...qa, label, isLocked: !hasAccess, isAvailable: isAvailable || fallbackAvailable } as any;
      })
      .filter((qa: any) => !qa.isLocked && qa.isAvailable);
  }, [customQuickActions, role, quickActionLabelByRoute, availableRoutes]);

  const canAddQuick = useMemo(() => {
    // Check if user has permission to create any quick action
    return ALL_QUICK_ACTIONS.some((qa) => hasPermission(role, qa.requiredPermission));
  }, [role]);

  // Persist custom quick actions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await storage.get<string>('customQuickActions');
        if (mounted && saved != null) {
          const parsed = JSON.parse(saved) as MenuItem[];
          setCustomQuickActions(parsed);
        } else {
          // First time setup: add default quick actions for common items
          const defaults: MenuItem[] = [];
          // Add most common quick actions: stock, sales, purchases, customers, expenses, suppliers
          const commonRoutes = ['StockCreate', 'SalesCreate', 'PurchaseCreate', 'CustomerCreate', 'ExpenseCreate', 'SupplierCreate'];
          commonRoutes.forEach(route => {
            const qa = ALL_QUICK_ACTIONS.find(a => a.routeName === route && hasPermission(role, a.requiredPermission));
            if (qa && defaults.length < QUICK_MAX) {
              defaults.push({
                key: qa.key,
                label: quickActionLabelByRoute[qa.routeName] || qa.routeName,
                icon: qa.icon,
                routeName: qa.routeName,
                requiredPermission: qa.requiredPermission,
              });
            }
          });
          if (mounted && defaults.length > 0) {
            setCustomQuickActions(defaults);
          }
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [role, quickActionLabelByRoute, QUICK_MAX]);

  useEffect(() => {
    (async () => {
      try {
        await storage.set('customQuickActions', JSON.stringify(customQuickActions));
      } catch {}
    })();
  }, [customQuickActions]);

  const safeNavigate = (routeName: string) => {
    const canGo = availableRoutes?.includes(routeName);
    if (canGo) {
      onNavigate(routeName);
      return;
    }
    // Try to get fallback route from module config
    const fallback = getQuickActionFallback(routeName);
    if (fallback && availableRoutes?.includes(fallback)) {
      onNavigate(fallback);
      return;
    }
    // Route not registered - navigation handled by parent
  };

  // Create comprehensive search items from all available routes and quick actions
  const allSearchItems = useMemo(() => {
    const searchItems: MenuItem[] = [];
    
    // Add main modules (they're already processed in processedItems)
    processedItems.forEach(item => {
      searchItems.push(item);
    });
    
    // Add all available routes for search
    allRoutes
      .filter(route => availableRoutes?.includes(route.name))
      .forEach(route => {
        // Skip if already in processedItems (module dashboards)
        if (processedItems.find(i => i.routeName === route.name)) return;
        
        // Determine translation and icon based on route type
        let label = route.name;
        let icon = 'document-outline';
        let category = 'other';
        
        // Try to get label from route options
        if (route.options && typeof route.options.title === 'string') {
          label = route.options.title;
        } else {
          // Try common translations based on route name patterns
          if (route.name.endsWith('List')) {
            const moduleName = route.name.replace('List', '');
            label = t(`${route.module}:${route.module}`, { defaultValue: moduleName });
            icon = 'list-outline';
            category = 'list';
          } else if (route.name.endsWith('Create')) {
            const moduleName = route.name.replace('Create', '');
            label = t(`${route.module}:new_${route.module.toLowerCase()}`, { defaultValue: `New ${moduleName}` });
            icon = 'add-circle-outline';
            category = 'create';
          } else if (route.name.endsWith('Edit')) {
            const moduleName = route.name.replace('Edit', '');
            label = t(`${route.module}:edit_${route.module.toLowerCase()}`, { defaultValue: `Edit ${moduleName}` });
            icon = 'pencil-outline';
            category = 'edit';
          } else if (route.name.endsWith('Detail')) {
            const moduleName = route.name.replace('Detail', '');
            label = t(`${route.module}:${route.module.toLowerCase()}_details`, { defaultValue: `${moduleName} Details` });
            icon = 'document-text-outline';
            category = 'detail';
          } else if (route.name === 'Settings') {
            label = t('common:settings');
            icon = 'settings-outline';
            category = 'settings';
          } else if (route.name === 'Profile') {
            label = t('common:profile');
            icon = 'person-outline';
            category = 'profile';
          } else if (route.name === 'Notifications') {
            label = t('common:notifications');
            icon = 'notifications-outline';
            category = 'notifications';
          }
        }
        
        const hasAccess = !route.requiredPermission || hasPermission(role, route.requiredPermission);
        searchItems.push({
          key: `route-${route.name}`,
          label,
          icon,
          routeName: route.name,
          requiredPermission: route.requiredPermission,
          isLocked: !hasAccess && role === 'owner',
          isAvailable: true,
        });
      });
    
    return searchItems;
  }, [processedItems, availableRoutes, role, t]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return processedItems;
    const term = searchTerm.trim().toLowerCase();
    
    // Smart search with priority scoring
    const scoredItems = allSearchItems
      .filter(i => {
        const labelLower = i.label.toLowerCase();
        const termLower = term.toLowerCase();
        
        // Filter out locked items for non-owners
        if (i.isLocked && role !== 'owner') return false;
        if (!i.isAvailable) return false;
        
        // Check if label contains the search term
        if (!labelLower.includes(termLower)) return false;
        
        return true;
      })
      .map(item => {
        let score = 0;
        const labelLower = item.label.toLowerCase();
        const termLower = term.toLowerCase();
        
        // Exact match gets highest priority
        if (labelLower === termLower) score += 1000;
        // Starts with gets high priority
        else if (labelLower.startsWith(termLower)) score += 500;
        // Contains at start of word
        else if (labelLower.includes(` ${termLower}`)) score += 200;
        
        // Boost main modules over sub-screens
        if (!item.routeName.endsWith('List') && !item.routeName.endsWith('Create') && 
            !item.routeName.endsWith('Edit') && !item.routeName.endsWith('Detail')) {
          score += 100;
        }
        
        // Boost quick actions
        if (item.key.startsWith('qa-')) score += 50;
        
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 20); // Limit to top 20 results
    
    return scoredItems;
  }, [processedItems, searchTerm, allSearchItems, role]);

  const totalQuickCount = processedCustomQuickActions.length;
  const filteredQuickActions = useMemo(() => {
    const filtered = !searchTerm.trim()
      ? processedCustomQuickActions
      : processedCustomQuickActions.filter(i => i.label.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    return filtered.slice(0, QUICK_MAX);
  }, [processedCustomQuickActions, searchTerm, QUICK_MAX]);

  const handleRemoveCustomQuick = useCallback((key: string) => {
    setCustomQuickActions(prev => prev.filter(q => q.key !== key));
  }, []);


  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
      <Animated.View 
        style={[
          styles.backdrop, 
          { 
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              backgroundColor: colors.surface,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
              opacity: fadeAnim,
            }
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.header, { backgroundColor: `${colors.primary}08` }]}> 
            <View style={styles.headerLeft}>
              <View style={[styles.menuIndicator, { backgroundColor: colors.primary }]} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t('common:menu', { defaultValue: 'Menü' })}
              </Text>
            </View>
            <View style={[styles.searchWrap, { borderColor: colors.border, backgroundColor: colors.surface, flex: 1, maxWidth: 300, marginHorizontal: spacing.md }]}>
              <Ionicons name="search" size={16} color={colors.muted} />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder={t('common:search', { defaultValue: 'Ara...' })}
                placeholderTextColor={colors.muted}
                style={[styles.searchInput, { color: colors.text }]}
                accessibilityLabel={t('common:search', { defaultValue: 'Ara' }) as string}
              />
              {!!searchTerm && (
                <TouchableOpacity onPress={() => setSearchTerm('')} accessibilityRole="button" accessibilityLabel={t('common:clear', { defaultValue: 'Temizle' }) as string}>
                  <Ionicons name="close-circle" size={16} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.closeBtn, { backgroundColor: `${colors.primary}15` }]} 
              accessibilityRole="button" 
              accessibilityLabel={t('common:close', { defaultValue: 'Close' })}
            >
              <Ionicons name="close" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ padding: spacing.lg, gap: spacing.lg }}>
              {/* Quick Actions Section */}
              {filteredQuickActions.length > 0 && (
                <View>
                  <View style={styles.quickHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {t('common:quick_actions', { defaultValue: 'Hızlı İşlemler' })}
                    </Text>
                    {canAddQuick && totalQuickCount < QUICK_MAX && (
                      <TouchableOpacity 
                        onPress={() => setAddQaVisible(true)}
                        style={{ padding: spacing.xs }}
                        accessibilityRole="button"
                        accessibilityLabel={t('common:add', { defaultValue: 'Ekle' }) as string}
                      >
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.quickRow}>
                    {filteredQuickActions.map((qa, idx) => (
                      <TouchableOpacity
                        key={qa.key}
                        style={[
                          styles.quickItem,
                          { width: `${100 / qaCols}%` }
                        ]}
                        onPress={() => {
                          onClose();
                          safeNavigate(qa.routeName);
                        }}
                        onLongPress={() => {
                          // Check if it's a custom quick action for removal
                          if (customQuickActions.find(c => c.key === qa.key)) {
                            setRemoveQaKey(qa.key);
                            setRemoveQaVisible(true);
                          }
                        }}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={qa.label}
                      >
                        <View style={[
                          styles.quickIconWrap, 
                          { 
                            backgroundColor: `${colors.primary}15`,
                            width: quickIconWrapSize,
                            height: quickIconWrapSize,
                            borderRadius: Math.round(quickIconWrapSize / 3)
                          }
                        ]}>
                          <Ionicons name={qa.icon as any} size={quickIconSize} color={colors.primary} />
                        </View>
                        <Text style={[styles.quickLabel, { color: colors.text, fontSize: width > 640 ? 11 : 10 }]} numberOfLines={1}>
                          {qa.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Main Menu Items */}
              <View>
                <View style={styles.itemsGrid}>
                  {filteredItems.map((item) => {
                    // Calculate item width as percentage - gap will handle spacing
                    const itemWidthPercent = 100 / numColumns;
                    
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.item,
                          { 
                            backgroundColor: colors.surface,
                            width: `${itemWidthPercent}%`,
                            borderWidth: 1,
                            borderColor: activeTheme === 'dark' ? colors.border : `${colors.border}40`,
                            ...(Platform.OS === 'web' ? {} : {
                              // For native, ensure proper wrapping
                              flex: 0,
                              minWidth: 0,
                            }),
                          },
                          // On very small screens, use a non-square card for better readability
                          width <= 560 ? { aspectRatio: undefined, minHeight: 96, paddingVertical: spacing.lg } : null,
                          item.isLocked && styles.locked,
                        ]}
                      onPress={() => {
                        if (item.isLocked) {
                          if (role === 'owner') {
                            setPurchaseTarget(item.label);
                            setPurchaseVisible(true);
                          }
                        } else {
                          onClose();
                          safeNavigate(item.routeName);
                        }
                      }}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.label}`}
                    >
                      <View style={[
                        styles.iconWrap,
                        { 
                          backgroundColor: item.isLocked ? `${colors.muted}15` : `${colors.primary}15`,
                          width: iconWrapSize,
                          height: iconWrapSize,
                          borderRadius: Math.round(iconWrapSize / 3.25),
                        }
                      ]}> 
                        <Ionicons name={item.icon as any} size={itemIconSize} color={item.isLocked ? colors.muted : colors.primary} />
                        {item.isLocked && (
                          <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}> 
                            <Ionicons name="lock-closed" size={12} color={colors.surface} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.itemLabel, { color: colors.text, fontSize: itemLabelSize }]} numberOfLines={1}>{item.label}</Text>
                    </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Add Quick Action Modal */}
          <AppModal visible={addQaVisible} onRequestClose={() => setAddQaVisible(false)}>
            <View style={{ gap: spacing.md }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.xs }}>{t('common:add_quick_action', { defaultValue: 'Hızlı işlem ekle' })}</Text>
              {totalQuickCount < QUICK_MAX && ALL_QUICK_ACTIONS
                .filter(qa => hasPermission(role, qa.requiredPermission))
                .filter(qa => !customQuickActions.find(c => c.key === qa.key))
                .map(qa => {
                  const menuItem: MenuItem = {
                    key: qa.key,
                    label: quickActionLabelByRoute[qa.routeName] || qa.routeName,
                    icon: qa.icon,
                    routeName: qa.routeName,
                    requiredPermission: qa.requiredPermission,
                  };
                  return (
                    <TouchableOpacity
                      key={qa.key}
                      onPress={() => {
                        if (totalQuickCount < QUICK_MAX) {
                          setCustomQuickActions((prev) => [...prev, menuItem]);
                        }
                        setAddQaVisible(false);
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}
                      accessibilityRole="button"
                      accessibilityLabel={menuItem.label}
                    >
                      <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}15`, marginRight: spacing.sm }]}> 
                        <Ionicons name={qa.icon as any} size={18} color={colors.primary} />
                      </View>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{menuItem.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
                <TouchableOpacity onPress={() => setAddQaVisible(false)}>
                  <Text style={{ color: colors.muted, fontWeight: '600' }}>{t('common:cancel', { defaultValue: 'Vazgeç' })}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AppModal>
          
          <ConfirmDialog
            visible={purchaseVisible}
            title={t('common:upgrade_needed', { defaultValue: 'Yükseltme gerekli' }) as string}
            message={(t('common:upgrade_message', { defaultValue: `${purchaseTarget || ''} için bir paket satın almanız gerekiyor.` }) as string)}
            confirmText={t('common:buy_now', { defaultValue: 'Satın al' }) as string}
            cancelText={t('common:cancel', { defaultValue: 'Vazgeç' }) as string}
            onCancel={() => setPurchaseVisible(false)}
            onConfirm={() => {
              setPurchaseVisible(false);
              onClose();
              // Yönlendirme: Ayarlar sayfasına yönlendiriyoruz (paket satın alma akışı burada olabilir)
              safeNavigate('Settings');
            }}
          />

          <ConfirmDialog
            visible={removeQaVisible}
            title={t('common:remove_quick_action', { defaultValue: 'Hızlı İşlemi Kaldır' }) as string}
            message={t('common:remove_quick_action_message', { defaultValue: 'Bu hızlı işlemi kaldırmak istediğinize emin misiniz?' }) as string}
            confirmText={t('common:remove', { defaultValue: 'Kaldır' }) as string}
            cancelText={t('common:cancel', { defaultValue: 'Vazgeç' }) as string}
            onCancel={() => setRemoveQaVisible(false)}
            onConfirm={() => {
              if (removeQaKey) {
                handleRemoveCustomQuick(removeQaKey);
              }
              setRemoveQaVisible(false);
              setRemoveQaKey(null);
            }}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '96%',
    maxWidth: 1400,
    maxHeight: '94%',
    borderRadius: 24,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 20px 60px rgba(0,0,0,0.4)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 10 },
          elevation: 20,
        }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 0,
    gap: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: { 
    padding: spacing.sm,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 40,
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }),
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    fontSize: 15,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',      
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    overflow: 'hidden',
  },
  quickItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  
  quickIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    width: 44,
    height: 44,
    ...(Platform.OS === 'web'
      ? { transition: 'all 0.2s ease' }
      : {}),
  },
  
  quickLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xs,
    gap: spacing.xs, // Reduced gap for tighter spacing
  },
  item: {
    marginVertical: spacing.xs,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 0.7, 
    paddingVertical: spacing.xs,  
    paddingHorizontal: spacing.xs,
    minHeight: 75,  
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }),
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  locked: {
    opacity: 0.6,
  },
  lockBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


