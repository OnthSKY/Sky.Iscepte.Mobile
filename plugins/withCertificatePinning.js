/**
 * Expo Config Plugin for Certificate Pinning
 *
 * NEDEN: Android ve iOS için certificate pinning native config'lerini eklemek için
 * - Android: network_security_config.xml
 * - iOS: Info.plist ve native code
 *
 * KULLANIM:
 * app.config.js'de:
 * plugins: [
 *   ['./plugins/withCertificatePinning.js', {
 *     android: {
 *       domains: ['api.example.com'],
 *       publicKeyHashes: ['SHA256_HASH_1', 'SHA256_HASH_2']
 *     },
 *     ios: {
 *       domains: ['api.example.com'],
 *       publicKeyHashes: ['SHA256_HASH_1', 'SHA256_HASH_2']
 *     }
 *   }]
 * ]
 */

const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Android Network Security Config oluştur
 */
function createAndroidNetworkSecurityConfig(domains, publicKeyHashes) {
  if (!domains || domains.length === 0 || !publicKeyHashes || publicKeyHashes.length === 0) {
    return null;
  }

  const pinSet = publicKeyHashes
    .map((hash) => `        <pin digest="SHA-256">${hash}</pin>`)
    .join('\n');

  const domainConfigs = domains
    .map((domain) => {
      return `    <domain-config cleartextTrafficPermitted="false">
      <domain includeSubdomains="false">${domain}</domain>
      <pin-set expiration="2025-12-31">
${pinSet}
      </pin-set>
    </domain-config>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
  ${domainConfigs}
</network-security-config>`;
}

/**
 * Android için certificate pinning ekle
 */
const withAndroidCertificatePinning = (config, options) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application?.[0];

    if (!mainApplication) {
      console.warn('Android manifest application not found');
      return config;
    }

    // Network security config ekle
    if (options?.android?.domains && options?.android?.publicKeyHashes) {
      const networkSecurityConfig = createAndroidNetworkSecurityConfig(
        options.android.domains,
        options.android.publicKeyHashes
      );

      if (networkSecurityConfig) {
        // Network security config dosyasını oluştur
        const androidResPath = path.join(
          config.modRequest.platformProjectRoot,
          'app',
          'src',
          'main',
          'res',
          'xml'
        );
        if (!fs.existsSync(androidResPath)) {
          fs.mkdirSync(androidResPath, { recursive: true });
        }

        const networkSecurityConfigPath = path.join(androidResPath, 'network_security_config.xml');
        fs.writeFileSync(networkSecurityConfigPath, networkSecurityConfig);

        // AndroidManifest.xml'e networkSecurityConfig attribute ekle
        if (!mainApplication.$) {
          mainApplication.$ = {};
        }
        mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';

        console.log('✅ Android certificate pinning config added');
      }
    }

    return config;
  });
};

/**
 * iOS için certificate pinning ekle
 */
const withIOSCertificatePinning = (config, options) => {
  return withInfoPlist(config, (config) => {
    // iOS için App Transport Security (ATS) config
    // Certificate pinning için native code gerekir
    // Bu plugin sadece ATS'yi yapılandırır

    if (options?.ios?.domains) {
      const infoPlist = config.modResults;

      // App Transport Security settings
      if (!infoPlist.NSAppTransportSecurity) {
        infoPlist.NSAppTransportSecurity = {};
      }

      // Domain exceptions (development için)
      if (options.ios.allowArbitraryLoads === true) {
        infoPlist.NSAppTransportSecurity.NSAllowsArbitraryLoads = true;
      }

      // Domain-specific settings
      const exceptionDomains = {};
      options.ios.domains.forEach((domain) => {
        exceptionDomains[domain] = {
          NSExceptionRequiresForwardSecrecy: false,
          NSIncludesSubdomains: true,
          NSExceptionAllowsInsecureHTTPLoads: false,
          NSExceptionMinimumTLSVersion: 'TLSv1.2',
        };
      });

      if (Object.keys(exceptionDomains).length > 0) {
        infoPlist.NSAppTransportSecurity.NSExceptionDomains = exceptionDomains;
      }

      console.log('✅ iOS App Transport Security config added');
      console.warn('⚠️  iOS certificate pinning requires native code. See documentation.');
    }

    return config;
  });
};

/**
 * Main plugin function
 */
const withCertificatePinning = (config, options = {}) => {
  // Android certificate pinning
  config = withAndroidCertificatePinning(config, options);

  // iOS certificate pinning (ATS config)
  config = withIOSCertificatePinning(config, options);

  return config;
};

module.exports = withCertificatePinning;
