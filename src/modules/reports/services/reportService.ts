import httpService from '../../../shared/services/httpService';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
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
    httpService.get<Paginated<Report>>(`${apiEndpoints.modules.list}${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Report>(apiEndpoints.modules.get(id)),

  stats: () => httpService.get<ReportStats>(apiEndpoints.reports.stats),

  create: (payload: Partial<Report>) =>
    httpService.post<Report>(apiEndpoints.modules.list, payload),

  update: (id: string, payload: Partial<Report>) =>
    httpService.put<Report>(apiEndpoints.modules.get(id), payload),

  remove: (id: string) => httpService.delete<void>(apiEndpoints.modules.get(id)),
};

export default reportService;


