import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from './Input';
import Select from './Select';
import { Form, FormField, FormRow } from './Form';
import spacing from '../../core/constants/spacing';

export type DynamicFieldType = 'text' | 'number' | 'textarea' | 'select' | 'date' | 'custom';

export type DynamicFieldOption = { label: string; value: string };

export type DynamicField = {
  name: string;
  labelKey: string; // i18n key
  type: DynamicFieldType;
  placeholderKey?: string; // i18n key
  options?: DynamicFieldOption[]; // for select
  required?: boolean;
  multiline?: boolean; // override for textarea
  render?: (value: any, onChange: (v: any) => void) => React.ReactNode; // for custom type
};

type DynamicFormProps<T extends Record<string, any>> = {
  fields: DynamicField[];
  values: T;
  onChange: (values: T) => void;
  columns?: 1 | 2 | 3;
  namespace?: string; // i18n namespace for labels
};

export default function DynamicForm<T extends Record<string, any>>({
  fields,
  values,
  onChange,
  columns = 2,
  namespace,
}: DynamicFormProps<T>) {
  const { t } = useTranslation(namespace);

  const grouped = useMemo(() => {
    // Simple grouping by pairs for columns; renderer handles responsiveness
    const result: DynamicField[][] = [];
    for (let i = 0; i < fields.length; i += columns) {
      result.push(fields.slice(i, i + columns));
    }
    return result;
  }, [fields, columns]);

  const setValue = (name: string, value: any) => {
    onChange({ ...(values as any), [name]: value });
  };

  return (
    <Form>
      {grouped.map((row, idx) => (
        <FormRow key={idx} columns={columns}>
          {row.map((field) => (
            <FormField key={field.name} label={t(field.labelKey)} required={field.required}>
              {renderField(field, values[field.name], (v) => setValue(field.name, v), t)}
            </FormField>
          ))}
        </FormRow>
      ))}
    </Form>
  );
}

function renderField(
  field: DynamicField,
  value: any,
  onChange: (v: any) => void,
  t: (k: string) => string
) {
  const common = {
    placeholder: field.placeholderKey ? t(field.placeholderKey) : t(field.labelKey),
  } as const;

  switch (field.type) {
    case 'custom':
      return field.render ? field.render(value, onChange) : null;
    case 'number':
      return (
        <Input
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          {...common}
        />
      );
    case 'textarea':
      return (
        <Input
          value={value}
          onChangeText={onChange}
          multiline
          numberOfLines={4}
          style={{ textAlignVertical: 'top' }}
          {...common}
        />
      );
    case 'select':
      return (
        <Select
          value={value}
          options={field.options || []}
          placeholder={common.placeholder}
          onChange={onChange}
        />
      );
    case 'date':
      return (
        <Input
          value={value}
          onChangeText={onChange}
          placeholder={common.placeholder}
        />
      );
    case 'text':
    default:
      return <Input value={value} onChangeText={onChange} {...common} />;
  }
}


