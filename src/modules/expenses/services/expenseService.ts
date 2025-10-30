import httpService from '../../../shared/services/httpService';
import { Expense } from '../store/expenseStore';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export const expenseService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Expense>>(`/expenses${toQueryParams(req)}`),
};

export default expenseService;


