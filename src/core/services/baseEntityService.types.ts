/**
 * Base entity service interfaces
 * Dependency Inversion: Services depend on these interfaces
 */

import { BaseEntity, ListQuery, ListResponse } from '../types/screen.types';

/**
 * Base interface for all entity services
 * Open/Closed: Can be extended without modification
 */
export interface BaseEntityService<T extends BaseEntity> {
  /**
   * Get a list of entities with pagination and filters
   */
  list(query: ListQuery): Promise<ListResponse<T>>;

  /**
   * Get a single entity by ID
   */
  get(id: string | number): Promise<T | null>;

  /**
   * Create a new entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string | number, data: Partial<T>): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: string | number): Promise<boolean>;
}

