import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet, Platform, useWindowDimensions, ScrollView, TextInput, Animated, StatusBar, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../core/constants/spacing';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../../core/config/permissions';
import { Role } from '../../core/config/appConstants';
import { useTheme } from '../../core/contexts/ThemeContext';
import { usePermissions } from '../../core/hooks/usePermissions';
import { useNavigation } from '@react-navigation/native';
import ConfirmDialog from './ConfirmDialog';
import AppModal from './Modal';
import storage from '../services/storageService';
import { MODULE_CONFIGS, ALL_QUICK_ACTIONS, getQuickActionFallback, getModuleConfigByRoute } from '../../core/config/moduleConfig';
import { allRoutes } from '../../core/navigation/routes';
import { useAppStore } from '../../store/useAppStore';
import { transformMenuText, getCompactFontSize } from '../../core/utils/menuTextUtils';

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
  activeRouteName?: string | null;
};

export default function FullScreenMenu({ visible, onClose, onNavigate, availableRoutes, role = 'guest', activeRouteName }: Props) {
  const navigation = useNavigation<any>();
  const permissions = usePermissions(role);
  const menuTextCase = useAppStore((s) => s.menuTextCase);
  const language = useAppStore((s) => s.language);
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
  
  // Get active module from current route
  const activeModule = useMemo(() => {
    if (!activeRouteName) return null;
    const routeConfig = allRoutes.find(r => r.name === activeRouteName);
    if (!routeConfig) return null;
    return getModuleConfigByRoute(activeRouteName) || 
           MODULE_CONFIGS.find(m => m.routeName === routeConfig.module || m.key === routeConfig.module) || null;
  }, [activeRouteName]);

  const processedItems = useMemo(() => {
    const mapped = MODULE_CONFIGS.map((module) => {
      // Use real permission check with usePermissions hook (checks package permissions)
      const hasAccess = !module.requiredPermission || permissions.can(module.requiredPermission);
      const isAvailable = availableRoutes?.includes(module.routeName) ?? false;
      
      // Get label from translation
      const label = t(`${module.translationNamespace}:${module.translationKey}`, {
        defaultValue: module.key,
      });
      
      // Transform label based on menu text case setting
      const transformedLabel = transformMenuText(label, menuTextCase, language);
      
      return {
        key: module.key,
        label: transformedLabel,
        icon: module.icon,
        routeName: module.routeName,
        requiredPermission: module.requiredPermission,
        isLocked: !hasAccess,
        isAvailable,
      };
    });
    
    // Combine module items
    const allItems = [...mapped];
    
    // Sadece navigator'da mevcut olan route'ları göster
    const available = allItems.filter(it => it.isAvailable);
    
    // Owner: Tüm öğeleri göster (kilitli olanlar dahil) - kilitli olanlar kilit ikonuyla gösterilir
    // Staff: Sadece erişim izni olanları göster
    // Admin: Tüm öğeleri göster (hepsi açık)
    const filtered = role === 'staff' 
      ? available.filter(it => !it.isLocked)
      : available;
    
    // If we have an active module, prioritize it by putting it first
    if (activeModule) {
      const activeModuleItem = filtered.find(item => item.routeName === activeModule.routeName || item.key === activeModule.key);
      const others = filtered.filter(item => item.routeName !== activeModule.routeName && item.key !== activeModule.key);
      if (activeModuleItem) {
        return [activeModuleItem, ...others];
      }
    }
    
    return filtered;
  }, [t, role, availableRoutes, activeModule, permissions, menuTextCase, language]);

  const quickActionLabelByRoute = useMemo(() => {
    const labels: Record<string, string> = {};
    ALL_QUICK_ACTIONS.forEach((qa) => {
      const label = t(`${qa.translationNamespace}:${qa.translationKey}`, {
        defaultValue: qa.routeName,
      });
      labels[qa.routeName] = transformMenuText(label, menuTextCase, language);
    });
    return labels;
  }, [t, menuTextCase, language]);

  // Note: processedQuickActions is not used - we only show custom quick actions
  // ALL_QUICK_ACTIONS is only used for the "Add Quick Action" modal

  const processedCustomQuickActions = useMemo(() => {
    return customQuickActions
      .map((qa) => {
        // Use real permission check with usePermissions hook (checks package permissions)
        const hasAccess = !qa.requiredPermission || permissions.can(qa.requiredPermission);
        const routeName = (qa as any).routeName;
        // Check if the route or its fallback is available
        // If availableRoutes is not provided or empty, assume all routes are available
        const routesAvailable = !availableRoutes || availableRoutes.length === 0;
        const isAvailable = routesAvailable ? true : (availableRoutes?.includes(routeName) ?? false);
        const fallback = getQuickActionFallback(routeName);
        const fallbackAvailable = routesAvailable ? false : (fallback && (availableRoutes?.includes(fallback) ?? false));
        const label = quickActionLabelByRoute[routeName] ?? qa.label;
        return { ...qa, label, isLocked: !hasAccess, isAvailable: isAvailable || fallbackAvailable } as any;
      })
            .filter((qa: any) => !qa.isLocked && (qa.isAvailable || !availableRoutes || availableRoutes.length === 0));                                               
  }, [customQuickActions, role, quickActionLabelByRoute, availableRoutes, permissions]);

    const canAddQuick = useMemo(() => {
    // Check if user has permission to create any quick action (checks package permissions)
    return ALL_QUICK_ACTIONS.some((qa) => permissions.can(qa.requiredPermission));                                                                          
  }, [permissions]);

  // Persist custom quick actions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await storage.get<string>('customQuickActions');
        if (mounted && saved != null) {
          const parsed = JSON.parse(saved) as MenuItem[];
          // If saved array is empty or too short, add defaults
          if (parsed.length === 0 || (parsed.length < 3 && mounted)) {
            // Build defaults
            const defaults: MenuItem[] = [];
            const commonRoutes = ['StockCreate', 'SalesCreate', 'PurchaseCreate', 'CustomerCreate', 'ExpenseCreate', 'SupplierCreate'];
            commonRoutes.forEach(route => {
              const qa = ALL_QUICK_ACTIONS.find(a => a.routeName === route && permissions.can(a.requiredPermission));
              if (qa && defaults.length < QUICK_MAX) {
                // Check if this quick action already exists in parsed
                const exists = parsed.find(p => p.key === qa.key);
                if (!exists) {
                  defaults.push({
                    key: qa.key,
                    label: quickActionLabelByRoute[qa.routeName] || qa.routeName,
                    icon: qa.icon,
                    routeName: qa.routeName,
                    requiredPermission: qa.requiredPermission,
                  });
                }
              }
            });
            // Merge with existing ones, up to QUICK_MAX
            const merged = [...parsed, ...defaults].slice(0, QUICK_MAX);
            if (mounted && merged.length > parsed.length) {
              setCustomQuickActions(merged);
            } else if (mounted && parsed.length > 0) {
              setCustomQuickActions(parsed);
            }
          } else if (mounted && parsed.length > 0) {
            setCustomQuickActions(parsed);
          }
        } else {
          // First time setup: add default quick actions for common items
          const defaults: MenuItem[] = [];
          // Add most common quick actions: stock, sales, purchases, customers, expenses, suppliers
          const commonRoutes = ['StockCreate', 'SalesCreate', 'PurchaseCreate', 'CustomerCreate', 'ExpenseCreate', 'SupplierCreate'];
          commonRoutes.forEach(route => {
            const qa = ALL_QUICK_ACTIONS.find(a => a.routeName === route && permissions.can(a.requiredPermission));
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
  }, [role, quickActionLabelByRoute, QUICK_MAX, permissions]);

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
        
        // Use real permission check with usePermissions hook (checks package permissions)
        const hasAccess = !route.requiredPermission || permissions.can(route.requiredPermission);
        // Transform label based on menu text case setting
        const transformedLabel = transformMenuText(label, menuTextCase, language);
        searchItems.push({
          key: `route-${route.name}`,
          label: transformedLabel,
          icon,
          routeName: route.name,
          requiredPermission: route.requiredPermission,
          isLocked: !hasAccess && role === 'owner',
          isAvailable: true,
        });
      });
    
    return searchItems;
  }, [processedItems, availableRoutes, role, t, permissions, menuTextCase, language]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return processedItems.map(item => ({ ...item, moduleLabel: null }));
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
        
        // Boost active module items significantly
        if (activeModule) {
          const routeConfig = allRoutes.find(r => r.name === item.routeName);
          if (routeConfig) {
            const itemModule = getModuleConfigByRoute(item.routeName) || 
                              MODULE_CONFIGS.find(m => m.routeName === routeConfig.module || m.key === routeConfig.module);
            if (itemModule && itemModule.key === activeModule.key) {
              score += 300; // Significant boost for active module
            }
          }
        }
        
        // Boost quick actions
        if (item.key.startsWith('qa-')) score += 50;
        
        return { item, score };
      })
      .sort((a, b) => b.score - a.score);
    
    // Remove duplicates by label (keep the one with highest score)
    const uniqueByLabel = new Map<string, typeof scoredItems[0]>();
    scoredItems.forEach(({ item, score }) => {
      const labelKey = item.label.toLowerCase();
      const existing = uniqueByLabel.get(labelKey);
      if (!existing || existing.score < score) {
        uniqueByLabel.set(labelKey, { item, score });
      }
    });
    
    // Convert back to items array, sorted by score
    const uniqueItems = Array.from(uniqueByLabel.values())
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => {
        // Get module label for each item
        const routeConfig = allRoutes.find(r => r.name === item.routeName);
        let moduleLabel: string | null = null;
        
        if (routeConfig) {
          const itemModule = getModuleConfigByRoute(item.routeName) || 
                            MODULE_CONFIGS.find(m => m.routeName === routeConfig.module || m.key === routeConfig.module);
          if (itemModule) {
            const label = t(`${itemModule.translationNamespace}:${itemModule.translationKey}`, {
              defaultValue: itemModule.key,
            });
            moduleLabel = transformMenuText(label, menuTextCase, language);
          }
        }
        
        return { ...item, moduleLabel };
      })
      .slice(0, 20); // Limit to top 20 results
    
    // If we have an active module, prioritize its items by moving them to the front
    if (activeModule && uniqueItems.length > 0) {
      const activeModuleItems: typeof uniqueItems = [];
      const otherItems: typeof uniqueItems = [];
      
      uniqueItems.forEach(item => {
        const routeConfig = allRoutes.find(r => r.name === item.routeName);
        if (routeConfig) {
          const itemModule = getModuleConfigByRoute(item.routeName) || 
                            MODULE_CONFIGS.find(m => m.routeName === routeConfig.module || m.key === routeConfig.module);
          if (itemModule && itemModule.key === activeModule.key) {
            activeModuleItems.push(item);
          } else {
            otherItems.push(item);
          }
        } else {
          otherItems.push(item);
        }
      });
      
      return [...activeModuleItems, ...otherItems];
    }
    
    return uniqueItems;
  }, [processedItems, searchTerm, allSearchItems, role, activeModule, t]);

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
                {transformMenuText(t('common:menu', { defaultValue: 'Menü' }), menuTextCase, language)}
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
                      {transformMenuText(t('common:quick_actions', { defaultValue: 'Hızlı İşlemler' }), menuTextCase, language)}
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
                        style={styles.quickItem}
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
                        <Text 
                          style={[
                            styles.quickLabel, 
                            { 
                              color: colors.text, 
                              fontSize: getCompactFontSize(width > 640 ? 11 : 10, menuTextCase)
                            }
                          ]} 
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.7}
                        >
                          {transformMenuText(qa.label, menuTextCase, language)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Main Menu Items */}
              <View>
                {activeModule && processedItems.length > 0 && (
                  <View style={styles.activeModuleHeader}>
                    <View style={[styles.activeModuleBadge, { backgroundColor: `${colors.primary}20` }]}>
                      <Ionicons name="location" size={16} color={colors.primary} />
                      <Text style={[styles.activeModuleText, { color: colors.primary }]}>
                        {transformMenuText(t('common:current_module', { defaultValue: 'Mevcut Modül' }), menuTextCase, language)}: {activeModule ? transformMenuText(t(`${activeModule.translationNamespace}:${activeModule.translationKey}`, { defaultValue: activeModule.key }), menuTextCase, language) : ''}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.itemsGrid}>
                  {filteredItems.map((item) => {
                    // Calculate item width as percentage - gap will handle spacing
                    const itemWidthPercent = 100 / numColumns;
                    
                    // Check if item belongs to active module
                    const routeConfig = allRoutes.find(r => r.name === item.routeName);
                    const itemModule = routeConfig 
                      ? (getModuleConfigByRoute(item.routeName) || 
                         MODULE_CONFIGS.find(m => m.routeName === routeConfig.module || m.key === routeConfig.module))
                      : null;
                    const isActiveModule = activeModule && itemModule && itemModule.key === activeModule.key;
                    const hasSearchTerm = !!searchTerm.trim();
                    const moduleLabel = (item as any).moduleLabel;
                    
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.item,
                          { 
                            backgroundColor: isActiveModule ? `${colors.primary}10` : colors.surface,
                            width: `${itemWidthPercent}%`,
                            borderWidth: isActiveModule ? 2 : 1,
                            borderColor: isActiveModule 
                              ? colors.primary 
                              : (activeTheme === 'dark' ? colors.border : `${colors.border}40`),
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
                          // If locked, navigate to Packages screen to upgrade
                          onClose();
                          navigation.navigate('Packages');
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
                        <Ionicons 
                          name={item.icon as any} 
                          size={itemIconSize} 
                          color={item.isLocked ? colors.muted : colors.primary} 
                        />
                        {item.isLocked && (
                          <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}> 
                            <Ionicons name="lock-closed" size={12} color={colors.surface} />
                          </View>
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.itemLabel, 
                          { 
                            color: colors.text, 
                            fontSize: getCompactFontSize(itemLabelSize, menuTextCase)
                          }
                        ]} 
                        numberOfLines={2}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.7}
                      >
                        {transformMenuText(item.label, menuTextCase, language)}
                      </Text>
                      {hasSearchTerm && moduleLabel && (
                        <Text style={[styles.moduleSubLabel, { color: colors.muted }]} numberOfLines={1}>
                          {transformMenuText(moduleLabel, menuTextCase, language)}
                        </Text>
                      )}
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
                .filter(qa => permissions.can(qa.requiredPermission))
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
                      <Text style={{ color: colors.text, fontWeight: '600' }}>
                        {transformMenuText(menuItem.label, menuTextCase, language)}
                      </Text>
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
  activeModuleHeader: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  activeModuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeModuleText: {
    fontSize: 13,
    fontWeight: '600',
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    overflow: 'hidden',
    gap: spacing.xs,
  },
  quickItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    minWidth: 0,
    flex: 1,
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
    maxWidth: '100%',
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
  moduleSubLabel: {
    fontSize: 9,
    fontWeight: '400',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 11,
    opacity: 0.6,
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


