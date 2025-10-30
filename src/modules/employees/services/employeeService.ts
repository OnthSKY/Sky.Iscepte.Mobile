import httpService from '../../../shared/services/httpService';
import { Employee } from '../store/employeeStore';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export const employeeService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Employee>>(`/users${toQueryParams(req)}`),
};

export default employeeService;


