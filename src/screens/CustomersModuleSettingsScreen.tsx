/**
 * Customers Module Settings Screen
 */

import { createModuleSettingsScreen } from '../shared/utils/createModuleSettingsScreen';

export default createModuleSettingsScreen({
  module: 'customers',
  translationNamespace: 'customers',
  moduleTitle: 'Müşteriler',
  settings: [],
  defaultBackRoute: 'Settings',
});
