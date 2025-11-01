import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Employee {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
}

export const employeeService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Employee>>(`/users${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Employee>(`/users/${id}`),

  stats: () => httpService.get<EmployeeStats>(`/employees/stats`),

  create: (payload: Partial<Employee>) =>
    httpService.post<Employee>('/users', payload),

  update: (id: string, payload: Partial<Employee>) =>
    httpService.put<Employee>(`/users/${id}`, payload),

  remove: (id: string) => httpService.delete<void>(`/users/${id}`),
};

export default employeeService;


