/**
 * Expo App Configuration
 * Reads environment variables from .env files
 */

require('dotenv').config();

module.exports = {
  expo: {
    name: 'Sky.IsCep.Mobile',
    slug: 'Sky.IsCep.Mobile',
    version: process.env.APP_VERSION || '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      buildNumber: process.env.IOS_BUILD_NUMBER || '1',
      infoPlist: {
        NSCameraUsageDescription:
          'Bu uygulama fotoğraf çekmek için kamera erişimine ihtiyaç duyar.',
        NSPhotoLibraryUsageDescription:
          'Bu uygulama fotoğraf seçmek için galeri erişimine ihtiyaç duyar.',
      },
    },
    android: {
      versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '1', 10),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#ffffff',
          sounds: [],
        },
      ],
      // Certificate Pinning Plugin
      // TODO: Gerçek domain ve certificate hash'lerinizi ekleyin
      // [
      //   './plugins/withCertificatePinning.js',
      //   {
      //     android: {
      //       domains: ['api.example.com'], // Gerçek API domain'iniz
      //       publicKeyHashes: [
      //         'REPLACE_WITH_ACTUAL_SHA256_HASH', // Gerçek hash'iniz
      //       ],
      //     },
      //     ios: {
      //       domains: ['api.example.com'], // Gerçek API domain'iniz
      //       allowArbitraryLoads: false, // Production'da false olmalı
      //     },
      //   },
      // ],
    ],
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      API_URL: process.env.API_URL || 'https://api.example.com',
      DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'tr',
      DEFAULT_THEME: process.env.DEFAULT_THEME || 'light',
      APP_MODE: process.env.APP_MODE || 'mock',
      SENTRY_DSN: process.env.SENTRY_DSN || '',
      ENVIRONMENT: process.env.NODE_ENV || 'development',
    },
  },
};
