import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, ScrollView, TextInput, Animated, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../core/constants/spacing';
import { useTranslation } from 'react-i18next';
import { Role, hasPermission } from '../../core/config/permissions';
import { useTheme } from '../../core/contexts/ThemeContext';
import ConfirmDialog from './ConfirmDialog';
import AppModal from './Modal';
import storage from '../services/storageService';

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
  { key: 'employees', label: '', icon: 'person-outline', routeName: 'Employees', requiredPermission: 'employees:view' },
  { key: 'products', label: '', icon: 'cube-outline', routeName: 'Products', requiredPermission: 'products:view' },
  { key: 'reports', label: '', icon: 'bar-chart-outline', routeName: 'Reports', requiredPermission: 'reports:view' },

];

const QUICK_ACTIONS: MenuItem[] = [
  { key: 'qa-sale', label: '', icon: 'add-circle-outline', routeName: 'SalesCreate', requiredPermission: 'sales:create' },
  { key: 'qa-customer', label: '', icon: 'person-add-outline', routeName: 'CustomerCreate', requiredPermission: 'customers:create' },
  { key: 'qa-expense', label: '', icon: 'add-circle-outline', routeName: 'ExpenseCreate', requiredPermission: 'expenses:create' },
  { key: 'qa-employee', label: '', icon: 'person-add-outline', routeName: 'EmployeeCreate', requiredPermission: 'employees:create' },
  { key: 'qa-product', label: '', icon: 'add-circle-outline', routeName: 'ProductCreate', requiredPermission: 'products:create' },
];

