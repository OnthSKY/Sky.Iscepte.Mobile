# Form Template Kullanım Özeti

## 📋 Mevcut Durum

### ✅ Oluşturulmuş Yapı
- **8 Modül** için form template yönetimi mevcut:
  - Stock (Ürün/Stok)
  - Customers (Müşteriler)
  - Suppliers (Tedarikçiler)
  - Sales (Satışlar)
  - Purchases (Alışlar)
  - Expenses (Giderler)
  - Revenue (Gelirler)
  - Employees (Çalışanlar)

### 📍 Erişim Yolu
**Her modül için ayrı ekran:**
```
Settings (Ana Ayarlar)
  └── [Modül] Modülü (örn: Stock Modülü, Müşteriler Modülü)
      └── Form Şablonları
          └── [Modül için özel Form Template Management Screen]
```

### 📁 Dosya Yapısı
Her modül için:
- `src/modules/{module}/screens/FormTemplateManagementScreen.tsx` - Template yönetim ekranı
- `src/modules/{module}/services/formTemplateService.ts` - API servisi
- `src/modules/{module}/hooks/useFormTemplatesQuery.ts` - React Query hooks
- `src/screens/{Module}ModuleSettingsScreen.tsx` - Modül ayarları ekranı (template'e link var)

## ⚠️ Eksik Kısım

### Form Screen'lerde Template Kullanımı Yok
Şu anda:
- ✅ Template'ler oluşturulabiliyor
- ✅ Template'ler yönetilebiliyor (düzenle, sil, çoğalt, varsayılan yap)
- ❌ Form screen'lerde template seçimi yok
- ❌ Form screen'lerde template kullanımı yok

**Örnek:** 
- `ProductFormScreen` → Sadece `productFormFields` kullanıyor
- `CustomerFormScreen` → Sadece `customerFormFields` kullanıyor
- Template'ler henüz form'larda kullanılmıyor

## 🔄 İki Seçenek

### Seçenek 1: Modül Bazlı (Şu Anki Yapı) ✅
**Avantajları:**
- Her modül kendi template'lerini yönetiyor
- Modül bazlı izolasyon (her modülün kendi baseFields'i var)
- Daha organize ve modüler yapı
- Her modül için özel template isimlendirmesi

**Kullanım:**
- Settings → Stock Modülü → Form Şablonları → Stock template'lerini yönet
- Settings → Müşteriler Modülü → Form Şablonları → Customer template'lerini yönet

### Seçenek 2: Merkezi Yönetim (Alternatif)
**Avantajları:**
- Tek bir ekrandan tüm modüllerin template'leri görülebilir
- Cross-module template kopyalama kolaylaşır

**Dezavantajları:**
- Her modülün farklı baseFields'i olduğu için karışıklık olabilir
- Modül bazlı izolasyon kaybolur

## 💡 Öneri

**Mevcut yapı mantıklı** - Modül bazlı devam edelim çünkü:
1. Her modülün kendi `baseFields` yapısı var
2. Modül bazlı permission kontrolü yapılabiliyor
3. Her modül kendi template'lerini bağımsız yönetebiliyor

## 🚀 Sonraki Adım

Form screen'lerde template kullanımını entegre etmek gerekiyor:

### ProductFormScreen'de Template Kullanımı
```typescript
1. Template listesini yükle (useFormTemplatesQuery)
2. Dropdown/Select ile template seçimi
3. Seçilen template'in baseFields + customFields'ini kullan
4. Default template otomatik seçilsin
```

### CustomerFormScreen'de Template Kullanımı
```typescript
1. Template listesini yükle (useFormTemplatesQuery)
2. Dropdown/Select ile template seçimi
3. Seçilen template'in baseFields + customFields'ini kullan
4. Default template otomatik seçilsin
```

## 📊 Modül Karşılaştırması

| Modül | Template Management | Form Screen'de Kullanım | Durum |
|-------|-------------------|------------------------|--------|
| Stock | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Customers | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Suppliers | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Sales | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Purchases | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Expenses | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Revenue | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |
| Employees | ✅ Var | ❌ Yok | Template oluşturulabilir ama kullanılmıyor |

## 🎯 Sonuç

- **Yapı:** Her modül için ayrı template yönetimi ✅
- **Erişim:** Settings → Modül Ayarları → Form Şablonları ✅
- **Kullanım:** Form screen'lerde henüz entegre edilmedi ❌

**Öneri:** Form screen'lere template seçimi ve kullanımını ekleyelim.

