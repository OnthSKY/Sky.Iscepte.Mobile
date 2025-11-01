/**
 * Report Service Adapter
 * Adapts reportService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { reportService } from './reportService';
import { Report } from '../store/reportStore';
import httpService from '../../../shared/services/httpService';

// Extend report service with missing methods
const extendedReportService = {
  list: reportService.list,
  get: async (id: string): Promise<Report | null> => {
    try {
      const response = await httpService.get<Report>(`/reports/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Report>): Promise<Report> => {
    return httpService.post<Report>('/reports', data);
  },
  update: async (id: string, data: Partial<Report>): Promise<Report> => {
    return httpService.put<Report>(`/reports/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/reports/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const reportEntityService = createBaseServiceAdapter<Report>(
  '/reports',
  extendedReportService
);

