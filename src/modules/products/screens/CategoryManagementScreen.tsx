/**
 * CategoryManagementScreen - Screen for managing product categories
 * 
 * Displays list of all categories, stats, and allows adding new categories
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { Product } from '../services/productService';
import AddCategoryModal from '../components/AddCategoryModal';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingState from '../../../shared/components/LoadingState';

export default function CategoryManagementScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('stock');
  const { colors } = useTheme();
  const { data: productsData, isLoading } = useProductsQuery();
  const [categories, setCategories] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Extract unique categories from products
  useEffect(() => {
    if (productsData?.items) {
      const uniqueCategories = Array.from(
        new Set(
          productsData.items
            .map((p) => p.category)
            .filter((cat): cat is string => !!cat && cat.trim() !== '')
        )
      ).sort();
      setCategories(uniqueCategories);
    }
  }, [productsData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalProducts = productsData?.items?.length || 0;
    const productsWithCategory = productsData?.items?.filter(p => p.category)?.length || 0;
    const uncategorizedCount = totalProducts - productsWithCategory;

    // Count products per category
    const categoryCounts: Record<string, number> = {};
    if (productsData?.items) {
      productsData.items.forEach((product: Product) => {
        if (product.category) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });
    }

    return {
      totalCategories,
      totalProducts,
      productsWithCategory,
      uncategorizedCount,
      categoryCounts,
    };
  }, [categories, productsData]);

  const handleBackPress = () => {
    navigation.navigate('StockDashboard');
  };

  const handleCategoryAdded = (categoryName: string) => {
    setCategories((prev) => {
      if (!prev.includes(categoryName)) {
        return [...prev, categoryName].sort();
      }
      return prev;
    });
    setAddModalOpen(false);
  };

  const handleDeleteCategory = (categoryName: string) => {
    // TODO: Implement category deletion
    // For now, we just show an alert
    // In a real implementation, this would update all products with this category
    alert(t('category_delete_not_implemented', { 
      defaultValue: 'Kategori silme özelliği yakında eklenecek. Bu kategorideki ürünlerin kategorisini kaldırmanız gerekiyor.' 
    }));
  };

  if (isLoading) {
    return (
      <ScreenLayout showBackButton onBackPress={handleBackPress} title={t('category_management', { defaultValue: 'Kategori Yönetimi' })}>
        <LoadingState />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout 
      showBackButton 
      onBackPress={handleBackPress}
      title={t('category_management', { defaultValue: 'Kategori Yönetimi' })}
      subtitle={t('category_management_desc', { defaultValue: 'Ürün kategorilerini görüntüleyin, ekleyin ve yönetin.' })}
      headerRight={
        <TouchableOpacity
          onPress={() => setAddModalOpen(true)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            {t('add_category', { defaultValue: 'Kategori Ekle' })}
          </Text>
        </TouchableOpacity>
      }
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="apps-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalCategories}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {t('total_categories', { defaultValue: 'Toplam Kategori' })}
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="cube-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.productsWithCategory}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {t('products_with_category', { defaultValue: 'Kategorili Ürün' })}
              </Text>
            </View>
          </Card>

          {stats.uncategorizedCount > 0 && (
            <Card style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="warning-outline" size={24} color="#F59E0B" />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.uncategorizedCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  {t('uncategorized_products', { defaultValue: 'Kategorisiz Ürün' })}
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Categories List */}
        {categories.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="folder-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {t('no_categories', { defaultValue: 'Henüz kategori eklenmemiş' })}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              {t('no_categories_desc', { defaultValue: 'Yukarıdaki butona tıklayarak kategori ekleyebilirsiniz.' })}
            </Text>
          </Card>
        ) : (
          <View style={styles.categoriesList}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('categories', { defaultValue: 'Kategoriler' })}
            </Text>
            {categories.map((category) => (
              <Card key={category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="apps-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.categoryDetails}>
                      <Text style={[styles.categoryName, { color: colors.text }]}>
                        {category}
                      </Text>
                      <Text style={[styles.categoryCount, { color: colors.muted }]}>
                        {stats.categoryCounts[category] || 0} {t('products', { defaultValue: 'ürün' })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteCategory(category)}
                    style={[styles.deleteButton, { backgroundColor: '#EF444420' }]}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleCategoryAdded}
        existingCategories={categories}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  categoriesList: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  categoryCard: {
    padding: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  categoryCount: {
    fontSize: 14,
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

