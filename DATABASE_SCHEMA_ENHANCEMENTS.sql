-- =====================================================
-- Sky.Template.Mobile - Enhanced Dynamic Schema
-- =====================================================
-- Bu dosya, mevcut şemaya dinamiklik ve esneklik kazandıracak
-- ek tablolar ve özellikler içerir.
-- =====================================================

-- =====================================================
-- 1. GLOBAL CUSTOM FIELD REGISTRY (Unified Custom Fields)
-- =====================================================

-- Global custom field definitions table
-- Tüm modüller için merkezi custom field tanımları
CREATE TABLE global_field_definitions (
    id SERIAL PRIMARY KEY,
    field_key VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL, -- 'stock', 'customers', 'sales', etc. veya 'global' (tüm modüller için)
    label VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'text', 'number', 'date', 'select', 'boolean', 'textarea', 'signature', 'image'
    description TEXT,
    options JSONB, -- For select type: [{label: string, value: any}]
    validation_rules JSONB DEFAULT '{}', -- {required: boolean, min: number, max: number, pattern: string, etc.}
    default_value JSONB, -- Default value for the field
    is_system_field BOOLEAN DEFAULT FALSE, -- System-defined fields cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,
    owner_id INTEGER, -- NULL: global (all owners), INTEGER: owner-specific
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_field_type CHECK (type IN ('text', 'number', 'date', 'select', 'boolean', 'textarea', 'signature', 'image'))
);

CREATE INDEX idx_global_field_definitions_module ON global_field_definitions(module);
CREATE INDEX idx_global_field_definitions_owner_id ON global_field_definitions(owner_id);
CREATE INDEX idx_global_field_definitions_field_key ON global_field_definitions(field_key);

-- Field dependencies table (conditional field visibility/dependencies)
CREATE TABLE field_dependencies (
    id SERIAL PRIMARY KEY,
    field_definition_id INTEGER NOT NULL,
    depends_on_field_key VARCHAR(100) NOT NULL, -- Field that this field depends on
    condition_type VARCHAR(50) NOT NULL, -- 'equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in'
    condition_value JSONB NOT NULL, -- Value(s) to check against
    action VARCHAR(50) NOT NULL, -- 'show', 'hide', 'enable', 'disable', 'set_required', 'set_optional'
    FOREIGN KEY (field_definition_id) REFERENCES global_field_definitions(id) ON DELETE CASCADE,
    CONSTRAINT chk_condition_type CHECK (condition_type IN ('equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in', 'is_empty', 'is_not_empty')),
    CONSTRAINT chk_action CHECK (action IN ('show', 'hide', 'enable', 'disable', 'set_required', 'set_optional'))
);

CREATE INDEX idx_field_dependencies_field_definition_id ON field_dependencies(field_definition_id);
CREATE INDEX idx_field_dependencies_depends_on ON field_dependencies(depends_on_field_key);

-- =====================================================
-- 2. UNIFIED CUSTOM FIELD VALUES (Generic Custom Fields)
-- =====================================================

-- Generic custom field values table (replaces module-specific custom field tables)
-- Bu tablo, tüm modüller için custom field değerlerini saklar
CREATE TABLE custom_field_values (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'customer', 'sale', 'purchase', 'expense', 'revenue', 'employee', 'supplier'
    entity_id VARCHAR(50) NOT NULL, -- Entity ID (product_id, customer_id, etc.)
    field_definition_id INTEGER NOT NULL,
    value JSONB NOT NULL, -- Field value (any type)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_definition_id) REFERENCES global_field_definitions(id) ON DELETE CASCADE,
    UNIQUE (entity_type, entity_id, field_definition_id)
);

CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_field_definition ON custom_field_values(field_definition_id);
CREATE INDEX idx_custom_field_values_entity_type ON custom_field_values(entity_type);

-- =====================================================
-- 3. MODULE CONFIGURATION (Dynamic Module Settings)
-- =====================================================

