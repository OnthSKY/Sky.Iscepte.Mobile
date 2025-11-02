import { createGlobalFieldsService } from "../../../core/services/globalFieldsServiceFactory";
import { ExpenseCustomField } from "../store/expenseStore";

const globalFieldsService = createGlobalFieldsService<ExpenseCustomField>('expense_global_fields');

export default globalFieldsService;
