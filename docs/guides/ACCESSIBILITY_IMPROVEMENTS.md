# Accessibility (A11y) İyileştirmeleri Kılavuzu

**Oluşturulma Tarihi:** 2025-02-18

Bu dokümantasyon, projede yapılan accessibility iyileştirmelerini ve kullanımını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Accessibility Utilities](#accessibility-utilities)
3. [Color Contrast](#color-contrast)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Focus Management](#focus-management)
6. [Kullanım Örnekleri](#kullanım-örnekleri)
7. [Best Practices](#best-practices)

---

## 🎯 Genel Bakış

Accessibility iyileştirmeleri şunları içerir:

- ✅ **Accessibility Utilities** - Accessibility props helpers
- ✅ **Color Contrast Checking** - WCAG standartlarına uygunluk kontrolü
- ✅ **Keyboard Navigation** - Web için keyboard navigation desteği
- ✅ **Focus Management** - Modal ve form'larda focus yönetimi
- ✅ **useAccessibility Hook** - Tüm accessibility özelliklerini içeren hook
- ✅ **useFocusManagement Hook** - Focus yönetimi için hook

---

## 🛠️ Accessibility Utilities

### Genel Bakış

Accessibility utilities, accessibility props oluşturmayı kolaylaştırır.

**Dosya:** `src/core/utils/accessibility.ts`

### Özellikler

- Accessibility props oluşturma
- Translated accessibility labels
- Common accessibility roles
- Keyboard navigation support

### Kullanım

#### Create Accessibility Props

```tsx
import { createAccessibilityProps } from '@/core/utils/accessibility';

const a11yProps = createAccessibilityProps('Save button', 'Saves the form', 'button', {
  disabled: false,
});

<TouchableOpacity {...a11yProps}>Save</TouchableOpacity>;
```

#### Create Translated Accessibility Props

```tsx
import { createTranslatedAccessibilityProps } from '@/core/utils/accessibility';

const a11yProps = createTranslatedAccessibilityProps('common:save', 'common:save_hint', 'button');

<TouchableOpacity {...a11yProps}>Save</TouchableOpacity>;
```

#### Use Accessibility Roles

```tsx
import { AccessibilityRoles } from '@/core/utils/accessibility';

<TouchableOpacity accessibilityRole={AccessibilityRoles.button}>Click me</TouchableOpacity>;
```

---

## 🎨 Color Contrast

### Genel Bakış

Color contrast utilities, WCAG standartlarına uygunluk kontrolü sağlar.

### Özellikler

- Contrast ratio calculation
- WCAG level checking (AA, AAA)
- Accessible color suggestions

### Kullanım

#### Check Contrast Ratio

```tsx
import { getContrastRatio, ContrastLevel } from '@/core/utils/accessibility';

const ratio = getContrastRatio('#000000', '#FFFFFF');
// 21 (maximum contrast)
```

#### Check WCAG Compliance

```tsx
import { meetsContrastRatio, ContrastLevel } from '@/core/utils/accessibility';

const meetsAA = meetsContrastRatio('#000000', '#FFFFFF', ContrastLevel.AA);
// true

const meetsAAForLargeText = meetsContrastRatio(
  '#666666',
  '#FFFFFF',
  ContrastLevel.AA,
  true // isLargeText
);
```

#### Get Accessible Color

```tsx
import { getAccessibleColor, ContrastLevel } from '@/core/utils/accessibility';

const accessibleColor = getAccessibleColor(
  '#CCCCCC', // Too light
  '#FFFFFF',
  ContrastLevel.AA
);
// Returns darker color that meets contrast requirements
```

### WCAG Levels

- **AA**: Minimum contrast (4.5:1 for normal text, 3:1 for large text)
- **AAA**: Enhanced contrast (7:1 for normal text, 4.5:1 for large text)

---

## ⌨️ Keyboard Navigation

### Genel Bakış

Keyboard navigation, web platformu için keyboard desteği sağlar.

### Kullanım

#### Create Keyboard Navigation Props

```tsx
import { createKeyboardNavigationProps } from '@/core/utils/accessibility';

const keyboardProps = createKeyboardNavigationProps(
  () => handlePress(),
  0 // tabIndex
);

<TouchableOpacity {...keyboardProps} onPress={handlePress}>
  Click me
</TouchableOpacity>;
```

---

## 🎯 Focus Management

### Genel Bakış

Focus management, modal ve form'larda focus yönetimi sağlar.

**Dosya:** `src/core/hooks/useFocusManagement.ts`

### Özellikler

- Focus trap for modals
- Focus restoration
- Focus order management

### Kullanım

#### Basic Focus Management

```tsx
import { useFocusManagement } from '@/core/hooks/useFocusManagement';
import { useRef } from 'react';

function MyModal() {
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  const { setFocus, focusNext, focusPrevious } = useFocusManagement({
    trapFocus: true,
    initialFocusRef: inputRef,
    focusOrder: [inputRef, buttonRef],
  });

  return (
    <View>
      <TextInput ref={inputRef} />
      <Button ref={buttonRef} onPress={handlePress} />
    </View>
  );
}
```

#### Focus Trap for Modal

```tsx
import { useFocusManagement } from '@/core/hooks/useFocusManagement';

function Modal({ visible, onClose }) {
  const firstRef = useRef(null);
  const lastRef = useRef(null);

  const { setFocus } = useFocusManagement({
    trapFocus: true,
    restoreFocus: true,
    focusOrder: [firstRef, lastRef],
  });

  return (
    <Modal visible={visible}>
      <View>
        <Button ref={firstRef} title="First" />
        <Button ref={lastRef} title="Last" />
      </View>
    </Modal>
  );
}
```

---

## 💡 Kullanım Örnekleri

### useAccessibility Hook

```tsx
import { useAccessibility } from '@/core/hooks/useAccessibility';

function MyComponent() {
  const { createProps, checkContrast, checkThemeContrast } = useAccessibility();

  const a11yProps = createProps('Save button', 'Saves the form', 'button');
  const isAccessible = checkContrast('#000000', '#FFFFFF');
  const themeContrast = checkThemeContrast();

  return <TouchableOpacity {...a11yProps}>Save</TouchableOpacity>;
}
```

### Accessible Button

```tsx
import { useAccessibility } from '@/core/hooks/useAccessibility';

function AccessibleButton({ label, onPress }) {
  const { createTranslatedProps, roles } = useAccessibility();

  const a11yProps = createTranslatedProps('common:save', 'common:save_hint', roles.button);

  return (
    <TouchableOpacity {...a11yProps} onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}
```

### Contrast Check in Theme

```tsx
import { useAccessibility } from '@/core/hooks/useAccessibility';

function ThemeValidator() {
  const { checkThemeContrast } = useAccessibility();

  const contrast = checkThemeContrast(ContrastLevel.AA);

  if (!contrast.text) {
    console.warn('Text color does not meet contrast requirements');
  }

  return null;
}
```

---

## ✅ Best Practices

### 1. Always Provide Accessibility Labels

```tsx
// ✅ Good
<TouchableOpacity
  accessibilityLabel="Save button"
  accessibilityHint="Saves the form"
  accessibilityRole="button"
>
  Save
</TouchableOpacity>

// ❌ Bad
<TouchableOpacity>
  Save
</TouchableOpacity>
```

### 2. Use Translated Labels

```tsx
// ✅ Good
const { createTranslatedProps } = useAccessibility();
const a11yProps = createTranslatedProps('common:save', 'common:save_hint');

// ❌ Bad
<TouchableOpacity accessibilityLabel="Save">
```

### 3. Check Color Contrast

```tsx
// ✅ Good
const isAccessible = checkContrast(textColor, backgroundColor, ContrastLevel.AA);
if (!isAccessible) {
  // Use accessible color
}

// ❌ Bad
// No contrast check
```

### 4. Implement Focus Management for Modals

```tsx
// ✅ Good
const { setFocus, trapFocus } = useFocusManagement({
  trapFocus: true,
  focusOrder: [firstRef, lastRef],
});

// ❌ Bad
// No focus management
```

### 5. Test with Screen Readers

- Test with VoiceOver (iOS)
- Test with TalkBack (Android)
- Test keyboard navigation (Web)

---

## 📚 İlgili Dokümantasyon

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Son Güncelleme:** 2025-02-18
