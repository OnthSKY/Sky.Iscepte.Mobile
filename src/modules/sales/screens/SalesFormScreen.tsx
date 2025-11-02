/**
 * SalesFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View, Text, Platform } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Sale, SalesCustomField } from '../store/salesStore';
import { salesFormFields, salesValidator } from '../config/salesFormConfig';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';
import { useCustomersQuery } from '../../customers/hooks/useCustomersQuery';
import Input from '../../../shared/components/Input';
import { Form, FormField, FormRow } from '../../../shared/components/Form';
import { formatDate } from '../../../core/utils/dateUtils';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Modal from '../../../shared/components/Modal';
import spacing from '../../../core/constants/spacing';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import globalFieldsService from '../services/globalFieldsService';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';

interface SalesFormScreenProps {
  mode?: 'create' | 'edit';
}

// Date Picker Modal Component
function DatePickerModalComponent({
  visible,
  onClose,
  value,
  onConfirm,
  colors,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  value: string;
  onConfirm: (date: string) => void;
  colors: any;
  t: (key: string) => string;
}) {
  const [tempDate, setTempDate] = useState(value || formatDate(new Date()));
  
  React.useEffect(() => {
    if (visible) {
      setTempDate(value || formatDate(new Date()));
    }
  }, [visible, value]);
  
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            {t('date')}
          </Text>
          <input
            type="date"
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.md,
              fontSize: 16,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: 8,
                backgroundColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(tempDate)}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: '#fff' }}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          {t('date')}
        </Text>
        <Input
          value={tempDate}
          onChangeText={(text) => {
            // Format as YYYY-MM-DD
            const cleaned = text.replace(/[^\d-]/g, '');
            if (cleaned.length <= 10) {
              let formatted = cleaned;
              if (cleaned.length > 4 && cleaned[4] !== '-') {
                formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
              }
              if (cleaned.length > 7 && formatted[7] !== '-') {
                formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
              }
              setTempDate(formatted);
            }
          }}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
        />
        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 8,
              backgroundColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text }}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onConfirm(tempDate)}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: '#fff' }}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Time Picker Modal Component
function TimePickerModalComponent({
  visible,
  onClose,
  value,
  onConfirm,
  colors,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  value: string;
  onConfirm: (time: string) => void;
  colors: any;
  t: (key: string) => string;
}) {
  const [tempTime, setTempTime] = useState(value || '');
  
  React.useEffect(() => {
    if (visible) {
      setTempTime(value || '');
    }
  }, [visible, value]);
  
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            {t('time')}
          </Text>
          <input
            type="time"
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.md,
              fontSize: 16,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: 8,
                backgroundColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(tempTime)}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: '#fff' }}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          {t('time')}
        </Text>
        <Input
          value={tempTime}
          onChangeText={(text) => {
            // Format as HH:mm
            const cleaned = text.replace(/[^\d:]/g, '');
            if (cleaned.length <= 5) {
              let formatted = cleaned;
              if (cleaned.length > 2 && cleaned[2] !== ':') {
                formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
              }
              setTempTime(formatted);
            }
          }}
          placeholder="HH:mm"
          keyboardType="numeric"
        />
        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 8,
              backgroundColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text }}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onConfirm(tempTime)}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: '#fff' }}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SalesFormScreen({ mode }: SalesFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation('sales');
  const { colors } = useTheme();
  
  // State for date/time pickers
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  
  // Global fields state
  const [globalFields, setGlobalFields] = useState<SalesCustomField[]>([]);
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');
  
  // Load global fields on mount
  useEffect(() => {
    const loadGlobalFields = async () => {
      try {
        const fields = await globalFieldsService.getAll();
        setGlobalFields(fields);
      } catch (error) {
        console.error('Failed to load global fields:', error);
      }
    };
    loadGlobalFields();
  }, []);
  
  // Handle global fields change
  const handleGlobalFieldsChange = async (fields: SalesCustomField[]) => {
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
    } catch (error) {
      console.error('Failed to save global fields:', error);
    }
  };

  // Default values for create mode
  const getInitialData = (): Partial<Sale> => {
    return getInitialDataWithCustomFields<Sale>(formMode, {
      date: formatDate(new Date()),
    });
  };

  // Enhanced validator for required global custom fields
  const enhancedValidator = createEnhancedValidator<Sale>(
    salesValidator,
    globalFields,
    'sales'
  );

  // Fetch products and customers for select fields
  const { data: productsData } = useProductsQuery();
  const { data: customersData } = useCustomersQuery();

  // Prepare form fields with dynamic options (excluding date and notes fields which are rendered separately)
  const fieldsWithOptions = useMemo(() => {
    const products = productsData?.items || [];
    const customers = customersData?.items || [];

    return salesFormFields
      .filter(field => field.name !== 'date') // Exclude date - rendered separately with time
      .map(field => {
        if (field.name === 'productId') {
          return {
            ...field,
            options: products.map((p: any) => ({
              label: `${p.name} (Stok: ${p.stock ?? 0})`,
              value: String(p.id),
            })),
          };
        }
        if (field.name === 'customerId') {
          return {
            ...field,
            options: customers.map((c: any) => ({
              label: c.name || c.email || `Müşteri ${c.id}`,
              value: String(c.id),
            })),
          };
        }
        return field;
      });
  }, [productsData, customersData]);

  return (
    <FormScreenContainer
      service={salesEntityService}
      config={{
        entityName: 'sale',
        translationNamespace: 'sales',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={enhancedValidator}
      renderForm={(formData, updateField, errors) => {
        // Get products for price lookup (closure over component scope)
        const products = productsData?.items || [];
        
        // Use formData's customFields directly or empty array
        const customFields = (formData.customFields as SalesCustomField[]) || [];

        const handleCustomFieldsChange = (fields: SalesCustomField[]) => {
          updateField('customFields' as keyof Sale, fields);
        };
        
        // Parse date and time from formData.date (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD")
        // For create mode, default to today's date for display if not set
        const todayDate = formatDate(new Date());
        const currentDate = formData.date || '';
        const displayDate = currentDate || (formMode === 'create' ? todayDate : '');
        
        const [dateValue, timeValue] = useMemo(() => {
          if (!displayDate) return ['', ''];
          const parts = displayDate.split(' ');
          return [parts[0] || displayDate, parts[1] || ''];
        }, [displayDate]);
        
        return (
          <View style={{ gap: spacing.md }}>
            <Form>
            <DynamicForm
              namespace="sales"
              columns={2}
              fields={fieldsWithOptions}
              values={formData}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  const newValue = (v as any)[key];
                  updateField(key as keyof Sale, newValue);
                  
                  // Auto-fill price when product is selected
                  if (key === 'productId' && newValue) {
                    const selectedProduct = products.find((p: any) => String(p.id) === String(newValue));
                    if (selectedProduct && selectedProduct.price) {
                      // Only auto-fill if price is not already set or is 0
                      const currentPrice = formData.price || 0;
                      if (currentPrice === 0) {
                        updateField('price' as keyof Sale, selectedProduct.price);
                        // Auto-calculate amount if quantity is set
                        const currentQuantity = formData.quantity || 1;
                        if (currentQuantity > 0) {
                          const total = selectedProduct.price * currentQuantity;
                          updateField('amount' as keyof Sale, total);
                        }
                      }
                    }
                  }
                });
                
                // Auto-calculate amount when price or quantity changes (after all fields are updated)
                const updatedData = { ...formData, ...v };
                if (updatedData.price && updatedData.quantity) {
                  const price = updatedData.price as number;
                  const quantity = updatedData.quantity as number;
                  const total = price * quantity;
                  if (updatedData.amount !== total) {
                    updateField('amount' as keyof Sale, total);
                  }
                }
              }}
            />
            
            {/* Date and Time Section */}
            <FormRow columns={2}>
              <FormField label={t('date')} required>
                <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                  <Input
                    value={dateValue}
                    editable={false}
                    pointerEvents="none"
                    placeholder={formMode === 'create' && !currentDate ? todayDate : "YYYY-MM-DD"}
                    style={{ backgroundColor: colors.surface }}
                  />
                </TouchableOpacity>
              </FormField>
              <FormField label={t('time')}>
                <TouchableOpacity onPress={() => setTimePickerVisible(true)}>
                  <Input
                    value={timeValue}
                    editable={false}
                    pointerEvents="none"
                    placeholder="HH:mm (opsiyonel)"
                    style={{ backgroundColor: colors.surface }}
                  />
                </TouchableOpacity>
              </FormField>
            </FormRow>
            
            {/* Date Picker Modal */}
            <DatePickerModalComponent
              visible={datePickerVisible}
              onClose={() => setDatePickerVisible(false)}
              value={dateValue || (formMode === 'create' ? todayDate : '')}
              onConfirm={(date: string) => {
                const timePart = timeValue || '';
                const newDateValue = timePart ? `${date} ${timePart}`.trim() : date;
                updateField('date' as keyof Sale, newDateValue);
                setDatePickerVisible(false);
              }}
              colors={colors}
              t={t}
            />
            
            {/* Time Picker Modal */}
            <TimePickerModalComponent
              visible={timePickerVisible}
              onClose={() => setTimePickerVisible(false)}
              value={timeValue}
              onConfirm={(time: string) => {
                const datePart = dateValue || (formMode === 'create' ? todayDate : '');
                if (time) {
                  updateField('date' as keyof Sale, `${datePart} ${time}`.trim());
                } else {
                  updateField('date' as keyof Sale, datePart || '');
                }
                setTimePickerVisible(false);
              }}
              colors={colors}
              t={t}
            />
            
            {/* Notes Field - Full Width and More Prominent */}
            <FormRow columns={1}>
              <FormField label={t('notes')}>
                <Input
                  value={formData.title || ''}
                  onChangeText={(text) => updateField('title' as keyof Sale, text)}
                  multiline
                  numberOfLines={6}
                  style={{ 
                    textAlignVertical: 'top',
                    minHeight: 120,
                    fontSize: 16,
                    fontWeight: '400',
                    borderWidth: 2,
                    borderColor: colors.primary + '40',
                    paddingTop: 16,
                    paddingBottom: 16,
                    paddingHorizontal: 16,
                    color: colors.text, // Explicit color for dark theme
                  }}
                  placeholder={t('notes')}
                />
              </FormField>
            </FormRow>
            
            </Form>
            
            {/* Custom Fields Section */}
            <Card>
              <CustomFieldsManager<SalesCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                availableGlobalFields={globalFields}
                onGlobalFieldsChange={handleGlobalFieldsChange}
                module="sales"
              />
            </Card>
          </View>
        );
      }}
    />
  );
}

