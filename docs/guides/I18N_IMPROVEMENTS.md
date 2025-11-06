# Internationalization (i18n) İyileştirmeleri Kılavuzu

**Oluşturulma Tarihi:** 2025-02-18

Bu dokümantasyon, projede yapılan i18n iyileştirmelerini ve kullanımını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Missing Translations Checker](#missing-translations-checker)
3. [Date/Time Localization](#datetime-localization)
4. [Pluralization](#pluralization)
5. [RTL Support](#rtl-support)
6. [Kullanım Örnekleri](#kullanım-örnekleri)
7. [Best Practices](#best-practices)

---

## 🎯 Genel Bakış

i18n iyileştirmeleri şunları içerir:

- ✅ **Missing Translations Checker** - Eksik çevirileri bulma mekanizması
- ✅ **Date/Time Localization** - Locale-aware tarih/saat formatları
- ✅ **Pluralization Rules** - Dil bazlı pluralization kuralları
- ✅ **RTL Support** - Right-to-left dil desteği (Arapça, İbranice, Farsça)
- ✅ **Enhanced useLocalization Hook** - Tüm i18n özelliklerini içeren hook

---

## 🔍 Missing Translations Checker

### Genel Bakış

Missing translations checker, eksik çevirileri bulmak için kullanılır.

**Dosya:** `src/core/utils/missingTranslations.ts`

### Özellikler

- Eksik translation key'lerini bulur
- Namespace bazlı kontrol
- Coverage raporu
- Detaylı rapor oluşturma

### Kullanım

#### Check Missing Translations

```tsx
import { checkMissingTranslations } from '@/core/utils/missingTranslations';

const result = checkMissingTranslations('en', ['tr']);

console.log(`Total keys: ${result.totalKeys}`);
console.log(`Missing keys: ${result.missingCount}`);
console.log(`Coverage: ${result.coverage.toFixed(2)}%`);

result.missingKeys.forEach((key) => {
  console.log(`${key.namespace}:${key.key} missing in ${key.missingIn.join(', ')}`);
});
```

#### Generate Report

```tsx
import { generateMissingTranslationsReport } from '@/core/utils/missingTranslations';

const report = generateMissingTranslationsReport('en', ['tr']);
console.log(report);
```

#### Check Specific Namespace

```tsx
import { getMissingTranslationsForNamespace } from '@/core/utils/missingTranslations';

const missing = getMissingTranslationsForNamespace('common', 'en', ['tr']);
console.log(`Missing ${missing.length} keys in common namespace`);
```

#### Check if Translation is Complete

```tsx
import { isTranslationComplete } from '@/core/utils/missingTranslations';

const isComplete = isTranslationComplete('common:hello', ['en', 'tr']);
console.log(`Translation complete: ${isComplete}`);
```

---

## 📅 Date/Time Localization

### Genel Bakış

Date/time localization, locale-aware tarih/saat formatları sağlar.

**Dosya:** `src/core/utils/dateLocalization.ts`

### Özellikler

- Locale-aware date formatting
- Locale-aware time formatting
- Relative time formatting
- Date range formatting

### Kullanım

#### Format Date

```tsx
import { formatDate } from '@/core/utils/dateLocalization';

// Medium format
const formatted = formatDate(new Date(), { dateStyle: 'medium' });
// "Dec 31, 2023" (en) or "31 Ara 2023" (tr)

// Short format
const short = formatDate(new Date(), { dateStyle: 'short' });
// "12/31/2023" (en) or "31.12.2023" (tr)
```

#### Format Time

```tsx
import { formatTime } from '@/core/utils/dateLocalization';

// 12-hour format
const time12 = formatTime(new Date(), { hour24: false });
// "3:45 PM" (en) or "15:45" (tr)

// 24-hour format
const time24 = formatTime(new Date(), { hour24: true });
// "15:45" (en/tr)
```

#### Format DateTime

```tsx
import { formatDateTime } from '@/core/utils/dateLocalization';

const formatted = formatDateTime(new Date());
// "Dec 31, 2023, 3:45 PM" (en) or "31 Ara 2023, 15:45" (tr)
```

#### Format Relative Time

```tsx
import { formatRelativeTime } from '@/core/utils/dateLocalization';

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
const relative = formatRelativeTime(twoHoursAgo);
// "2 hours ago" (en) or "2 saat önce" (tr)
```

#### Format Date Range

```tsx
import { formatDateRange } from '@/core/utils/dateLocalization';

const start = new Date('2023-01-01');
const end = new Date('2023-01-31');
const range = formatDateRange(start, end);
// "Jan 1 - 31, 2023" (en) or "1 - 31 Oca 2023" (tr)
```

#### Get Date Format Pattern

```tsx
import { getDateFormatPattern } from '@/core/utils/dateLocalization';

const pattern = getDateFormatPattern();
// "dd.MM.yyyy" (tr) or "MM/dd/yyyy" (en)
```

---

## 🔢 Pluralization

### Genel Bakış

Pluralization, dil bazlı çoğul kuralları sağlar.

**Dosya:** `src/core/utils/pluralization.ts`

### Özellikler

- Language-specific plural rules
- Count-based pluralization
- Complex plural rules support (Russian, Arabic, etc.)

### Kullanım

#### Pluralize

```tsx
import { pluralize } from '@/core/utils/pluralization';

// English
const one = pluralize('items', 1);
// "1 item"

const many = pluralize('items', 5);
// "5 items"

// Turkish
const oneTR = pluralize('items', 1);
// "1 öğe"

const manyTR = pluralize('items', 5);
// "5 öğe"
```

#### Format Count

```tsx
import { formatCount } from '@/core/utils/pluralization';

const count = formatCount('items', 3);
// "3 items" (en) or "3 öğe" (tr)
```

#### Get Plural Form

```tsx
import { getPluralForm } from '@/core/utils/pluralization';

const form = getPluralForm(1, 'en');
// "one"

const formMany = getPluralForm(5, 'en');
// "other"
```

#### Check Complex Plural Rules

```tsx
import { hasComplexPluralRules } from '@/core/utils/pluralization';

const hasComplex = hasComplexPluralRules('ru');
// true (Russian has complex plural rules)
```

### Translation File Format

Pluralization için translation dosyalarında şu format kullanılır:

```json
{
  "items_zero": "No items",
  "items_one": "1 item",
  "items_other": "{{count}} items"
}
```

---

## 🔄 RTL Support

### Genel Bakış

RTL (Right-to-Left) support, Arapça, İbranice, Farsça gibi diller için layout desteği sağlar.

**Dosya:** `src/core/utils/rtlSupport.ts`

### Desteklenen Diller

- Arabic (ar)
- Hebrew (he)
- Persian/Farsi (fa)
- Urdu (ur)
- Yiddish (yi)

### Kullanım

#### Check if RTL

```tsx
import { isRTL } from '@/core/utils/rtlSupport';

const rtl = isRTL('ar');
// true

const ltr = isRTL('en');
// false
```

#### Get Layout Direction

```tsx
import { getLayoutDirection } from '@/core/utils/rtlSupport';

const direction = getLayoutDirection('ar');
// "rtl"

const directionEN = getLayoutDirection('en');
// "ltr"
```

#### Get RTL-Aware Style

```tsx
import { getRTLStyle } from '@/core/utils/rtlSupport';

const style = getRTLStyle({ marginLeft: 10, marginRight: 20 }, 'ar');
// { marginRight: 10, marginLeft: 20 } for RTL
```

#### Get RTL-Aware Text Align

```tsx
import { getRTLTextAlign } from '@/core/utils/rtlSupport';

const align = getRTLTextAlign('left', 'ar');
// "right" (flipped for RTL)
```

#### Get RTL-Aware Flex Direction

```tsx
import { getRTLFlexDirection } from '@/core/utils/rtlSupport';

const direction = getRTLFlexDirection('row', 'ar');
// "row-reverse" (flipped for RTL)
```

---

## 💡 Kullanım Örnekleri

### Enhanced useLocalization Hook

```tsx
import { useLocalization } from '@/core/hooks/useLocalization';

function MyComponent() {
  const { t, isRTL, date, plural } = useLocalization();

  return (
    <View style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <Text>{t('common:hello')}</Text>
      <Text>{date.format(new Date(), { dateStyle: 'medium' })}</Text>
      <Text>{plural.formatCount('items', 5)}</Text>
    </View>
  );
}
```

### Date Formatting in Components

```tsx
import { useLocalization } from '@/core/hooks/useLocalization';

function DateDisplay({ date }: { date: Date }) {
  const { date: dateUtils } = useLocalization();

  return (
    <View>
      <Text>{dateUtils.format(date, { dateStyle: 'long' })}</Text>
      <Text>{dateUtils.formatRelative(date)}</Text>
    </View>
  );
}
```

### Pluralization in Lists

```tsx
import { useLocalization } from '@/core/hooks/useLocalization';

function ItemList({ items }: { items: Item[] }) {
  const { plural } = useLocalization();

  return (
    <View>
      <Text>{plural.formatCount('items', items.length)}</Text>
      {items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </View>
  );
}
```

### RTL-Aware Styling

```tsx
import { useLocalization } from '@/core/hooks/useLocalization';
import { getRTLStyle } from '@/core/utils/rtlSupport';

function RTLComponent() {
  const { isRTL } = useLocalization();

  const style = getRTLStyle(
    {
      marginLeft: 10,
      paddingRight: 20,
    },
    isRTL ? 'ar' : 'en'
  );

  return <View style={style}>Content</View>;
}
```

### Missing Translations Check

```tsx
import { checkMissingTranslations } from '@/core/utils/missingTranslations';

// Development only
if (__DEV__) {
  const result = checkMissingTranslations('en', ['tr']);
  if (result.missingCount > 0) {
    console.warn(`Missing ${result.missingCount} translations`);
  }
}
```

---

## ✅ Best Practices

### 1. Use useLocalization Hook

Enhanced hook kullanın:

```tsx
// ✅ Good
const { t, date, plural } = useLocalization();

// ❌ Bad
import i18n from '@/i18n';
const t = i18n.t;
```

### 2. Use Date Localization

Date formatting için localization utilities kullanın:

```tsx
// ✅ Good
const formatted = date.format(new Date(), { dateStyle: 'medium' });

// ❌ Bad
const formatted = new Date().toLocaleDateString();
```

### 3. Use Pluralization

Count-based text için pluralization kullanın:

```tsx
// ✅ Good
const text = plural.formatCount('items', count);

// ❌ Bad
const text = count === 1 ? '1 item' : `${count} items`;
```

### 4. Handle RTL

RTL diller için layout'u düşünün:

```tsx
// ✅ Good
const style = getRTLStyle({ marginLeft: 10 }, language);

// ❌ Bad
const style = { marginLeft: 10 }; // Doesn't work for RTL
```

### 5. Check Missing Translations

Development'ta missing translations kontrol edin:

```tsx
// ✅ Good
if (__DEV__) {
  const result = checkMissingTranslations();
  if (result.missingCount > 0) {
    console.warn('Missing translations found');
  }
}
```

---

## 📚 İlgili Dokümantasyon

- [i18next Documentation](https://www.i18next.com/)
- [React Native RTL Support](https://reactnative.dev/docs/direct-manipulation#rtl-layout)
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)

---

**Son Güncelleme:** 2025-02-18
