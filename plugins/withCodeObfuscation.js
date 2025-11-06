/**
 * Expo Config Plugin for Code Obfuscation
 *
 * NEDEN: Production build'lerde kod obfuscation ile reverse engineering'i zorlaştırmak
 * - Android: ProGuard/R8 obfuscation
 * - iOS: Build settings optimization
 * - JavaScript: Metro bundler minification (zaten aktif)
 *
 * KULLANIM:
 * app.config.js'de:
 * plugins: [
 *   ['./plugins/withCodeObfuscation.js', {
 *     android: {
 *       enableProguard: true,
 *       enableR8: true,
 *     },
 *     ios: {
 *       enableOptimization: true,
 *     }
 *   }]
 * ]
 */

const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Android ProGuard/R8 Obfuscation
 */
const withAndroidObfuscation = (config, options) => {
  // Gradle properties ile R8/ProGuard ayarları
  config = withGradleProperties(config, (config) => {
    const gradleProperties = config.modResults;

    // R8 full mode (daha agresif obfuscation)
    if (options?.android?.enableR8 !== false) {
      gradleProperties.push({
        type: 'property',
        key: 'android.enableR8.fullMode',
        value: 'true',
      });
    }

    // ProGuard optimization
    if (options?.android?.enableProguard !== false) {
      gradleProperties.push({
        type: 'property',
        key: 'android.enableProguard',
        value: 'true',
      });
    }

    return config;
  });

  // App build.gradle ile minify ve obfuscation ayarları
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Release build type için obfuscation ayarları
    if (buildGradle.includes('buildTypes')) {
      // buildTypes içinde release varsa, minifyEnabled ve proguardFiles ekle
      if (buildGradle.includes('release')) {
        // Zaten varsa değiştir, yoksa ekle
        if (buildGradle.includes('minifyEnabled')) {
          // minifyEnabled true yap
          config.modResults.contents = buildGradle.replace(
            /minifyEnabled\s+(false|true)/g,
            'minifyEnabled true'
          );
        } else {
          // release buildType içine ekle
          config.modResults.contents = buildGradle.replace(
            /(release\s*\{)/,
            `$1
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`
          );
        }
      } else {
        // buildTypes yoksa ekle
        config.modResults.contents = buildGradle.replace(
          /(android\s*\{)/,
          `$1
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }`
        );
      }
    } else {
      // buildTypes bloğu yoksa ekle
      config.modResults.contents = buildGradle.replace(
        /(android\s*\{)/,
        `$1
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }`
      );
    }

    return config;
  });

  return config;
};

/**
 * Main plugin function
 */
const withCodeObfuscation = (config, options = {}) => {
  // Android obfuscation
  if (options?.android !== false) {
    config = withAndroidObfuscation(config, options);
  }

  // iOS için build settings (Xcode'da manuel yapılmalı)
  // Expo managed workflow'da iOS obfuscation için native modül gerekir
  // Bu plugin sadece Android için çalışır

  return config;
};

module.exports = withCodeObfuscation;
