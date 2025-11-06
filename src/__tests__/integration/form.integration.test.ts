/**
 * Form Integration Tests
 * 
 * Tests form submission flows including:
 * - Form validation
 * - Form submission with valid data
 * - Form submission with invalid data
 * - Error handling
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import DynamicForm, { DynamicField } from '../../shared/components/DynamicForm';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
  }),
}));

describe('Form Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{component}</NavigationContainer>
      </QueryClientProvider>
    );
  };

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const fields: DynamicField[] = [
        {
          name: 'name',
          labelKey: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          labelKey: 'email',
          type: 'text',
          required: true,
        },
      ];

      const onSubmit = jest.fn();
      const { getByText } = renderWithProviders(
        <DynamicForm
          namespace="test"
          fields={fields}
          values={{}}
          onChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const submitButton = getByText(/submit|gönder/i);
      fireEvent.press(submitButton);

      // Should not submit with invalid data
      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('should submit form with valid data', async () => {
      const fields: DynamicField[] = [
        {
          name: 'name',
          labelKey: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          labelKey: 'email',
          type: 'text',
          required: true,
        },
      ];

      const onSubmit = jest.fn();
      const onChange = jest.fn();

      const { getByPlaceholderText, getByText } = renderWithProviders(
        <DynamicForm
          namespace="test"
          fields={fields}
          values={{ name: 'Test User', email: 'test@example.com' }}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );

      const submitButton = getByText(/submit|gönder/i);
      fireEvent.press(submitButton);

      // Should submit with valid data
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Form Field Types', () => {
    it('should handle text input', async () => {
      const fields: DynamicField[] = [
        {
          name: 'name',
          labelKey: 'name',
          type: 'text',
        },
      ];

      const onChange = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <DynamicForm
          namespace="test"
          fields={fields}
          values={{}}
          onChange={onChange}
        />
      );

      const input = getByPlaceholderText(/name/i);
      fireEvent.changeText(input, 'Test Name');

      expect(onChange).toHaveBeenCalledWith({ name: 'Test Name' });
    });

    it('should handle number input', async () => {
      const fields: DynamicField[] = [
        {
          name: 'price',
          labelKey: 'price',
          type: 'number',
        },
      ];

      const onChange = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <DynamicForm
          namespace="test"
          fields={fields}
          values={{}}
          onChange={onChange}
        />
      );

      const input = getByPlaceholderText(/price/i);
      fireEvent.changeText(input, '100');

      expect(onChange).toHaveBeenCalledWith({ price: '100' });
    });

    it('should handle date input', async () => {
      const fields: DynamicField[] = [
        {
          name: 'date',
          labelKey: 'date',
          type: 'date',
        },
      ];

      const onChange = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <DynamicForm
          namespace="test"
          fields={fields}
          values={{}}
          onChange={onChange}
        />
      );

      const input = getByPlaceholderText(/date/i);
      fireEvent.changeText(input, '2024-01-01');

      expect(onChange).toHaveBeenCalledWith({ date: '2024-01-01' });
    });
  });
});

