# Frontend Permission Listesi

Bu liste, frontend'de kullanılan TÜM permission'ları içerir. Backend'de database'e eklerken bu liste kullanılmalıdır.

## Permission Formatı
Format: `{module}:{action}`

## Tüm Permission'lar (Alfabetik Sırayla)

### Customers Modülü
- `customers:view` - Müşterileri görüntüleme
- `customers:create` - Yeni müşteri oluşturma
- `customers:edit` - Müşteri düzenleme
- `customers:delete` - Müşteri silme
- `customers:custom_fields` - Müşteriye özel custom field ekleme/silme
- `customers:custom_form` - Müşteri form şablonu oluşturma/düzenleme
- `customers:custom_value` - Müşteri custom field değerlerini düzenleme

### Employees Modülü
- `employees:view` - Çalışanları görüntüleme
- `employees:create` - Yeni çalışan oluşturma
- `employees:edit` - Çalışan düzenleme
- `employees:delete` - Çalışan silme
- `employees:custom_fields` - Çalışana özel custom field ekleme/silme
- `employees:custom_form` - Çalışan form şablonu oluşturma/düzenleme
- `employees:custom_value` - Çalışan custom field değerlerini düzenleme

### Expenses Modülü
- `expenses:view` - Giderleri görüntüleme
- `expenses:create` - Yeni gider oluşturma
- `expenses:edit` - Gider düzenleme
- `expenses:delete` - Gider silme
- `expenses:custom_fields` - Gidere özel custom field ekleme/silme
- `expenses:custom_form` - Gider form şablonu oluşturma/düzenleme
- `expenses:custom_value` - Gider custom field değerlerini düzenleme

### Income Modülü
- `income:view` - Gelirleri görüntüleme
- `income:create` - Yeni gelir oluşturma
- `income:edit` - Gelir düzenleme
- `income:delete` - Gelir silme
- `income:custom_fields` - Gelire özel custom field ekleme/silme
- `income:custom_form` - Gelir form şablonu oluşturma/düzenleme
- `income:custom_value` - Gelir custom field değerlerini düzenleme

### Purchases Modülü
- `purchases:view` - Alışları görüntüleme
- `purchases:create` - Yeni alış oluşturma
- `purchases:edit` - Alış düzenleme
- `purchases:delete` - Alış silme
- `purchases:custom_fields` - Alışa özel custom field ekleme/silme
- `purchases:custom_form` - Alış form şablonu oluşturma/düzenleme
- `purchases:custom_value` - Alış custom field değerlerini düzenleme

### Reports Modülü
- `reports:view` - Raporları görüntüleme

### Revenue Modülü
- `revenue:view` - Gelirleri görüntüleme
- `revenue:create` - Yeni gelir oluşturma
- `revenue:edit` - Gelir düzenleme
- `revenue:delete` - Gelir silme
- `revenue:custom_fields` - Gelire özel custom field ekleme/silme
- `revenue:custom_form` - Gelir form şablonu oluşturma/düzenleme
- `revenue:custom_value` - Gelir custom field değerlerini düzenleme

### Sales Modülü
- `sales:view` - Satışları görüntüleme
- `sales:create` - Yeni satış oluşturma
- `sales:edit` - Satış düzenleme
- `sales:delete` - Satış silme
- `sales:custom_fields` - Satışa özel custom field ekleme/silme
- `sales:custom_form` - Satış form şablonu oluşturma/düzenleme
- `sales:custom_value` - Satış custom field değerlerini düzenleme

### Settings Modülü
- `settings:view` - Ayarları görüntüleme
- `settings:manage` - Ayarları yönetme

### Stock Modülü
- `stock:view` - Stokları görüntüleme
- `stock:create` - Yeni stok oluşturma
- `stock:edit` - Stok düzenleme
- `stock:delete` - Stok silme
- `stock:custom_fields` - Stoka özel custom field ekleme/silme
- `stock:custom_form` - Stok form şablonu oluşturma/düzenleme
- `stock:custom_value` - Stok custom field değerlerini düzenleme

### Suppliers Modülü
- `suppliers:view` - Tedarikçileri görüntüleme
- `suppliers:create` - Yeni tedarikçi oluşturma
- `suppliers:edit` - Tedarikçi düzenleme
- `suppliers:delete` - Tedarikçi silme
- `suppliers:custom_fields` - Tedarikçiye özel custom field ekleme/silme
- `suppliers:custom_form` - Tedarikçi form şablonu oluşturma/düzenleme
- `suppliers:custom_value` - Tedarikçi custom field değerlerini düzenleme

