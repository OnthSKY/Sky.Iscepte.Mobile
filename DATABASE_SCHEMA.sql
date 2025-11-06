-- =====================================================
-- Sky.Template.Mobile PostgreSQL Database Schema
-- =====================================================
-- Bu dosya, Sky.Template.Mobile projesinin tüm veritabanı
-- tablolarını ve ilişkilerini içerir.
-- 
-- PostgreSQL 12+ için optimize edilmiştir.
-- =====================================================

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(200), -- Full name (computed or stored)
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin', 'owner', 'staff'
    package_id VARCHAR(50), -- 'free', 'premium', 'gold', etc.
    owner_id INTEGER, -- NULL for admin/owner, INTEGER for staff (references owner user)
    company VARCHAR(255),
    owner_company_name VARCHAR(255),
    custom_permissions JSONB DEFAULT '{}', -- Module-based custom permissions
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    CONSTRAINT chk_role CHECK (role IN ('admin', 'owner', 'staff'))
);

CREATE INDEX idx_users_owner_id ON users(owner_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_package_id ON users(package_id);

-- Refresh tokens table (for JWT refresh token management)
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =====================================================
-- 2. ROLES & PACKAGES
-- =====================================================

-- Roles table
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    actions JSONB NOT NULL, -- ["view", "create", "edit", "delete"]
    fields JSONB NOT NULL, -- ["category", "price", "group", "phone"]
    notifications JSONB NOT NULL, -- ["dailyReport", "lowStock"]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (role_id, module)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_module ON role_permissions(module);

-- Packages table
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Package modules table (which modules are available in a package)
CREATE TABLE package_modules (
    id SERIAL PRIMARY KEY,
    package_id VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    UNIQUE (package_id, module)
);

CREATE INDEX idx_package_modules_package_id ON package_modules(package_id);

-- User custom permissions table
CREATE TABLE user_custom_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    module VARCHAR(50) NOT NULL,
    actions JSONB NOT NULL,
    fields JSONB NOT NULL,
    notifications JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, module)
);

CREATE INDEX idx_user_custom_permissions_user_id ON user_custom_permissions(user_id);
CREATE INDEX idx_user_custom_permissions_module ON user_custom_permissions(module);

-- Permission groups table (for staff permission management)
CREATE TABLE permission_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL, -- Module-based permissions
    owner_id INTEGER, -- NULL: system default, INTEGER: owner-specific
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (owner_id, name)
);

CREATE INDEX idx_permission_groups_owner_id ON permission_groups(owner_id);

-- =====================================================
-- 3. MODULES & FORM TEMPLATES
-- =====================================================

-- Modules table (system modules configuration)
CREATE TABLE modules (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    route VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form templates table
CREATE TABLE form_templates (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_fields JSONB NOT NULL, -- DynamicField[] array
    custom_fields JSONB NOT NULL, -- DynamicField[] array
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    owner_id INTEGER NOT NULL,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (module, owner_id, is_default) WHERE is_default = TRUE
);

CREATE INDEX idx_form_templates_module_owner ON form_templates(module, owner_id);
CREATE INDEX idx_form_templates_module_default ON form_templates(module, owner_id, is_default);

-- =====================================================
-- 4. PRODUCTS / STOCK
-- =====================================================

-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY', -- 'TRY', 'USD', 'EUR'
    stock INTEGER DEFAULT 0,
    moq INTEGER DEFAULT 1, -- Minimum Order Quantity
    is_active BOOLEAN DEFAULT TRUE,
    has_sales BOOLEAN DEFAULT FALSE, -- Has any sales records
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_currency CHECK (currency IN ('TRY', 'USD', 'EUR'))
);

CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_has_sales ON products(has_sales);

-- Product global fields table (admin-defined global custom fields)
CREATE TABLE product_global_fields (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'text', 'number', 'date', 'select', 'boolean'
    options JSONB, -- Only for select type
    owner_id INTEGER, -- NULL: all owners, INTEGER: owner-specific
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_field_type CHECK (type IN ('text', 'number', 'date', 'select', 'boolean'))
);

