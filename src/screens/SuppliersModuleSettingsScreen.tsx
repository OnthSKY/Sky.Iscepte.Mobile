/**
 * Suppliers Module Settings Screen
 */

import { createModuleSettingsScreen } from '../shared/utils/createModuleSettingsScreen';

export default createModuleSettingsScreen({
  module: 'suppliers',
  translationNamespace: 'suppliers',
  moduleTitle: 'Tedarikçiler',
  settings: [],
  defaultBackRoute: 'Settings',
});
