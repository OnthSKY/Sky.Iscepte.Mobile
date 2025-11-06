/**
 * Certificate Pinning Configuration
 *
 * NEDEN: Pinned certificate hash'lerini yönetmek için
 * - Her domain için SHA-256 public key hash'leri
 * - Production ve development için farklı config'ler
 *
 * HASH ALMA:
 *
 * En Kolay Yöntem (Linux/macOS):
 * ```bash
 * DOMAIN="api.example.com"
 * echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
 * ```
 *
 * Online Tool (En Kolay):
 * 1. https://www.ssllabs.com/ssltest/ adresine gidin
 * 2. Domain'inizi girin ve test edin
 * 3. Certificate sekmesinden hash'i alın
 *
 * Detaylı rehber: docs/guides/HOW_TO_GET_CERTIFICATE_HASH.md
 */

import { PinnedCertificate } from '../services/certificatePinningService';
import appConfig from './appConfig';

/**
 * Get pinned certificates configuration
 *
 * NEDEN: Environment'a göre pinned certificate'ları döndür
 * - Production: Gerçek API domain'leri
 * - Development/Mock: Devre dışı veya test domain'leri
 */
export function getPinnedCertificates(): PinnedCertificate[] {
  // Development/mock mode'da certificate pinning devre dışı
  if (appConfig.mode === 'mock' || __DEV__) {
    return [];
  }

  // Production pinned certificates
  // TODO: Gerçek API domain'inizi ve certificate hash'lerinizi buraya ekleyin
  const apiUrl = new URL(appConfig.apiBaseUrl);
  const apiDomain = apiUrl.hostname;

  // Örnek configuration
  // Gerçek hash'leri almak için yukarıdaki komutları kullanın
  const pinnedCerts: PinnedCertificate[] = [
    {
      domain: apiDomain,
      publicKeyHashes: [
        // ÖRNEK HASH - Gerçek hash'i değiştirin!
        // Bu hash'i almak için:
        // echo | openssl s_client -servername ${apiDomain} -connect ${apiDomain}:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
        'REPLACE_WITH_ACTUAL_SHA256_HASH',
        // Backup hash (certificate rotation için)
        // 'BACKUP_SHA256_HASH',
      ],
      includeSubdomains: false, // Sadece exact domain
    },
    // Birden fazla domain için:
    // {
    //   domain: 'api2.example.com',
    //   publicKeyHashes: ['HASH1', 'HASH2'],
    //   includeSubdomains: true,
    // },
  ];

  return pinnedCerts;
}

/**
 * Get certificate hash for a domain
 *
 * NEDEN: Domain için certificate hash'ini almak için utility
 *
 * KULLANIM:
 * ```bash
 * # Terminal'de çalıştırın:
 * DOMAIN="api.example.com"
 * echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
 * ```
 */
export function getCertificateHashInstructions(domain: string): string {
  return `
To get the SHA-256 hash for ${domain}, run:

echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64

Or use online tool:
https://www.ssllabs.com/ssltest/analyze.html?d=${domain}
  `.trim();
}