CREATE INDEX idx_product_global_fields_owner_id ON product_global_fields(owner_id);

-- Product custom fields table (product-specific custom fields)
CREATE TABLE product_custom_fields (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200), -- Product-specific label (if not global)
    type VARCHAR(20), -- Product-specific type (if not global, default: 'text')
    value JSONB NOT NULL, -- Field value (any type)
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (product_id, field_key)
);

CREATE INDEX idx_product_custom_fields_product_id ON product_custom_fields(product_id);
CREATE INDEX idx_product_custom_fields_field_key ON product_custom_fields(field_key);

-- Stock alert settings table
CREATE TABLE stock_alert_settings (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    threshold INTEGER DEFAULT 10,
    reminder_frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
    reminder_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_reminder_frequency CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly'))
);

-- =====================================================
-- 5. CUSTOMERS
-- =====================================================

-- Customers table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    total_orders INTEGER DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'TRY',
    group VARCHAR(100),
    debt_limit DECIMAL(15,2),
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_customer_currency CHECK (currency IN ('TRY', 'USD', 'EUR'))
);

CREATE INDEX idx_customers_owner_id ON customers(owner_id);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_group ON customers(group);

-- Customer custom fields table
CREATE TABLE customer_custom_fields (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value JSONB NOT NULL,
    options JSONB,
    is_global BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE (customer_id, field_key)
);

CREATE INDEX idx_customer_custom_fields_customer_id ON customer_custom_fields(customer_id);

-- =====================================================
-- 6. SUPPLIERS
-- =====================================================

-- Suppliers table
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    total_orders INTEGER DEFAULT 0,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_suppliers_owner_id ON suppliers(owner_id);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- =====================================================
-- 7. SALES
-- =====================================================

-- Sales table
CREATE TABLE sales (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'TRY',
    total DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'completed', 'pending'
    debt_collection_date DATE, -- Borç alınacak tarih
    is_paid BOOLEAN DEFAULT FALSE, -- Ödeme alındı mı?
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_sale_currency CHECK (currency IN ('TRY', 'USD', 'EUR')),
    CONSTRAINT chk_sale_status CHECK (status IN ('completed', 'pending'))
);

CREATE INDEX idx_sales_owner_id ON sales(owner_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_debt_collection ON sales(debt_collection_date, is_paid) WHERE debt_collection_date IS NOT NULL AND is_paid = FALSE;

-- Sale items table (for bulk sales - multiple products in one sale)
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL, -- quantity * price
    currency VARCHAR(3) DEFAULT 'TRY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_sale_item_currency CHECK (currency IN ('TRY', 'USD', 'EUR'))
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Sale item custom fields table (for bulk sales - custom fields per item)
CREATE TABLE sale_item_custom_fields (
    id SERIAL PRIMARY KEY,
    sale_item_id INTEGER NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value JSONB NOT NULL,
    options JSONB,
    is_global BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
    UNIQUE (sale_item_id, field_key)
);

CREATE INDEX idx_sale_item_custom_fields_sale_item_id ON sale_item_custom_fields(sale_item_id);

-- Sale custom fields table
CREATE TABLE sale_custom_fields (
    id SERIAL PRIMARY KEY,
    sale_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value JSONB NOT NULL,
    options JSONB,
    is_global BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    UNIQUE (sale_id, field_key)
);

CREATE INDEX idx_sale_custom_fields_sale_id ON sale_custom_fields(sale_id);

-- =====================================================
-- 8. PURCHASES
-- =====================================================

-- Purchases table
CREATE TABLE purchases (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50),
    product_id VARCHAR(50), -- NULL for bulk purchases (use purchase_items table)
    quantity INTEGER, -- NULL for bulk purchases (use purchase_items table)
    price DECIMAL(15,2), -- NULL for bulk purchases (use purchase_items table)
    currency VARCHAR(3) DEFAULT 'TRY',
    total DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'completed', 'pending'
    purchase_type_id VARCHAR(50),
    is_stock_purchase BOOLEAN DEFAULT TRUE, -- true = stok için alış, false = gider olarak kaydedilecek (for single item purchases)
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_purchase_currency CHECK (currency IN ('TRY', 'USD', 'EUR')),
    CONSTRAINT chk_purchase_status CHECK (status IN ('completed', 'pending'))
);

