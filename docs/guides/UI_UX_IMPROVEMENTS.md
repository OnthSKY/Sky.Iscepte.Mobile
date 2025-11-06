# UI/UX İyileştirmeleri Kılavuzu

**Oluşturulma Tarihi:** 2025-02-18

Bu dokümantasyon, projede yapılan UI/UX iyileştirmelerini ve kullanımını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Loading States](#loading-states)
3. [Empty States](#empty-states)
4. [Animations](#animations)
5. [Haptic Feedback](#haptic-feedback)
6. [Kullanım Örnekleri](#kullanım-örnekleri)
7. [Best Practices](#best-practices)

---

## 🎯 Genel Bakış

UI/UX iyileştirmeleri şunları içerir:

- ✅ **Loading States** - Skeleton loading screens
- ✅ **Empty States** - Empty state components
- ✅ **Animations** - Animation utilities (fade, slide, scale, spring)
- ✅ **Haptic Feedback** - Haptic feedback for user interactions

---

## ⏳ Loading States

### LoadingSkeleton Component

Skeleton loading animasyonları gösterir.

**Dosya:** `src/shared/components/LoadingSkeleton.tsx`

### Özellikler

- Skeleton loading animation
- Customizable shapes (text, circle, rectangle)
- Configurable size and spacing
- Multiple skeleton items

### Kullanım

#### Text Skeleton

```tsx
import LoadingSkeleton from '@/shared/components/LoadingSkeleton';

<LoadingSkeleton shape="text" width="80%" />;
```

#### Circle Skeleton

```tsx
<LoadingSkeleton shape="circle" width={40} />
```

#### Rectangle Skeleton

```tsx
<LoadingSkeleton shape="rectangle" width="100%" height={100} />
```

#### Multiple Skeletons

```tsx
<LoadingSkeleton shape="text" count={3} spacing={12} />
```

### Örnek: List Loading

```tsx
function ProductList({ loading }) {
  if (loading) {
    return (
      <View>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <LoadingSkeleton shape="rectangle" height={100} />
            <LoadingSkeleton shape="text" width="60%" style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
    );
  }

  return <ProductListContent />;
}
```

---

## 📭 Empty States

### EmptyState Component

Veri olmadığında empty state gösterir.

**Dosya:** `src/shared/components/EmptyState.tsx`

### Özellikler

- Customizable icon
- Title and description
- Optional action button
- i18n support
- Accessible

### Kullanım

#### Basic Empty State

```tsx
import EmptyState from '@/shared/components/EmptyState';

<EmptyState
  icon="document-outline"
  title="No items found"
  description="Try adjusting your filters"
/>;
```

#### With Action Button

```tsx
<EmptyState
  icon="search-outline"
  title="No results"
  description="No items match your search criteria"
  actionLabel="Clear filters"
  onAction={() => clearFilters()}
/>
```

#### With Translation Keys

```tsx
<EmptyState
  icon="document-outline"
  translationKeys={{
    title: 'common:no_items',
    description: 'common:no_items_description',
    action: 'common:clear_filters',
  }}
  onAction={() => clearFilters()}
/>
```

### Örnek: List Empty State

```tsx
function ProductList({ products, loading }) {
  if (loading) {
    return <LoadingSkeleton count={5} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon="cube-outline"
        title="No products"
        description="Add your first product to get started"
        actionLabel="Add Product"
        onAction={() => navigate('ProductCreate')}
      />
    );
  }

  return <ProductListContent products={products} />;
}
```

---

## 🎬 Animations

### Animation Utilities

Animasyon yardımcı fonksiyonları.

**Dosya:** `src/core/utils/animations.ts`

### Özellikler

- Fade animations
- Slide animations
- Scale animations
- Spring animations
- Bounce animations
- Shake animations
- Layout animations

### Kullanım

#### Fade Animation

```tsx
import { fadeIn, fadeOut } from '@/core/utils/animations';
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

function FadeComponent({ visible }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeIn(opacity).start();
    } else {
      fadeOut(opacity).start();
    }
  }, [visible]);

  return <Animated.View style={{ opacity }}>Content</Animated.View>;
}
```

#### Slide Animation

```tsx
import { slideInUp, slideOutDown } from '@/core/utils/animations';

function SlideComponent({ visible }) {
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      slideInUp(translateY).start();
    } else {
      slideOutDown(translateY).start();
    }
  }, [visible]);

  return <Animated.View style={{ transform: [{ translateY }] }}>Content</Animated.View>;
}
```

#### Scale Animation

```tsx
import { scale } from '@/core/utils/animations';

function ScaleComponent({ visible }) {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale(scaleValue, 0, 1).start();
    }
  }, [visible]);

  return <Animated.View style={{ transform: [{ scale: scaleValue }] }}>Content</Animated.View>;
}
```

#### Spring Animation

```tsx
import { spring } from '@/core/utils/animations';

function SpringComponent() {
  const value = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    spring(value, 1, { tension: 50, friction: 7 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: value }] }}>
      <Button onPress={handlePress}>Press me</Button>
    </Animated.View>
  );
}
```

#### Layout Animation

```tsx
import { triggerLayoutAnimation } from '@/core/utils/animations';

function ListComponent({ items }) {
  const handleAdd = () => {
    triggerLayoutAnimation('easeInEaseOut');
    addItem();
  };

  return (
    <View>
      {items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </View>
  );
}
```

---

## 📳 Haptic Feedback

### Haptic Feedback Utilities

Kullanıcı etkileşimleri için haptic feedback.

**Dosya:** `src/core/utils/hapticFeedback.ts`

### Özellikler

- Impact feedback (light, medium, heavy)
- Notification feedback (success, warning, error)
- Selection feedback

### Kullanım

#### Basic Haptic Feedback

```tsx
import { triggerHaptic } from '@/core/utils/hapticFeedback';

<TouchableOpacity
  onPress={() => {
    triggerHaptic('medium');
    handlePress();
  }}
>
  Press me
</TouchableOpacity>;
```

#### Button Haptic

```tsx
import { triggerButtonHaptic } from '@/core/utils/hapticFeedback';

<TouchableOpacity
  onPress={() => {
    triggerButtonHaptic();
    handlePress();
  }}
>
  Save
</TouchableOpacity>;
```

#### Success Haptic

```tsx
import { triggerSuccessHaptic } from '@/core/utils/hapticFeedback';

const handleSuccess = () => {
  triggerSuccessHaptic();
  showSuccessMessage();
};
```

#### Error Haptic

```tsx
import { triggerErrorHaptic } from '@/core/utils/hapticFeedback';

const handleError = () => {
  triggerErrorHaptic();
  showErrorMessage();
};
```

#### Selection Haptic

```tsx
import { triggerSelectionHaptic } from '@/core/utils/hapticFeedback';

<Picker
  onValueChange={(value) => {
    triggerSelectionHaptic();
    setValue(value);
  }}
>
  Options
</Picker>;
```

---

## 💡 Kullanım Örnekleri

### Complete List Component

```tsx
import LoadingSkeleton from '@/shared/components/LoadingSkeleton';
import EmptyState from '@/shared/components/EmptyState';
import { fadeIn } from '@/core/utils/animations';
import { triggerButtonHaptic } from '@/core/utils/hapticFeedback';

function ProductList() {
  const { data, loading, error } = useProductsQuery();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (data) {
      fadeIn(opacity).start();
    }
  }, [data]);

  if (loading) {
    return <LoadingSkeleton count={5} />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Error loading products"
        actionLabel="Retry"
        onAction={() => {
          triggerErrorHaptic();
          refetch();
        }}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="cube-outline"
        title="No products"
        actionLabel="Add Product"
        onAction={() => {
          triggerButtonHaptic();
          navigate('ProductCreate');
        }}
      />
    );
  }

  return (
    <Animated.View style={{ opacity }}>
      {data.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </Animated.View>
  );
}
```

---

## ✅ Best Practices

### 1. Always Show Loading States

```tsx
// ✅ Good
if (loading) return <LoadingSkeleton />;

// ❌ Bad
if (loading) return <ActivityIndicator />; // Less informative
```

### 2. Provide Empty States

```tsx
// ✅ Good
if (items.length === 0) {
  return <EmptyState title="No items" actionLabel="Add Item" onAction={handleAdd} />;
}

// ❌ Bad
if (items.length === 0) {
  return <Text>No items</Text>; // Not helpful
}
```

### 3. Use Appropriate Animations

```tsx
// ✅ Good
fadeIn(opacity).start(); // For appearing content
slideInUp(translateY).start(); // For modals

// ❌ Bad
// No animation or inappropriate animation
```

### 4. Provide Haptic Feedback

```tsx
// ✅ Good
<TouchableOpacity onPress={() => {
  triggerButtonHaptic();
  handlePress();
}}>

// ❌ Bad
<TouchableOpacity onPress={handlePress}>
```

### 5. Combine Loading and Empty States

```tsx
// ✅ Good
if (loading) return <LoadingSkeleton />;
if (empty) return <EmptyState />;
return <Content />;

// ❌ Bad
// Missing states
```

---

## 📚 İlgili Dokümantasyon

- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Skeleton Loading Best Practices](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45e571f)

---

**Son Güncelleme:** 2025-02-18
