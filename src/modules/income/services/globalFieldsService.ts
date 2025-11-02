import { createGlobalFieldsService } from "../../../core/services/globalFieldsServiceFactory";
import { IncomeCustomField } from "../store/incomeStore";

const globalFieldsService = createGlobalFieldsService<IncomeCustomField>('income_global_fields');

export default globalFieldsService;