CREATE INDEX idx_purchases_owner_id ON purchases(owner_id);
CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_purchases_product_id ON purchases(product_id);
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_purchases_status ON purchases(status);

-- Purchase items table (for bulk purchases - multiple products in one purchase)
CREATE TABLE purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL, -- quantity * price
    currency VARCHAR(3) DEFAULT 'TRY',
    is_stock_purchase BOOLEAN DEFAULT TRUE, -- true = stok için alış, false = gider olarak kaydedilecek
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT chk_purchase_item_currency CHECK (currency IN ('TRY', 'USD', 'EUR'))
);

CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product_id ON purchase_items(product_id);

-- Purchase item custom fields table (for bulk purchases - custom fields per item)
CREATE TABLE purchase_item_custom_fields (
    id SERIAL PRIMARY KEY,
    purchase_item_id INTEGER NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value JSONB NOT NULL,
    options JSONB,
    is_global BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_item_id) REFERENCES purchase_items(id) ON DELETE CASCADE,
    UNIQUE (purchase_item_id, field_key)
);

CREATE INDEX idx_purchase_item_custom_fields_purchase_item_id ON purchase_item_custom_fields(purchase_item_id);

-- Purchase custom fields table
CREATE TABLE purchase_custom_fields (
    id SERIAL PRIMARY KEY,
    purchase_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value JSONB NOT NULL,
    options JSONB,
    is_global BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    UNIQUE (purchase_id, field_key)
);

CREATE INDEX idx_purchase_custom_fields_purchase_id ON purchase_custom_fields(purchase_id);

-- =====================================================
-- 9. EMPLOYEES
-- =====================================================

-- Employees table
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(200), -- Full name
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
    hire_date DATE,
    salary DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'TRY',
    username VARCHAR(100), -- User account username
    role VARCHAR(50) DEFAULT 'staff', -- 'admin', 'owner', 'staff'
    package_id VARCHAR(50),
    owner_id INTEGER NOT NULL,
    custom_permissions JSONB DEFAULT '{}', -- Module-based custom permissions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    CONSTRAINT chk_employee_status CHECK (status IN ('active', 'inactive')),
    CONSTRAINT chk_employee_role CHECK (role IN ('admin', 'owner', 'staff')),
    CONSTRAINT chk_employee_currency CHECK (currency IN ('TRY', 'USD', 'EUR'))
);

