/**
 * Jest Setup File
 * 
 * This file runs before each test file
 */

import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        API_URL: 'https://api.example.com',
        DEFAULT_LOCALE: 'tr',
        DEFAULT_THEME: 'light',
        APP_MODE: 'mock',
      },
    },
  },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    })
  ),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    Pressable: View,
    FlatList: View,
    GestureHandlerRootView: View,
    GestureDetector: View,
    gestureHandlerRootHOC: jest.fn((x) => x),
    Directions: {},
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
  configure: jest.fn(),
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock i18n
jest.mock('./src/i18n', () => ({
  t: (key, options) => {
    if (options?.defaultValue) return options.defaultValue;
    return key;
  },
  changeLanguage: jest.fn(),
  language: 'tr',
}));

