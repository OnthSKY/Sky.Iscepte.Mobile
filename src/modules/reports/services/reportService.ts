import httpService from '../../../shared/services/httpService';
import { Report } from '../store/reportStore';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export const reportService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Report>>(`/modules${toQueryParams(req)}`),
};

export default reportService;


