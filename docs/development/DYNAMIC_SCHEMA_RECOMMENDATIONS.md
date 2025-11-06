# Dinamik Şema Önerileri ve İyileştirmeler

Bu dokümantasyon, Sky.Template.Mobile projesi için dinamik ve esnek bir veritabanı yapısı oluşturmak için öneriler içerir.

## 📋 İçindekiler

1. [Mevcut Yapının Analizi](#mevcut-yapının-analizi)
2. [Önerilen İyileştirmeler](#önerilen-iyileştirmeler)
3. [Global Custom Field Registry](#global-custom-field-registry)
4. [Workflow & State Management](#workflow--state-management)
5. [Audit Logging](#audit-logging)
6. [Notification System](#notification-system)
7. [Multi-Currency & Multi-Language](#multi-currency--multi-language)
8. [Business Rules Engine](#business-rules-engine)
9. [API Endpoint Önerileri](#api-endpoint-önerileri)

---

## Mevcut Yapının Analizi

### ✅ Güçlü Yönler

1. **Modüler Yapı**: Her modül için ayrı tablolar (products, customers, sales, etc.)
2. **Form Templates**: Dinamik form şablonları sistemi mevcut
3. **Permissions**: Detaylı permission sistemi (role-based, package-based, custom)
4. **Owner Isolation**: Her owner için veri izolasyonu

### ⚠️ İyileştirilebilir Yönler

1. **Custom Fields**: Her modül için ayrı custom field tabloları (product_custom_fields, customer_custom_fields, etc.) - tekrar eden yapı
2. **Field Dependencies**: Field'lar arası bağımlılık ve koşullu görünürlük yok
3. **Workflow Management**: Entity state yönetimi yok (sadece status field'ları var)
4. **Audit Logging**: Değişiklik geçmişi takibi yok
5. **Soft Delete**: Soft delete desteği yok
6. **List/Detail View Config**: Form template'lerde listFields/detailFields var ama bu yeterince dinamik değil
7. **Multi-Currency**: Currency desteği var ama exchange rate yönetimi yok
8. **Multi-Language**: i18n var ama dinamik translation yönetimi yok

---

## Önerilen İyileştirmeler

### 1. Global Custom Field Registry (Unified Custom Fields)

**Problem**: Her modül için ayrı custom field tabloları (product_custom_fields, customer_custom_fields, sale_custom_fields, etc.) - kod tekrarı ve bakım zorluğu.

**Çözüm**: 
- `global_field_definitions` tablosu: Tüm custom field tanımları merkezi olarak saklanır
- `custom_field_values` tablosu: Tüm modüller için generic custom field değerleri
- `field_dependencies` tablosu: Field'lar arası bağımlılık ve koşullu görünürlük

**Avantajlar**:
- Tek bir tablo ile tüm modüller için custom field yönetimi
- Field'lar arası bağımlılık ve koşullu görünürlük desteği
- Validation rules merkezi olarak yönetilir
- Daha kolay bakım ve genişletme

**Kullanım Senaryosu**:
```sql
-- Örnek: "Garanti Süresi" field'ı sadece "Garanti Var" checkbox'ı işaretliyse gösterilir
INSERT INTO field_dependencies (field_definition_id, depends_on_field_key, condition_type, condition_value, action)
VALUES (
  (SELECT id FROM global_field_definitions WHERE field_key = 'warranty_period'),
  'has_warranty',
  'equals',
  '{"value": true}',
  'show'
);
```

---

### 2. Workflow & State Management

**Problem**: Entity'ler için sadece `status` field'ı var (örn: 'completed', 'pending'). State transition kuralları ve geçmişi yok.

**Çözüm**:
- `entity_states` tablosu: Her entity type için state tanımları
- `state_transitions` tablosu: İzin verilen state geçişleri
- `entity_state_history` tablosu: State değişiklik geçmişi

**Avantajlar**:
- State transition kuralları tanımlanabilir
- State geçmişi takip edilebilir
- Permission bazlı state transition kontrolü
- Workflow automation için temel

**Kullanım Senaryosu**:
```sql
-- Sale için state'ler
INSERT INTO entity_states (entity_type, state_key, state_label, is_initial, is_final)
VALUES 
  ('sale', 'draft', 'Taslak', true, false),
  ('sale', 'pending', 'Beklemede', false, false),
  ('sale', 'completed', 'Tamamlandı', false, true),
  ('sale', 'cancelled', 'İptal Edildi', false, true);

-- State transition: draft -> pending -> completed
INSERT INTO state_transitions (entity_type, from_state_key, to_state_key, transition_label, required_permission)
VALUES 
  ('sale', 'draft', 'pending', 'Onayla', 'sales:approve'),
  ('sale', 'pending', 'completed', 'Tamamla', 'sales:complete');
```

---

### 3. Audit Logging

**Problem**: Veri değişikliklerinin kim, ne zaman, neyi değiştirdiği takip edilemiyor.

**Çözüm**:
- `audit_logs` tablosu: Tüm entity değişikliklerini loglar
- `changes` JSONB field: {field: {old: value, new: value}} formatında

**Avantajlar**:
- Tam audit trail
- Compliance gereksinimlerini karşılar
- Hata ayıklama için değerli
- Kullanıcı aktivitelerini takip eder

**Kullanım Senaryosu**:
```sql
-- Örnek audit log
{
  "entity_type": "sale",
  "entity_id": "123",
  "action": "update",
  "changed_by": 2,
  "changes": {
    "status": {"old": "pending", "new": "completed"},
    "isPaid": {"old": false, "new": true}
  },
  "metadata": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

---

### 4. Soft Delete

**Problem**: Entity'ler silindiğinde veri kaybı oluyor, geri alma imkanı yok.

**Çözüm**:
- `soft_deletes` tablosu: Silinen entity'lerin metadata'sı
- Tüm entity sorgularında `soft_deletes` kontrolü

**Avantajlar**:
- Veri kaybı önlenir
- Geri alma imkanı
- Compliance gereksinimlerini karşılar
- Accidental deletion koruması

---

### 5. List & Detail View Configurations

**Problem**: Form template'lerde `listFields` ve `detailFields` var ama bu yeterince dinamik değil (sadece field name'ler, column width, grouping yok).

**Çözüm**:
- `list_view_configurations` tablosu: List view için dinamik konfigürasyon
- `detail_view_configurations` tablosu: Detail view için dinamik konfigürasyon (field grouping)

**Avantajlar**:
- Kullanıcılar kendi list/detail view'larını özelleştirebilir
- Responsive column width'ler
- Field grouping (sections)
- Multiple view configurations

**Kullanım Senaryosu**:
```json
// List view configuration
{
  "field_keys": ["name", "price", "stock", "category"],
  "column_widths": {
    "name": "flex-2",
    "price": "flex-1",
    "stock": "flex-1",
    "category": "flex-1"
  },
  "sort_field": "name",
  "sort_direction": "ASC"
}

// Detail view configuration
{
  "field_groups": [
    {
      "group": "Basic Info",
      "fields": ["name", "price", "stock"]
    },
    {
      "group": "Details",
      "fields": ["category", "sku", "moq"]
    },
    {
      "group": "Custom Fields",
      "fields": ["warranty_period", "brand"]
    }
  ]
}
```

---

### 6. Notification System

**Problem**: Notification sistemi yok (sadece permission'larda notification field'ları var).

**Çözüm**:
- `notification_templates` tablosu: Notification şablonları
- `user_notifications` tablosu: Kullanıcı bildirimleri
- `notification_preferences` tablosu: Kullanıcı bildirim tercihleri

**Avantajlar**:
- Dinamik notification şablonları
- Multi-channel notifications (email, SMS, push, in-app)
- Kullanıcı bazlı notification preferences
- Template-based notifications (variables)

**Kullanım Senaryosu**:
```sql
-- Notification template
INSERT INTO notification_templates (template_key, module, title, body, type, variables)
VALUES (
  'low_stock_alert',
  'stock',
  'Düşük Stok Uyarısı',
  '{{product_name}} ürününün stok seviyesi {{current_stock}} adede düştü. Minimum stok: {{min_stock}}.',
  'in_app',
  '["product_name", "current_stock", "min_stock"]'
);
```

---

### 7. Multi-Currency & Exchange Rates

**Problem**: Currency desteği var (TRY, USD, EUR) ama exchange rate yönetimi yok.

**Çözüm**:
- `currency_exchange_rates` tablosu: Döviz kurları
- `user_currency_preferences` tablosu: Kullanıcı para birimi tercihleri

**Avantajlar**:
- Otomatik currency conversion
- Historical exchange rates
- Kullanıcı bazlı currency display preferences
- Multi-currency reports

---

### 8. Multi-Language & Dynamic Translations

**Problem**: i18n var ama statik translation dosyaları kullanılıyor. Dinamik translation yönetimi yok.

**Çözüm**:
- `translations` tablosu: Dinamik translation'lar
- `user_language_preferences` tablosu: Kullanıcı dil tercihleri

**Avantajlar**:
- Backend'den translation yönetimi
- Runtime'da translation güncelleme
- Kullanıcı bazlı dil tercihleri
- Date/number format preferences

---

### 9. Business Rules Engine

**Problem**: Business logic kod içinde hard-coded. Dinamik business rule yönetimi yok.

**Çözüm**:
- `business_rules` tablosu: Dinamik business rule'lar

**Avantajlar**:
- Kod değişikliği olmadan business rule ekleme
- Owner bazlı custom business rules
- Automation rules (örn: low stock alert)
- Validation rules

**Kullanım Senaryosu**:
```sql
-- Örnek: Stok 10'un altına düştüğünde otomatik olarak low_stock flag'i set et
INSERT INTO business_rules (rule_key, module, rule_name, rule_type, condition, action)
VALUES (
  'auto_low_stock_flag',
  'stock',
  'Otomatik Düşük Stok İşareti',
  'automation',
  '{"field": "stock", "operator": "<", "value": 10}',
  '{"type": "set_field", "field": "is_low_stock", "value": true}'
);
```

---

### 10. Module Configuration

**Problem**: Module ayarları kod içinde hard-coded. Dinamik module configuration yok.

**Çözüm**:
- `module_configurations` tablosu: Module-specific settings
- `module_field_configurations` tablosu: Field visibility/editable settings

**Avantajlar**:
- Runtime'da module ayarları değiştirilebilir
- Owner bazlı module configurations
- Field-level visibility/editable controls

---

## API Endpoint Önerileri

### Global Custom Fields APIs

```http
GET /global-field-definitions
GET /global-field-definitions/:module
POST /global-field-definitions
PUT /global-field-definitions/:id
DELETE /global-field-definitions/:id

GET /field-dependencies/:fieldDefinitionId
POST /field-dependencies
PUT /field-dependencies/:id
DELETE /field-dependencies/:id
```

### Workflow APIs

```http
GET /entity-states/:entityType
POST /entity-states
PUT /entity-states/:id

GET /state-transitions/:entityType
POST /state-transitions
PUT /state-transitions/:id

GET /entity-state-history/:entityType/:entityId
POST /entities/:entityType/:entityId/transition-state
```

### Audit Log APIs

```http
GET /audit-logs
GET /audit-logs/:entityType/:entityId
GET /audit-logs/user/:userId
```

### View Configuration APIs

```http
GET /list-view-configurations/:module
POST /list-view-configurations/:module
PUT /list-view-configurations/:id

GET /detail-view-configurations/:module
POST /detail-view-configurations/:module
PUT /detail-view-configurations/:id
```

### Notification APIs

```http
GET /notification-templates
POST /notification-templates
PUT /notification-templates/:id

GET /user-notifications
POST /user-notifications/:id/read
GET /notification-preferences
PUT /notification-preferences
```

### Business Rules APIs

```http
GET /business-rules/:module
POST /business-rules
PUT /business-rules/:id
DELETE /business-rules/:id
```

---

## Migration Stratejisi

### Aşama 1: Temel İyileştirmeler (Öncelikli)
1. ✅ Global Custom Field Registry
2. ✅ Soft Delete
3. ✅ Audit Logging
4. ✅ List/Detail View Configurations

### Aşama 2: Workflow & Automation
1. ✅ Entity States & Transitions
2. ✅ Business Rules Engine
3. ✅ Notification System

### Aşama 3: Advanced Features
1. ✅ Multi-Currency & Exchange Rates
2. ✅ Multi-Language & Dynamic Translations
3. ✅ Module Configurations

---

## Önerilen Kullanım Senaryoları

### Senaryo 1: Dinamik Form Field'ları

```typescript
// Backend'den field definitions çek
GET /global-field-definitions/stock

// Response:
{
  "fields": [
    {
      "id": 1,
      "field_key": "warranty_period",
      "label": "Garanti Süresi",
      "type": "number",
      "validation_rules": {
        "required": false,
        "min": 0,
        "max": 60
      },
      "dependencies": [
        {
          "depends_on": "has_warranty",
          "condition": "equals",
          "value": true,
          "action": "show"
        }
      ]
    }
  ]
}
```

### Senaryo 2: Workflow Yönetimi

```typescript
// Sale için state transition
POST /entities/sale/123/transition-state

{
  "from_state": "pending",
  "to_state": "completed",
  "reason": "Ödeme alındı"
}

// Backend kontrol eder:
// 1. Bu transition allowed mı? (state_transitions tablosundan)
// 2. User'ın permission'ı var mı? (required_permission kontrolü)
// 3. State history'ye kaydet
// 4. İlgili business rule'ları çalıştır
```

### Senaryo 3: Business Rules

```typescript
// Low stock alert business rule
{
  "rule_key": "low_stock_alert",
  "module": "stock",
  "rule_type": "notification",
  "condition": {
    "field": "stock",
    "operator": "<",
    "value": 10
  },
  "action": {
    "type": "send_notification",
    "template": "low_stock_alert",
    "recipients": ["owner"]
  }
}
```

---

## Sonuç

Bu iyileştirmeler ile:

✅ **Daha Dinamik**: Kod değişikliği olmadan yeni özellikler eklenebilir
✅ **Daha Esnek**: Owner bazlı özelleştirmeler
✅ **Daha Güvenli**: Audit logging ve soft delete
✅ **Daha Kullanıcı Dostu**: Custom view configurations
✅ **Daha Otomatik**: Business rules ve workflow management
✅ **Daha Ölçeklenebilir**: Multi-currency, multi-language support

**Not**: Bu iyileştirmeler aşamalı olarak uygulanabilir. Öncelik sırasına göre migration planı yapılmalıdır.

