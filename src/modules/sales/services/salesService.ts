import httpService from '../../../shared/services/httpService';
import { Sale } from '../store/salesStore';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export const salesService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Sale>>(`/products${toQueryParams(req)}`),
};

export default salesService;


