/**
 * Sales Module Settings Screen
 */

import { createModuleSettingsScreen } from '../shared/utils/createModuleSettingsScreen';

export default createModuleSettingsScreen({
  module: 'sales',
  translationNamespace: 'sales',
  moduleTitle: 'Satışlar',
  settings: [],
  defaultBackRoute: 'Settings',
});
