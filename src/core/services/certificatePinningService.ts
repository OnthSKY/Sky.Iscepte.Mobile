/**
 * Certificate Pinning Service
 *
 * NEDEN: HTTPS certificate pinning ile man-in-the-middle saldırılarına karşı koruma
 * - API sertifikalarının public key hash'lerini pin'ler
 * - Sahte sertifikalarla trafik dinleme engellenir
 * - OWASP Mobile Top 10 güvenlik önerisi
 *
 * NOT: Bu JavaScript seviyesinde bir kontrol. Tam güvenlik için native modül gerekir.
 * Production'da native certificate pinning (Android Network Security Config, iOS ATS) kullanılmalı.
 */

import { logger } from '../utils/logger';
import appConfig from '../config/appConfig';

/**
 * Pinned Certificate Configuration
 *
 * Her domain için SHA-256 hash'leri
 * Hash'leri almak için: openssl s_client -connect domain.com:443 -servername domain.com < /dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
 */
export interface PinnedCertificate {
  domain: string;
  publicKeyHashes: string[]; // SHA-256 base64 encoded hashes
  includeSubdomains?: boolean; // Subdomain'leri de dahil et
}

/**
 * Certificate Pinning Configuration
 *
 * Production ve development için farklı config'ler
 */
class CertificatePinningService {
  private pinnedCertificates: PinnedCertificate[] = [];
  private isEnabled: boolean = true; // Development'ta devre dışı bırakılabilir

  /**
   * Initialize certificate pinning
   *
   * NEDEN: Pinned certificate'ları yükle ve kontrol et
   */
  async initialize(): Promise<void> {
    try {
      // Load pinned certificates from config
      const { getPinnedCertificates } = await import('../config/certificatePinningConfig');
      this.pinnedCertificates = getPinnedCertificates();

      // Disable in development/mock mode if needed
      if (appConfig.mode === 'mock' || __DEV__) {
        this.isEnabled = false;
        logger.warn('Certificate pinning disabled in development/mock mode');
        return;
      }

      if (this.pinnedCertificates.length === 0) {
        logger.warn('No pinned certificates configured. Certificate pinning disabled.');
        this.isEnabled = false;
        return;
      }

      logger.info(`Certificate pinning initialized with ${this.pinnedCertificates.length} domains`);
    } catch (error) {
      logger.error('Failed to initialize certificate pinning:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if certificate pinning is enabled
   */
  isCertificatePinningEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Validate certificate for a URL
   *
   * NEDEN: URL'in certificate'ının pinned hash'lerle eşleşip eşleşmediğini kontrol et
   *
   * NOT: Bu JavaScript seviyesinde bir kontrol. Native modül ile daha güvenli olur.
   * Web platformunda bu kontrol yapılamaz (browser security restrictions).
   *
   * @param url - URL to validate
   * @returns true if certificate is valid, false otherwise
   */
  async validateCertificate(url: string): Promise<boolean> {
    if (!this.isEnabled) {
      return true; // Skip validation if disabled
    }

    try {
      const urlObj = new URL(url);
      const { hostname } = urlObj;

      // Find matching pinned certificate
      const pinnedCert = this.pinnedCertificates.find((cert) => {
        if (cert.includeSubdomains) {
          return hostname === cert.domain || hostname.endsWith(`.${cert.domain}`);
        }
        return hostname === cert.domain;
      });

      if (!pinnedCert) {
        // No pinning configured for this domain - allow (or reject based on policy)
        logger.debug(`No certificate pinning configured for domain: ${hostname}`);
        return true; // Allow if not configured (can be changed to false for strict policy)
      }

      // In React Native, we can't directly access certificate information from JavaScript
      // This is a placeholder for native implementation
      // For now, we log and return true (actual validation should be done in native code)
      logger.debug(`Certificate pinning check for domain: ${hostname}`);

      // TODO: Native certificate pinning should be implemented
      // For Android: Use Network Security Config
      // For iOS: Use NSURLSession with certificate pinning
      // This JavaScript check is a fallback/placeholder

      return true; // Placeholder - actual validation in native code
    } catch (error) {
      logger.error('Certificate validation error:', error);
      return false; // Fail secure - reject on error
    }
  }

  /**
   * Get pinned certificates for a domain
   */
  getPinnedCertificatesForDomain(domain: string): PinnedCertificate | undefined {
    return this.pinnedCertificates.find((cert) => {
      if (cert.includeSubdomains) {
        return domain === cert.domain || domain.endsWith(`.${cert.domain}`);
      }
      return domain === cert.domain;
    });
  }

  /**
   * Add pinned certificate (runtime configuration)
   *
   * NEDEN: Runtime'da certificate eklemek için (opsiyonel)
   */
  addPinnedCertificate(cert: PinnedCertificate): void {
    const existing = this.pinnedCertificates.findIndex((c) => c.domain === cert.domain);
    if (existing >= 0) {
      this.pinnedCertificates[existing] = cert;
      logger.info(`Updated pinned certificate for domain: ${cert.domain}`);
    } else {
      this.pinnedCertificates.push(cert);
      logger.info(`Added pinned certificate for domain: ${cert.domain}`);
    }
  }

  /**
   * Remove pinned certificate
   */
  removePinnedCertificate(domain: string): void {
    const index = this.pinnedCertificates.findIndex((c) => c.domain === domain);
    if (index >= 0) {
      this.pinnedCertificates.splice(index, 1);
      logger.info(`Removed pinned certificate for domain: ${domain}`);
    }
  }
}

// Singleton instance
export const certificatePinningService = new CertificatePinningService();

/**
 * Initialize certificate pinning service
 *
 * NEDEN: App başlangıcında certificate pinning'i initialize et
 */
export async function initializeCertificatePinning(): Promise<void> {
  await certificatePinningService.initialize();
}