-- Module configurations table (module-specific settings)
CREATE TABLE module_configurations (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL,
    owner_id INTEGER, -- NULL: global config, INTEGER: owner-specific config
    configuration_key VARCHAR(100) NOT NULL,
    configuration_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (module_id, owner_id, configuration_key)
);

CREATE INDEX idx_module_configurations_module ON module_configurations(module_id, owner_id);

-- Module field configurations (which fields are visible/editable in a module)
CREATE TABLE module_field_configurations (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL, -- Field name (e.g., 'name', 'price', 'stock')
    is_visible BOOLEAN DEFAULT TRUE,
    is_editable BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    owner_id INTEGER, -- NULL: global config, INTEGER: owner-specific config
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (module_id, field_key, owner_id)
);

CREATE INDEX idx_module_field_configurations_module ON module_field_configurations(module_id, owner_id);

-- =====================================================
-- 4. LIST & DETAIL VIEW CONFIGURATIONS
-- =====================================================

-- List view configurations (which fields to show in list views)
CREATE TABLE list_view_configurations (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL,
    owner_id INTEGER NOT NULL,
    view_name VARCHAR(100), -- 'default', 'compact', 'detailed', etc.
    field_keys JSONB NOT NULL, -- Array of field keys to display: ['name', 'price', 'stock']
    column_widths JSONB, -- {field_key: width} for responsive layouts
    sort_field VARCHAR(100),
    sort_direction VARCHAR(10) DEFAULT 'DESC', -- 'ASC' or 'DESC'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (module_id, owner_id, view_name) WHERE is_default = TRUE
);

CREATE INDEX idx_list_view_configurations_module ON list_view_configurations(module_id, owner_id);

-- Detail view configurations (which fields to show in detail views)
CREATE TABLE detail_view_configurations (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL,
    owner_id INTEGER NOT NULL,
    view_name VARCHAR(100), -- 'default', 'full', 'summary', etc.
    field_groups JSONB NOT NULL, -- [{group: 'Basic Info', fields: ['name', 'price']}, {group: 'Details', fields: ['stock', 'category']}]
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (module_id, owner_id, view_name) WHERE is_default = TRUE
);

CREATE INDEX idx_detail_view_configurations_module ON detail_view_configurations(module_id, owner_id);

-- =====================================================
-- 5. WORKFLOW & STATE MANAGEMENT
-- =====================================================

-- Entity states table (for workflow management)
CREATE TABLE entity_states (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'expense', etc.
    state_key VARCHAR(50) NOT NULL, -- 'draft', 'pending', 'approved', 'completed', 'cancelled'
    state_label VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_initial BOOLEAN DEFAULT FALSE, -- Initial state for new entities
    is_final BOOLEAN DEFAULT FALSE, -- Final state (cannot transition from)
    owner_id INTEGER, -- NULL: global states, INTEGER: owner-specific states
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entity_type, state_key, owner_id)
);

CREATE INDEX idx_entity_states_entity_type ON entity_states(entity_type, owner_id);

-- State transitions table (allowed state transitions)
CREATE TABLE state_transitions (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    from_state_key VARCHAR(50) NOT NULL,
    to_state_key VARCHAR(50) NOT NULL,
    transition_label VARCHAR(100) NOT NULL,
    required_permission VARCHAR(100), -- Permission required to make this transition
    owner_id INTEGER, -- NULL: global transitions, INTEGER: owner-specific transitions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_type, from_state_key, owner_id) REFERENCES entity_states(entity_type, state_key, owner_id),
    FOREIGN KEY (entity_type, to_state_key, owner_id) REFERENCES entity_states(entity_type, state_key, owner_id),
    UNIQUE (entity_type, from_state_key, to_state_key, owner_id)
);

CREATE INDEX idx_state_transitions_entity_type ON state_transitions(entity_type, owner_id);

