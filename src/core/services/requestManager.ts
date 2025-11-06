/**
 * Request Manager
 *
 * NEDEN: Request cancellation ve deduplication için
 * - Component unmount olduğunda request cancel edilir
 * - Aynı request'ler tekrarlanmaz (deduplication)
 * - Request lifecycle yönetimi
 */

// AbortController is available globally in React Native

/**
 * Request identifier for deduplication
 */
type RequestId = string;

/**
 * Active request tracking
 */
interface ActiveRequest {
  controller: AbortController;
  timestamp: number;
  url: string;
  method: string;
}

/**
 * Request Manager
 *
 * NEDEN: Request cancellation ve deduplication için
 * - Component unmount olduğunda request cancel edilir
 * - Aynı request'ler tekrarlanmaz
 * - Request lifecycle yönetimi
 */
class RequestManager {
  private activeRequests: Map<RequestId, ActiveRequest> = new Map();
  private readonly DEDUP_WINDOW_MS = 1000; // 1 second deduplication window

  /**
   * Generate request ID for deduplication
   *
   * NEDEN: Aynı request'leri tespit etmek için
   * - Method + URL + body hash
   */
  private generateRequestId(method: string, url: string, body?: unknown): RequestId {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyHash}`;
  }

  /**
   * Create AbortController for request
   *
   * NEDEN: Request cancellation için
   * - Component unmount olduğunda cancel edilebilir
   */
  createController(requestId: RequestId, url: string, method: string): AbortController | null {
    // Check if same request is already in progress (deduplication)
    const existing = this.activeRequests.get(requestId);
    if (existing) {
      const age = Date.now() - existing.timestamp;
      if (age < this.DEDUP_WINDOW_MS) {
        // Return existing controller for deduplication
        return existing.controller;
      }
      // Old request, cancel it
      existing.controller.abort();
    }

    // Create new controller
    const controller = new AbortController();
    this.activeRequests.set(requestId, {
      controller,
      timestamp: Date.now(),
      url,
      method,
    });

    return controller;
  }

  /**
   * Cancel request by ID
   *
   * NEDEN: Component unmount olduğunda request cancel etmek için
   */
  cancelRequest(requestId: RequestId): void {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all requests
   *
   * NEDEN: Logout veya cleanup durumlarında tüm request'leri cancel etmek için
   */
  cancelAllRequests(): void {
    this.activeRequests.forEach((request) => {
      request.controller.abort();
    });
    this.activeRequests.clear();
  }

  /**
   * Remove completed request
   *
   * NEDEN: Request tamamlandığında tracking'den kaldırmak için
   */
  removeRequest(requestId: RequestId): void {
    this.activeRequests.delete(requestId);
  }

  /**
   * Get active request count
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Cleanup old requests (older than dedup window)
   *
   * NEDEN: Memory leak'i önlemek için
   */
  cleanup(): void {
    const now = Date.now();
    this.activeRequests.forEach((request, id) => {
      if (now - request.timestamp > this.DEDUP_WINDOW_MS * 2) {
        this.activeRequests.delete(id);
      }
    });
  }

  /**
   * Generate request ID helper
   */
  generateId(method: string, url: string, body?: unknown): RequestId {
    return this.generateRequestId(method, url, body);
  }
}

// Singleton instance
export const requestManager = new RequestManager();

// Auto cleanup every 5 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    requestManager.cleanup();
  }, 5000);
}