CREATE INDEX idx_employees_owner_id ON employees(owner_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_role ON employees(role);

-- Employee verification settings table
CREATE TABLE employee_verification_settings (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL UNIQUE,
    tc_verification_enabled BOOLEAN DEFAULT FALSE,
    imei_verification_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Employee custom fields table
CREATE TABLE employee_custom_fields (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    value JSONB NOT NULL,
    options JSONB,
    is_global BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE (employee_id, field_key)
);

CREATE INDEX idx_employee_custom_fields_employee_id ON employee_custom_fields(employee_id);

-- =====================================================
-- 10. EXPENSES
-- =====================================================

-- Expenses table
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    type VARCHAR(20) DEFAULT 'expense', -- Always 'expense'
    source VARCHAR(50), -- 'product_purchase', 'employee_salary', 'manual'
    expense_type_id VARCHAR(50),
    date DATE NOT NULL,
    description TEXT,
    sale_id VARCHAR(50),
    product_id VARCHAR(50),
    employee_id VARCHAR(50),
    is_system_generated BOOLEAN DEFAULT FALSE,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT chk_expense_currency CHECK (currency IN ('TRY', 'USD', 'EUR')),
    CONSTRAINT chk_expense_source CHECK (source IN ('product_purchase', 'employee_salary', 'manual'))
);

CREATE INDEX idx_expenses_owner_id ON expenses(owner_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_source ON expenses(source);
CREATE INDEX idx_expenses_is_system_generated ON expenses(is_system_generated);
CREATE INDEX idx_expenses_expense_type_id ON expenses(expense_type_id);

-- Expense types table
CREATE TABLE expense_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INTEGER, -- NULL: system default, INTEGER: owner-specific
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (owner_id, name)
);

CREATE INDEX idx_expense_types_owner_id ON expense_types(owner_id);
CREATE INDEX idx_expense_types_is_system_default ON expense_types(is_system_default);

-- =====================================================
-- 11. REVENUE
-- =====================================================

-- Revenue table
CREATE TABLE revenue (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    source VARCHAR(50), -- 'sales', 'manual'
    revenue_type_id VARCHAR(50),
    date DATE NOT NULL,
    description TEXT,
    sale_id VARCHAR(50),
    employee_id VARCHAR(50),
    is_system_generated BOOLEAN DEFAULT FALSE,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT chk_revenue_currency CHECK (currency IN ('TRY', 'USD', 'EUR')),
    CONSTRAINT chk_revenue_source CHECK (source IN ('sales', 'manual'))
);

CREATE INDEX idx_revenue_owner_id ON revenue(owner_id);
CREATE INDEX idx_revenue_date ON revenue(date);
CREATE INDEX idx_revenue_source ON revenue(source);
CREATE INDEX idx_revenue_is_system_generated ON revenue(is_system_generated);
CREATE INDEX idx_revenue_revenue_type_id ON revenue(revenue_type_id);

-- Revenue types table
CREATE TABLE revenue_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INTEGER, -- NULL: system default, INTEGER: owner-specific
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (owner_id, name)
);

CREATE INDEX idx_revenue_types_owner_id ON revenue_types(owner_id);
CREATE INDEX idx_revenue_types_is_system_default ON revenue_types(is_system_default);

-- =====================================================
-- 12. INCOME (Separate from Revenue)
-- =====================================================

-- Income table
CREATE TABLE income (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    source VARCHAR(50), -- 'sales', 'manual'
    income_type_id VARCHAR(50),
    date DATE NOT NULL,
    description TEXT,
    sale_id VARCHAR(50),
    employee_id VARCHAR(50),
    is_system_generated BOOLEAN DEFAULT FALSE,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT chk_income_currency CHECK (currency IN ('TRY', 'USD', 'EUR')),
    CONSTRAINT chk_income_source CHECK (source IN ('sales', 'manual'))
);

CREATE INDEX idx_income_owner_id ON income(owner_id);
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_source ON income(source);
CREATE INDEX idx_income_is_system_generated ON income(is_system_generated);
CREATE INDEX idx_income_income_type_id ON income(income_type_id);

-- Income types table
CREATE TABLE income_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_id INTEGER, -- NULL: system default, INTEGER: owner-specific
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (owner_id, name)
);

CREATE INDEX idx_income_types_owner_id ON income_types(owner_id);
CREATE INDEX idx_income_types_is_system_default ON income_types(is_system_default);

-- =====================================================
-- 13. REPORTS
-- =====================================================

-- Reports table
CREATE TABLE reports (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50), -- Report type
    data JSONB, -- Report data (flexible structure)
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reports_owner_id ON reports(owner_id);
CREATE INDEX idx_reports_type ON reports(type);

-- =====================================================
-- 14. ACCOUNTING
-- =====================================================

-- Accounting transactions table
CREATE TABLE accounting_transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'revenue', 'expense', 'salary', 'adjustment'
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(500),
    related_entity_id VARCHAR(50),
    related_entity_type VARCHAR(50), -- 'sale', 'purchase', 'expense', etc.
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_transaction_type CHECK (type IN ('sale', 'purchase', 'revenue', 'expense', 'salary', 'adjustment'))
);

