import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppStore } from '../../store/useAppStore';

export default function ThemeGradientToggle() {
  const themePreference = useAppStore((s) => s.themePreference);
  const setTheme = useAppStore((s) => s.setTheme);

  const isDark = useMemo(() => themePreference === 'dark', [themePreference]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 44, justifyContent: 'center' }}>
        {/* Faux gradient background using layered views (no deps) */}
        <View style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: isDark ? '#2c3e50' : '#4a6cf7'
        }} />
        <View style={{
          position: 'absolute', left: -40, right: -40, top: 0, bottom: 0,
          transform: [{ rotate: '7deg' }],
          backgroundColor: isDark ? '#4b6584' : '#6f8df9', opacity: 0.9
        }} />
        <View style={{
          position: 'absolute', left: -80, right: -80, top: 0, bottom: 0,
          transform: [{ rotate: '-8deg' }],
          backgroundColor: isDark ? '#1e272e' : '#a1b2fc', opacity: 0.6
        }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>{isDark ? 'Dark Theme' : 'Light Theme'}</Text>
          <View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.35)', padding: 3 }}>
            <View style={{
              width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
              transform: [{ translateX: isDark ? 20 : 0 }]
            }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