-- Entity state history (track state changes)
CREATE TABLE entity_state_history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    from_state_key VARCHAR(50),
    to_state_key VARCHAR(50) NOT NULL,
    changed_by INTEGER,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_entity_state_history_entity ON entity_state_history(entity_type, entity_id);
CREATE INDEX idx_entity_state_history_created_at ON entity_state_history(created_at);

-- =====================================================
-- 6. AUDIT LOGGING (Change Tracking)
-- =====================================================

-- Audit log table (track all changes to entities)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'state_change', 'permission_change'
    changed_by INTEGER,
    changes JSONB, -- {field: {old: value, new: value}}
    metadata JSONB, -- Additional metadata (IP address, user agent, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- 7. SOFT DELETE SUPPORT
-- =====================================================

-- Soft delete metadata table (for entities that support soft delete)
CREATE TABLE soft_deletes (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    deleted_by INTEGER,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restore_reason TEXT,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (entity_type, entity_id)
);

CREATE INDEX idx_soft_deletes_entity ON soft_deletes(entity_type, entity_id);
CREATE INDEX idx_soft_deletes_deleted_at ON soft_deletes(deleted_at);

-- =====================================================
-- 8. NOTIFICATION SYSTEM
-- =====================================================

-- Notification templates table
CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    variables JSONB, -- Available variables: {sale_total, customer_name, etc.}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_templates_module ON notification_templates(module);
CREATE INDEX idx_notification_templates_type ON notification_templates(type);

-- User notifications table
CREATE TABLE user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    template_key VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_key) REFERENCES notification_templates(template_key) ON DELETE SET NULL
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id, is_read);
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    module VARCHAR(50),
    notification_type VARCHAR(50) NOT NULL, -- 'low_stock', 'daily_report', 'debt_collection', etc.
    enabled BOOLEAN DEFAULT TRUE,
    channels JSONB DEFAULT '[]', -- ['email', 'sms', 'push', 'in_app']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, module, notification_type)
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =====================================================
-- 9. MULTI-CURRENCY & EXCHANGE RATES
-- =====================================================

-- Currency exchange rates table
CREATE TABLE currency_exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL, -- 'TRY', 'USD', 'EUR'
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    effective_date DATE NOT NULL,
    source VARCHAR(100), -- 'manual', 'api', 'bank'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (base_currency, target_currency, effective_date)
);

CREATE INDEX idx_currency_exchange_rates_base ON currency_exchange_rates(base_currency, effective_date);
CREATE INDEX idx_currency_exchange_rates_target ON currency_exchange_rates(target_currency, effective_date);

-- User currency preferences
CREATE TABLE user_currency_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    default_currency VARCHAR(3) DEFAULT 'TRY',
    display_currency VARCHAR(3), -- Currency to display in UI (can be different from default)
    auto_convert BOOLEAN DEFAULT FALSE, -- Auto-convert amounts to display currency
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_default_currency CHECK (default_currency IN ('TRY', 'USD', 'EUR')),
    CONSTRAINT chk_display_currency CHECK (display_currency IN ('TRY', 'USD', 'EUR') OR display_currency IS NULL)
);

-- =====================================================
-- 10. MULTI-LANGUAGE SUPPORT
-- =====================================================

-- Translations table (for dynamic translations)
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    namespace VARCHAR(100) NOT NULL, -- 'common', 'sales', 'customers', etc.
    key VARCHAR(200) NOT NULL,
    language VARCHAR(10) NOT NULL, -- 'en', 'tr', etc.
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (namespace, key, language)
);

CREATE INDEX idx_translations_namespace_key ON translations(namespace, key);
CREATE INDEX idx_translations_language ON translations(language);

-- User language preferences
CREATE TABLE user_language_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    language VARCHAR(10) DEFAULT 'tr',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(20) DEFAULT '24h',
    number_format VARCHAR(20) DEFAULT 'tr_TR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 11. PURCHASE ITEMS TABLE (Bulk Purchases Support)
-- =====================================================

