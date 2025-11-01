import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Report {
  id: string;
  title?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ReportStats {
  totalReports: number;
  monthlyReports: number;
  completedReports: number;
  pendingReports: number;
}

export const reportService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Report>>(`/modules${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Report>(`/modules/${id}`),

  stats: () => httpService.get<ReportStats>(`/reports/stats`),

  create: (payload: Partial<Report>) =>
    httpService.post<Report>('/modules', payload),

  update: (id: string, payload: Partial<Report>) =>
    httpService.put<Report>(`/modules/${id}`, payload),

  remove: (id: string) => httpService.delete<void>(`/modules/${id}`),
};

export default reportService;


