/**
 * Expenses Module Settings Screen
 */

import { createModuleSettingsScreen } from '../shared/utils/createModuleSettingsScreen';

export default createModuleSettingsScreen({
  module: 'expenses',
  translationNamespace: 'expenses',
  moduleTitle: 'Giderler',
  settings: [],
  defaultBackRoute: 'Settings',
});