## Toplam Permission Sayısı

### Modül Bazında
- **Customers**: 7 permission
- **Employees**: 7 permission
- **Expenses**: 7 permission
- **Income**: 7 permission
- **Purchases**: 7 permission
- **Reports**: 1 permission
- **Revenue**: 7 permission
- **Sales**: 7 permission
- **Settings**: 2 permission
- **Stock**: 7 permission
- **Suppliers**: 7 permission

### Toplam
**61 unique permission**

## SQL Insert Script Örneği

```sql
-- Permission'ları database'e ekle (ilk kurulumda)
INSERT INTO permissions (name, module, action, description) VALUES
-- Customers
('customers:view', 'customers', 'view', 'Müşterileri görüntüleme'),
('customers:create', 'customers', 'create', 'Yeni müşteri oluşturma'),
('customers:edit', 'customers', 'edit', 'Müşteri düzenleme'),
('customers:delete', 'customers', 'delete', 'Müşteri silme'),
('customers:custom_fields', 'customers', 'custom_fields', 'Müşteriye özel custom field ekleme/silme'),
('customers:custom_form', 'customers', 'custom_form', 'Müşteri form şablonu oluşturma/düzenleme'),
('customers:custom_value', 'customers', 'custom_value', 'Müşteri custom field değerlerini düzenleme'),

-- Employees
('employees:view', 'employees', 'view', 'Çalışanları görüntüleme'),
('employees:create', 'employees', 'create', 'Yeni çalışan oluşturma'),
('employees:edit', 'employees', 'edit', 'Çalışan düzenleme'),
('employees:delete', 'employees', 'delete', 'Çalışan silme'),
('employees:custom_fields', 'employees', 'custom_fields', 'Çalışana özel custom field ekleme/silme'),
('employees:custom_form', 'employees', 'custom_form', 'Çalışan form şablonu oluşturma/düzenleme'),
('employees:custom_value', 'employees', 'custom_value', 'Çalışan custom field değerlerini düzenleme'),

-- Expenses
('expenses:view', 'expenses', 'view', 'Giderleri görüntüleme'),
('expenses:create', 'expenses', 'create', 'Yeni gider oluşturma'),
('expenses:edit', 'expenses', 'edit', 'Gider düzenleme'),
('expenses:delete', 'expenses', 'delete', 'Gider silme'),
('expenses:custom_fields', 'expenses', 'custom_fields', 'Gidere özel custom field ekleme/silme'),
('expenses:custom_form', 'expenses', 'custom_form', 'Gider form şablonu oluşturma/düzenleme'),
('expenses:custom_value', 'expenses', 'custom_value', 'Gider custom field değerlerini düzenleme'),

-- Income
('income:view', 'income', 'view', 'Gelirleri görüntüleme'),
('income:create', 'income', 'create', 'Yeni gelir oluşturma'),
('income:edit', 'income', 'edit', 'Gelir düzenleme'),
('income:delete', 'income', 'delete', 'Gelir silme'),
('income:custom_fields', 'income', 'custom_fields', 'Gelire özel custom field ekleme/silme'),
('income:custom_form', 'income', 'custom_form', 'Gelir form şablonu oluşturma/düzenleme'),
('income:custom_value', 'income', 'custom_value', 'Gelir custom field değerlerini düzenleme'),

-- Purchases
('purchases:view', 'purchases', 'view', 'Alışları görüntüleme'),
('purchases:create', 'purchases', 'create', 'Yeni alış oluşturma'),
('purchases:edit', 'purchases', 'edit', 'Alış düzenleme'),
('purchases:delete', 'purchases', 'delete', 'Alış silme'),
('purchases:custom_fields', 'purchases', 'custom_fields', 'Alışa özel custom field ekleme/silme'),
('purchases:custom_form', 'purchases', 'custom_form', 'Alış form şablonu oluşturma/düzenleme'),
('purchases:custom_value', 'purchases', 'custom_value', 'Alış custom field değerlerini düzenleme'),

-- Reports
('reports:view', 'reports', 'view', 'Raporları görüntüleme'),

-- Revenue
('revenue:view', 'revenue', 'view', 'Gelirleri görüntüleme'),
('revenue:create', 'revenue', 'create', 'Yeni gelir oluşturma'),
('revenue:edit', 'revenue', 'edit', 'Gelir düzenleme'),
('revenue:delete', 'revenue', 'delete', 'Gelir silme'),
('revenue:custom_fields', 'revenue', 'custom_fields', 'Gelire özel custom field ekleme/silme'),
('revenue:custom_form', 'revenue', 'custom_form', 'Gelir form şablonu oluşturma/düzenleme'),
('revenue:custom_value', 'revenue', 'custom_value', 'Gelir custom field değerlerini düzenleme'),

-- Sales
('sales:view', 'sales', 'view', 'Satışları görüntüleme'),
('sales:create', 'sales', 'create', 'Yeni satış oluşturma'),
('sales:edit', 'sales', 'edit', 'Satış düzenleme'),
('sales:delete', 'sales', 'delete', 'Satış silme'),
('sales:custom_fields', 'sales', 'custom_fields', 'Satışa özel custom field ekleme/silme'),
('sales:custom_form', 'sales', 'custom_form', 'Satış form şablonu oluşturma/düzenleme'),
('sales:custom_value', 'sales', 'custom_value', 'Satış custom field değerlerini düzenleme'),

-- Settings
('settings:view', 'settings', 'view', 'Ayarları görüntüleme'),
('settings:manage', 'settings', 'manage', 'Ayarları yönetme'),

-- Stock
('stock:view', 'stock', 'view', 'Stokları görüntüleme'),
('stock:create', 'stock', 'create', 'Yeni stok oluşturma'),
('stock:edit', 'stock', 'edit', 'Stok düzenleme'),
('stock:delete', 'stock', 'delete', 'Stok silme'),
('stock:custom_fields', 'stock', 'custom_fields', 'Stoka özel custom field ekleme/silme'),
('stock:custom_form', 'stock', 'custom_form', 'Stok form şablonu oluşturma/düzenleme'),
('stock:custom_value', 'stock', 'custom_value', 'Stok custom field değerlerini düzenleme'),

-- Suppliers
('suppliers:view', 'suppliers', 'view', 'Tedarikçileri görüntüleme'),
('suppliers:create', 'suppliers', 'create', 'Yeni tedarikçi oluşturma'),
('suppliers:edit', 'suppliers', 'edit', 'Tedarikçi düzenleme'),
('suppliers:delete', 'suppliers', 'delete', 'Tedarikçi silme'),
('suppliers:custom_fields', 'suppliers', 'custom_fields', 'Tedarikçiye özel custom field ekleme/silme'),
('suppliers:custom_form', 'suppliers', 'custom_form', 'Tedarikçi form şablonu oluşturma/düzenleme'),
('suppliers:custom_value', 'suppliers', 'custom_value', 'Tedarikçi custom field değerlerini düzenleme');
```