-- Purchase items table (for bulk purchases - multiple products in one purchase)
-- This table stores individual items in a bulk purchase
CREATE TABLE IF NOT EXISTS purchase_items (
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

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);

-- Add is_stock_purchase column to purchases table (for single item purchases)
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS is_stock_purchase BOOLEAN DEFAULT TRUE;

-- Make quantity and price nullable in purchases table (for bulk purchases)
-- These fields are only used for single item purchases
-- For bulk purchases, use purchase_items table
ALTER TABLE purchases 
ALTER COLUMN quantity DROP NOT NULL,
ALTER COLUMN price DROP NOT NULL;

-- Add comments to clarify usage
COMMENT ON COLUMN purchases.product_id IS 'NULL for bulk purchases (use purchase_items table)';
COMMENT ON COLUMN purchases.quantity IS 'NULL for bulk purchases (use purchase_items table)';
COMMENT ON COLUMN purchases.price IS 'NULL for bulk purchases (use purchase_items table)';
COMMENT ON COLUMN purchases.is_stock_purchase IS 'true = stok için alış, false = gider olarak kaydedilecek (for single item purchases)';
COMMENT ON COLUMN purchase_items.is_stock_purchase IS 'true = stok için alış, false = gider olarak kaydedilecek';

-- =====================================================
-- 12. FORM TEMPLATE ENHANCEMENTS
-- =====================================================

-- Add list_fields and detail_fields to form_templates table
ALTER TABLE form_templates 
ADD COLUMN IF NOT EXISTS list_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detail_fields JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS field_groups JSONB DEFAULT '[]'; -- Group fields in sections: [{group: 'Basic Info', fields: ['name', 'price']}]

-- =====================================================
-- 13. BUSINESS RULES & VALIDATION
-- =====================================================

-- Business rules table (for custom business logic)
CREATE TABLE business_rules (
    id SERIAL PRIMARY KEY,
    rule_key VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50),
    rule_name VARCHAR(200) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'validation', 'calculation', 'automation', 'notification'
    condition JSONB NOT NULL, -- {field: 'stock', operator: '<', value: 10}
    action JSONB NOT NULL, -- {type: 'set_field', field: 'is_low_stock', value: true}
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Execution order
    owner_id INTEGER, -- NULL: global rule, INTEGER: owner-specific rule
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_business_rules_module ON business_rules(module, owner_id);
CREATE INDEX idx_business_rules_rule_type ON business_rules(rule_type);

-- =====================================================
-- 14. DATA EXPORT & IMPORT TEMPLATES
-- =====================================================

-- Export/Import templates table
CREATE TABLE data_export_import_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    module VARCHAR(50) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'export', 'import'
    file_format VARCHAR(20) NOT NULL, -- 'csv', 'xlsx', 'json'
    field_mapping JSONB NOT NULL, -- {csv_column: 'db_field', ...}
    filters JSONB, -- Export filters (e.g., date range, status)
    owner_id INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_data_templates_module ON data_export_import_templates(module, owner_id);

-- =====================================================
-- 15. TRIGGERS FOR ENHANCED TABLES
-- =====================================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_global_field_definitions_updated_at BEFORE UPDATE ON global_field_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_configurations_updated_at BEFORE UPDATE ON module_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_field_configurations_updated_at BEFORE UPDATE ON module_field_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_list_view_configurations_updated_at BEFORE UPDATE ON list_view_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detail_view_configurations_updated_at BEFORE UPDATE ON detail_view_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_states_updated_at BEFORE UPDATE ON entity_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currency_exchange_rates_updated_at BEFORE UPDATE ON currency_exchange_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_currency_preferences_updated_at BEFORE UPDATE ON user_currency_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_language_preferences_updated_at BEFORE UPDATE ON user_language_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_rules_updated_at BEFORE UPDATE ON business_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_export_import_templates_updated_at BEFORE UPDATE ON data_export_import_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF ENHANCED SCHEMA
-- =====================================================

