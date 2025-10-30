import httpService from '../../../shared/services/httpService';
import { Customer } from '../store/customerStore';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export const customerService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Customer>>(`/customers${toQueryParams(req)}`),
};

export default customerService;