## Permission Kullanım Yerleri

### 1. Route Navigation (`src/core/navigation/routes.ts`)
Tüm route'lar için `requiredPermission` field'ı kullanılıyor:
- List screens: `{module}:view`
- Create screens: `{module}:create`
- Edit screens: `{module}:edit`
- Detail screens: `{module}:view`
- Dashboard screens: `{module}:view`

### 2. Custom Fields Manager (`src/shared/components/CustomFieldsManager.tsx`)
- `{module}:custom_fields` - Custom field ekleme/silme
- `{module}:custom_value` - Custom field değerlerini düzenleme

### 3. Form Template Management (`src/screens/FormTemplateManagementScreen.tsx`)
- `{module}:custom_form` - Form şablonu oluşturma/düzenleme/silme
- `{module}:view` - Modül görüntüleme (template yönetimi için)

### 4. List Screen Container (`src/shared/components/screens/ListScreenContainer.tsx`)
- `{module}:view` - Liste görüntüleme
- `{module}:create` - Yeni kayıt oluşturma butonu

### 5. Detail Screen Container (`src/shared/components/screens/DetailScreenContainer.tsx`)
- `{module}:view` - Detay görüntüleme
- `{module}:edit` - Düzenleme butonu
- `{module}:delete` - Silme butonu

### 6. Module Config (`src/core/config/moduleConfig.ts`)
Her modül için `requiredPermission` tanımlı (çoğunlukla `{module}:view`)

## Notlar

1. **Permission Format**: Her zaman `{module}:{action}` formatında
2. **Standard Actions**: `view`, `create`, `edit`, `delete`
3. **Custom Actions**: `custom_fields`, `custom_form`, `custom_value`
4. **Settings Actions**: `view`, `manage`
5. **Reports**: Sadece `view` var (create/edit/delete yok)

