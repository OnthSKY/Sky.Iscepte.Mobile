import { createGlobalFieldsService } from "../../../core/services/globalFieldsServiceFactory";
import { EmployeeCustomField } from "../store/employeeStore";

const globalFieldsService = createGlobalFieldsService<EmployeeCustomField>('employee_global_fields');

export default globalFieldsService;
