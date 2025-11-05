import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Role } from '../../core/config/appConstants';

/**
 * Shows a permission alert and redirects OWNER role users to packages screen
 * @param role - User's role
 * @param permission - Permission string (e.g., "sales:create", "customers:edit")
 * @param module - Module name for translation (optional, extracted from permission if not provided)
 * @param action - Action name for translation (optional, extracted from permission if not provided)
 */
export const showPermissionAlert = (
  role: Role,
  permission: string,
  navigation: any,
  t: (key: string, options?: any) => string,
  module?: string,
  action?: string
) => {
  // Extract module and action from permission if not provided
  const [permModule, permAction] = permission.split(':');
  const finalModule = module || permModule;
  const finalAction = action || permAction;

  const message = role === Role.OWNER
    ? t('packages:required_permission', {
        defaultValue: 'Bu özelliği kullanmak için {{module}}:{{permission}} yetkisine ihtiyacınız var. Paketinizi yükseltmek ister misiniz?',
        module: finalModule,
        permission: finalAction
      })
    : t('common:permission_message', {
        defaultValue: 'Bu özelliği kullanmanız için {{module}}:{{permission}} yetkisini satın almalısınız',
        module: finalModule,
        permission: finalAction
      });

  Alert.alert(
    t('common:permission_required', { defaultValue: 'Yetki Gerekli' }),
    message,
    role === Role.OWNER ? [
      { text: t('packages:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
      {
        text: t('packages:upgrade_to_use', { defaultValue: 'Paket Yükselt' }),
        onPress: () => navigation.navigate('Packages'),
      },
    ] : [{ text: t('common:ok', { defaultValue: 'Tamam' }) }]
  );
};
