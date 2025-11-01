/**
 * Screen Factory Utilities
 * Factory Pattern: Creates screen components based on configuration
 * Open/Closed: Easy to extend with new screen types
 */

import { BaseEntity } from '../types/screen.types';
import { BaseEntityService } from '../services/baseEntityService.types';
import { ListScreenContainer } from '../../shared/components/screens/ListScreenContainer';
import { DetailScreenContainer } from '../../shared/components/screens/DetailScreenContainer';
import { FormScreenContainer } from '../../shared/components/screens/FormScreenContainer';

/**
 * Factory for creating list screens
 */
export function createListScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: {
    entityName: string;
    translationNamespace: string;
    defaultPageSize?: number;
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
    title?: string;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  }
) {
  return function ListScreen() {
    return (
      <ListScreenContainer
        service={service}
        config={{
          entityName: config.entityName,
          translationNamespace: config.translationNamespace,
          defaultPageSize: config.defaultPageSize,
        }}
        renderItem={config.renderItem}
        keyExtractor={config.keyExtractor}
        title={config.title}
        emptyStateTitle={config.emptyStateTitle}
        emptyStateSubtitle={config.emptyStateSubtitle}
      />
    );
  };
}

/**
 * Factory for creating detail screens
 */
export function createDetailScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: {
    entityName: string;
    translationNamespace: string;
    renderContent: (data: T) => React.ReactNode;
    title?: string;
    showEditButton?: boolean;
    showDeleteButton?: boolean;
  }
) {
  return function DetailScreen() {
    return (
      <DetailScreenContainer
        service={service}
        config={{
          entityName: config.entityName,
          translationNamespace: config.translationNamespace,
        }}
        renderContent={config.renderContent}
        title={config.title}
        showEditButton={config.showEditButton}
        showDeleteButton={config.showDeleteButton}
      />
    );
  };
}

/**
 * Factory for creating form screens
 */
export function createFormScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: {
    entityName: string;
    translationNamespace: string;
    mode: 'create' | 'edit';
    validator?: (data: Partial<T>) => Record<string, string>;
    renderForm: (formData: Partial<T>, updateField: (field: keyof T, value: any) => void, errors: Record<string, string>) => React.ReactNode;
    title?: string;
  }
) {
  return function FormScreen() {
    return (
      <FormScreenContainer
        service={service}
        config={{
          entityName: config.entityName,
          translationNamespace: config.translationNamespace,
          mode: config.mode,
        }}
        validator={config.validator}
        renderForm={config.renderForm}
        title={config.title}
      />
    );
  };
}