export default function FullScreenMenu({ visible, onClose, onNavigate, availableRoutes, role = 'guest' }: Props) {
  const { t } = useTranslation([
    'sales',
    'customers',
    'expenses',
    'employees',
    'products',
    'reports',
    'settings',
    'common',
  ]);
  const { width, height } = useWindowDimensions();
  // Responsive breakpoints for grid columns (items)
  // phones: 2-3, tablets: 3-4, large tablets/desktop: 4-5 (max 6 for very wide)
  const numColumns = width > 1600
    ? 6
    : width > 1280
      ? 5
      : width > 980
        ? 4
        : width > 640
          ? 3
          : 2; // small phones default 2
  // Responsive breakpoints for quick actions row - fixed to 4 columns
  const qaCols = 4;
  // Icon/label sizes scale with width and slightly reduced to fit more per row
  const itemIconSize = width > 1600 ? 32 : width > 1280 ? 30 : width > 980 ? 28 : width > 640 ? 26 : 22;
  const itemLabelSize = width > 1600 ? 14 : width > 1280 ? 13 : width > 980 ? 12 : width > 640 ? 12 : 11;
  const iconWrapSize = width > 1600 ? 56 : width > 1280 ? 52 : width > 980 ? 50 : width > 640 ? 48 : 44;
  const { colors } = useTheme();
  const QUICK_MAX = 4;
  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState<string | null>(null);
  const [addQaVisible, setAddQaVisible] = useState(false);
  const [customQuickActions, setCustomQuickActions] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [manageQaVisible, setManageQaVisible] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);
  
  const processedItems = useMemo(() => {
    const labelByRoute: Record<string, string> = {
      Sales: t('sales', { ns: 'common' }),
      Customers: t('customers', { ns: 'common' }),
      Expenses: t('expenses', { ns: 'common' }),
      Reports: t('reports', { ns: 'reports' }),
      Employees: t('employees', { ns: 'common' }),
      Products: t('products', { ns: 'products' }),
    };
    
    const mapped = ITEMS.map((it) => {
      const hasAccess = !it.requiredPermission || hasPermission(role, it.requiredPermission);
      const isAvailable = availableRoutes?.includes(it.routeName) ?? false;
      return {
        ...it,
        label: labelByRoute[it.routeName] ?? it.label,
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

  const quickActionLabelByRoute = useMemo(() => ({
    SalesCreate: t('sales:new_sale', { defaultValue: 'Yeni satış' }),
    CustomerCreate: t('customers:new_customer', { defaultValue: 'Yeni müşteri' }),
    ExpenseCreate: t('expenses:new_expense', { defaultValue: 'Yeni gider' }),
    EmployeeCreate: t('settings:new_employee', { defaultValue: 'Yeni çalışan' }),
    ProductCreate: t('products:new_product', { defaultValue: 'Yeni ürün' }),
  }) as Record<string, string>, [t]);

  const processedQuickActions = useMemo(() => {
    const getFallback = (routeName: string): string | undefined => {
      const fallbackMap: Record<string, string> = {
        SalesCreate: 'Sales',
        CustomerCreate: 'Customers',
        ExpenseCreate: 'Expenses',
        EmployeeCreate: 'Employees',
        ProductCreate: 'Products',
      };
      return fallbackMap[routeName];
    };

    const mapped = QUICK_ACTIONS.map((qa) => {
      const hasAccess = !qa.requiredPermission || hasPermission(role, qa.requiredPermission);
      // Check if the route or its fallback is available
      const isAvailable = availableRoutes?.includes(qa.routeName) ?? false;
      const fallback = getFallback(qa.routeName);
      const fallbackAvailable = fallback && (availableRoutes?.includes(fallback) ?? false);
      return {
        ...qa,
        label: quickActionLabelByRoute[qa.routeName] ?? qa.label,
        isLocked: !hasAccess,
        isAvailable: isAvailable || fallbackAvailable,
      };
    });
    // Sadece navigator'da mevcut olan veya fallback'i olan route'ları göster
    const available = mapped.filter(it => it.isAvailable);
    // Staff: Sadece erişim izni olanları göster
    if (role === 'staff') {
      return available.filter(it => !it.isLocked);
    }
    // Owner ve admin için tüm öğeleri göster (kilitli olanlar dahil)
    return available;
  }, [role, quickActionLabelByRoute, availableRoutes]);

  const processedCustomQuickActions = useMemo(() => {
    const getFallback = (routeName: string): string | undefined => {
      const fallbackMap: Record<string, string> = {
        SalesCreate: 'Sales',
        CustomerCreate: 'Customers',
        ExpenseCreate: 'Expenses',
        EmployeeCreate: 'Employees',
        ProductCreate: 'Products',
      };
      return fallbackMap[routeName];
    };

    return customQuickActions
      .map((qa) => {
        const hasAccess = !qa.requiredPermission || hasPermission(role, qa.requiredPermission);
        const routeName = (qa as any).routeName;
        // Check if the route or its fallback is available
        const isAvailable = availableRoutes?.includes(routeName) ?? false;
        const fallback = getFallback(routeName);
        const fallbackAvailable = fallback && (availableRoutes?.includes(fallback) ?? false);
        const label = quickActionLabelByRoute[routeName] ?? qa.label;
        return { ...qa, label, isLocked: !hasAccess, isAvailable: isAvailable || fallbackAvailable } as any;
      })
      .filter((qa: any) => !qa.isLocked && qa.isAvailable);
  }, [customQuickActions, role, quickActionLabelByRoute, availableRoutes]);

  const canAddQuick = useMemo(() => {
    const perms = ['sales:create','customers:create','expenses:create'];
    return perms.some(p => hasPermission(role, p));
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
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

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
    const fallbackMap: Record<string, string> = {
      SalesCreate: 'Sales',
      SalesEdit: 'Sales',
      CustomerCreate: 'Customers',
      CustomerEdit: 'Customers',
      ExpenseCreate: 'Expenses',
      ExpenseEdit: 'Expenses',
      EmployeeCreate: 'Employees',
      EmployeeEdit: 'Employees',
      ProductCreate: 'Products',
      ProductEdit: 'Products',
    };
    const fallback = fallbackMap[routeName];
    if (fallback && availableRoutes?.includes(fallback)) {
      onNavigate(fallback);
      return;
    }
    // Route not registered - navigation handled by parent
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return processedItems;
    const term = searchTerm.trim().toLowerCase();
    return processedItems.filter(i => i.label.toLowerCase().includes(term));
  }, [processedItems, searchTerm]);

  const totalQuickCount = processedQuickActions.length + processedCustomQuickActions.length;
  const filteredQuickActions = useMemo(() => {
    const list = [...processedQuickActions, ...processedCustomQuickActions];
    const filtered = !searchTerm.trim()
      ? list
      : list.filter(i => i.label.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    return filtered.slice(0, QUICK_MAX);
  }, [processedQuickActions, processedCustomQuickActions, searchTerm]);

  const handleRemoveCustomQuick = useCallback((key: string) => {
    setCustomQuickActions(prev => prev.filter(q => q.key !== key));
  }, []);

  const isInCustomQuick = useCallback((routeName: string) => {
    return customQuickActions.some(q => (q as any).routeName === routeName);
  }, [customQuickActions]);

  const tryAddCustomQuickFromItem = useCallback((item: MenuItem & { requiredPermission?: string }) => {
    if (totalQuickCount >= QUICK_MAX) return;
    if (isInCustomQuick(item.routeName)) return;
    const newQa: MenuItem = {
      key: `qa-custom-${item.routeName}`,
      label: item.label,
      icon: item.icon,
      routeName: item.routeName,
      requiredPermission: item.requiredPermission,
    };
    setCustomQuickActions(prev => [...prev, newQa]);
  }, [totalQuickCount, isInCustomQuick]);

  const moveCustomQuick = useCallback((index: number, dir: -1 | 1) => {
    setCustomQuickActions(prev => {
      const next = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = tmp;
      return next;
    });
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
              <View style={{ paddingHorizontal: spacing.md }}>
                <View style={[styles.searchWrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
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
              </View>
              <View>
                <View style={[styles.quickHeader]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('common:quick_actions', { defaultValue: 'Quick Actions' })}</Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <TouchableOpacity onPress={() => setManageQaVisible(true)} accessibilityRole="button" accessibilityLabel={t('common:edit', { defaultValue: 'Düzenle' }) as string}>
                      <Ionicons name="settings-outline" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.quickRow}>
                  {filteredQuickActions.map((qa) => (
                    <View
                      key={qa.key}
                      style={[styles.quickItem, { width: `${100 / qaCols}%` }]}
                    >
                      {qa.isLocked ? (
                        <TouchableOpacity
                          onPress={() => {
                            if (role === 'owner') {
                              setPurchaseTarget(qa.label);
                              setPurchaseVisible(true);
                            }
                          }}
                          activeOpacity={role === 'owner' ? 0.85 : 1}
                          disabled={role !== 'owner'}
                          accessibilityRole="button"
                          accessibilityLabel={`${qa.label}`}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}10` }]}>
                            <Ionicons name={qa.icon as any} size={20} color={colors.muted} />
                            <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}>
                              <Ionicons name="lock-closed" size={10} color={colors.surface} />
                            </View>
                          </View>
                          <Text style={[styles.quickLabel, { color: colors.muted }]} numberOfLines={1}>{qa.label}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            onClose();
                            safeNavigate(qa.routeName);
                          }}
                          activeOpacity={0.85}
                          onLongPress={() => {
                            // Sadece custom eklenmiş QA'lar kaldırılabilir
                            if (processedCustomQuickActions.find(c => c.key === qa.key)) {
                              handleRemoveCustomQuick(qa.key);
                            }
                          }}
                          delayLongPress={400}
                          accessibilityRole="button"
                          accessibilityLabel={`${qa.label}`}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}20` }]}>
                            <Ionicons name={qa.icon as any} size={22} color={colors.primary} />
                          </View>
                          <Text style={[styles.quickLabel, { color: colors.text }]} numberOfLines={2}>{qa.label}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {canAddQuick && totalQuickCount < QUICK_MAX && (
                    <TouchableOpacity
                      style={[styles.quickItem, { width: `${100 / qaCols}%` }]}
                      onPress={() => setAddQaVisible(true)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel={t('common:add_quick_action', { defaultValue: 'Hızlı işlem ekle' }) as string}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}10`, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}> 
                        <Ionicons name="add" size={18} color={colors.primary} />
                      </View>
                      <Text style={[styles.quickLabel, { color: colors.primary }]} numberOfLines={1}>{t('common:add_quick_action', { defaultValue: 'Hızlı işlem ekle' })}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View>
                <View style={styles.itemsGrid}>
                  {filteredItems.map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.item,
                        { backgroundColor: colors.surface, width: `${100 / numColumns}%` },
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
                      {canAddQuick && !item.isLocked && !isInCustomQuick(item.routeName) && customQuickActions.length < QUICK_MAX && (
                        <View
                          style={[styles.addOnCard, { borderColor: colors.border, backgroundColor: `${colors.primary}10` }]}
                          pointerEvents="box-none"
                        >
                          <TouchableOpacity
                            onPress={() => tryAddCustomQuickFromItem(item)}
                            style={{ padding: 2 }}
                            accessibilityRole="button"
                            accessibilityLabel={t('common:add_quick_action', { defaultValue: 'Hızlı işlem ekle' }) as string}
                          >
                            <Ionicons name="add" size={14} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Add Quick Action Modal */}
          <AppModal visible={addQaVisible} onRequestClose={() => setAddQaVisible(false)}>
            <View style={{ gap: spacing.md }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.xs }}>{t('common:add_quick_action', { defaultValue: 'Hızlı işlem ekle' })}</Text>
              {QUICK_ACTIONS
                .filter(qa => hasPermission(role, qa.requiredPermission as any))
                .filter(qa => !customQuickActions.find(c => c.key === qa.key))
                .filter(() => totalQuickCount < QUICK_MAX)
                .map(qa => (
                  <TouchableOpacity
                    key={qa.key}
                    onPress={() => {
                      if (totalQuickCount < QUICK_MAX) {
                        setCustomQuickActions((prev) => [...prev, qa]);
                      }
                      setAddQaVisible(false);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}
                    accessibilityRole="button"
                    accessibilityLabel={`${quickActionLabelByRoute[qa.routeName] || qa.routeName}`}
                  >
                    <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}15`, marginRight: spacing.sm }]}> 
                      <Ionicons name={qa.icon as any} size={18} color={colors.primary} />
                    </View>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{quickActionLabelByRoute[qa.routeName] || qa.routeName}</Text>
                  </TouchableOpacity>
                ))}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
                <TouchableOpacity onPress={() => setAddQaVisible(false)}>
                  <Text style={{ color: colors.muted, fontWeight: '600' }}>{t('common:cancel', { defaultValue: 'Vazgeç' })}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AppModal>

          {/* Manage Quick Actions Modal */}
          <AppModal visible={manageQaVisible} onRequestClose={() => setManageQaVisible(false)}>
            <View style={{ gap: spacing.md }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.xs }}>{t('common:edit_quick_actions', { defaultValue: 'Hızlı işlemleri düzenle' })}</Text>
              {customQuickActions.length === 0 ? (
                <Text style={{ color: colors.muted }}>{t('common:no_items', { defaultValue: 'Öğe yok' })}</Text>
              ) : (
                customQuickActions.map((qa, index) => (
                  <View key={qa.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <View style={[styles.quickIconWrap, { backgroundColor: `${colors.primary}15` }]}> 
                        <Ionicons name={qa.icon as any} size={18} color={colors.primary} />
                      </View>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{qa.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <TouchableOpacity onPress={() => moveCustomQuick(index, -1)} disabled={index === 0} accessibilityRole="button" accessibilityLabel={t('common:move_up', { defaultValue: 'Yukarı taşı' }) as string}>
                        <Ionicons name="chevron-up" size={18} color={index === 0 ? colors.muted : colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveCustomQuick(index, 1)} disabled={index === customQuickActions.length - 1} accessibilityRole="button" accessibilityLabel={t('common:move_down', { defaultValue: 'Aşağı taşı' }) as string}>
                        <Ionicons name="chevron-down" size={18} color={index === customQuickActions.length - 1 ? colors.muted : colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRemoveCustomQuick(qa.key)} accessibilityRole="button" accessibilityLabel={t('common:remove', { defaultValue: 'Kaldır' }) as string}>
                        <Ionicons name="trash-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
                <TouchableOpacity onPress={() => setManageQaVisible(false)}>
                  <Text style={{ color: colors.muted, fontWeight: '600' }}>{t('common:done', { defaultValue: 'Bitti' })}</Text>
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
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
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
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  quickItem: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }),
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
    paddingHorizontal: spacing.sm,
  },
  item: {
    marginVertical: spacing.sm,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    padding: spacing.md,
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 6px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }),
    borderWidth: 0,
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
    marginTop: spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 16,
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
  addOnCard: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  }
});


