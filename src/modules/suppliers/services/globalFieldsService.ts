import { createGlobalFieldsService } from "../../../core/services/globalFieldsServiceFactory";
import { SupplierCustomField } from "../store/supplierStore";

const globalFieldsService = createGlobalFieldsService<SupplierCustomField>('supplier_global_fields');

export default globalFieldsService;
