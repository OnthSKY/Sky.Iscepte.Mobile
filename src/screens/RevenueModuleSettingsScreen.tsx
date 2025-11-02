/**
 * Revenue Module Settings Screen
 */

import { createModuleSettingsScreen } from '../shared/utils/createModuleSettingsScreen';

export default createModuleSettingsScreen({
  module: 'revenue',
  translationNamespace: 'revenue',
  moduleTitle: 'Gelirler',
  settings: [],
  defaultBackRoute: 'Settings',
});
