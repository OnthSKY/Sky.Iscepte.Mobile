/**
 * Purchases Module Settings Screen
 */

import { createModuleSettingsScreen } from '../shared/utils/createModuleSettingsScreen';

export default createModuleSettingsScreen({
  module: 'purchases',
  translationNamespace: 'purchases',
  moduleTitle: 'Alışlar',
  settings: [],
  defaultBackRoute: 'Settings',
});
