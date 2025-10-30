import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DEFAULT_USER_PACKAGE, PACKAGE_LABELS, type UserPackage } from '../../core/constants/packages';

type Props = {
  variant?: 'owner' | 'staff' | 'admin';
  style?: ViewStyle;
  showCompany?: boolean;
};

export default function DashboardTopBar({ variant = 'owner', style, showCompany = true }: Props) {
  const { colors } = useTheme();
  const user: any = useAppStore((s: any) => s.user);
  const role = useAppStore((s: any) => s.role);
  const roleLabel = (typeof role === 'string' ? role : 'guest') || 'guest';
  const userName = user?.name || 'Kullanıcı';
  const companyName = user?.company || 'Şirketiniz';
  const userPackage: UserPackage = (user?.package as UserPackage) || DEFAULT_USER_PACKAGE;
  const packageLabel = PACKAGE_LABELS[userPackage];

  const showPackage = variant !== 'admin';

  return (
    <View style={[{ width: '100%' }, style]}> 
      <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
        {userName}
      </Text>
      {showCompany && (
        <Text style={{ color: '#E2E8F0', fontSize: 13 }} numberOfLines={1}>
          {companyName}
        </Text>
      )}
      <View style={{ marginTop: 10, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
          <Ionicons name="person-outline" size={14} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12, marginLeft: 6 }}>{roleLabel}</Text>
        </View>
        {showPackage && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
            <Ionicons name="star-outline" size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12, marginLeft: 6 }}>{packageLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}