CREATE INDEX idx_accounting_transactions_owner_id ON accounting_transactions(owner_id, date);
CREATE INDEX idx_accounting_transactions_type ON accounting_transactions(type);
CREATE INDEX idx_accounting_transactions_date ON accounting_transactions(date);

-- =====================================================
-- 15. VERIFICATION
-- =====================================================

-- TC Verification cache table
CREATE TABLE tc_verification_cache (
    id SERIAL PRIMARY KEY,
    tc_no VARCHAR(11) NOT NULL,
    birth_date DATE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    verification_result JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE (tc_no, birth_date, full_name)
);

CREATE INDEX idx_tc_verification_cache_tc_no ON tc_verification_cache(tc_no);
CREATE INDEX idx_tc_verification_cache_expires_at ON tc_verification_cache(expires_at);

-- IMEI Verification cache table
CREATE TABLE imei_verification_cache (
    id SERIAL PRIMARY KEY,
    imei VARCHAR(15) NOT NULL,
    verification_result JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE (imei)
);

CREATE INDEX idx_imei_verification_cache_imei ON imei_verification_cache(imei);
CREATE INDEX idx_imei_verification_cache_expires_at ON imei_verification_cache(expires_at);

-- =====================================================
-- 16. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_custom_permissions_updated_at BEFORE UPDATE ON user_custom_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_groups_updated_at BEFORE UPDATE ON permission_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_global_fields_updated_at BEFORE UPDATE ON product_global_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_custom_fields_updated_at BEFORE UPDATE ON product_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_alert_settings_updated_at BEFORE UPDATE ON stock_alert_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_custom_fields_updated_at BEFORE UPDATE ON customer_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sale_custom_fields_updated_at BEFORE UPDATE ON sale_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sale_item_custom_fields_updated_at BEFORE UPDATE ON sale_item_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_custom_fields_updated_at BEFORE UPDATE ON purchase_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_item_custom_fields_updated_at BEFORE UPDATE ON purchase_item_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_verification_settings_updated_at BEFORE UPDATE ON employee_verification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_custom_fields_updated_at BEFORE UPDATE ON employee_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_types_updated_at BEFORE UPDATE ON expense_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON revenue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_types_updated_at BEFORE UPDATE ON revenue_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_types_updated_at BEFORE UPDATE ON income_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 17. INITIAL DATA (OPTIONAL)
-- =====================================================

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('owner', 'Business Owner', 'Business owner with full access to own data'),
('staff', 'Staff Member', 'Staff member with limited access');

-- Insert default packages
INSERT INTO packages (id, name, description, price) VALUES
('free', 'Free Plan', 'Basic features', 0.00),
('premium', 'Premium Plan', 'Advanced features', 99.99),
('gold', 'Gold Plan', 'All features', 199.99);

-- Insert default modules
INSERT INTO modules (id, name, description, icon, route) VALUES
('sales', 'Satış Yönetimi', 'Satış işlemlerini yönetmek için', 'cash-outline', 'Sales'),
('customers', 'Müşteri Yönetimi', 'Müşteri bilgilerini yönetmek için', 'people-outline', 'Customers'),
('suppliers', 'Tedarikçi Yönetimi', 'Tedarikçi bilgilerini yönetmek için', 'business-outline', 'Suppliers'),
('expenses', 'Gider Takibi', 'Gider işlemlerini takip etmek için', 'wallet-outline', 'Expenses'),
('revenue', 'Gelir Takibi', 'Gelir işlemlerini takip etmek için', 'trending-up-outline', 'Revenue'),
('employees', 'Çalışan Yönetimi', 'Çalışan bilgilerini yönetmek için', 'person-outline', 'Employees'),
('stock', 'Stok Yönetimi', 'Ürün ve stok yönetimi için', 'cube-outline', 'Stock'),
('purchases', 'Alış Yönetimi', 'Alış işlemlerini yönetmek için', 'cart-outline', 'Purchases'),
('reports', 'Raporlama', 'Raporlar ve analitik için', 'stats-chart-outline', 'Reports');

-- =====================================================
-- END OF SCHEMA
-- =====================================================

