export type NotificationType = 'success' | 'error' | 'info';

/**
 * Error Categories
 */
export type ErrorCategory = 
  | 'api'           // API/Network errors
  | 'system'        // System errors
  | 'validation'    // Validation errors
  | 'permission'    // Permission/Authorization errors
  | 'business'      // Business logic errors
  | 'unknown';      // Unknown errors

export interface NotificationEvent {
  message: string;
  type: NotificationType;
  id?: string;
  duration?: number;
  category?: ErrorCategory;
  details?: any;
}

export interface ToastOptions {
  duration?: number;
  priority?: number; // Daha yüksek priority önce gösterilir
}

/**
 * Error Options with category, details, and deduplication key
 */
export interface ErrorOptions extends ToastOptions {
  category?: ErrorCategory;
  details?: any;
  key?: string; // Unique key for deduplication - same key won't show multiple times
  context?: string; // Additional context for error
}

type Listener = (evt: NotificationEvent) => void;

const listeners = new Set<Listener>();

// Toast queue sistemi
interface QueuedToast extends NotificationEvent {
  id: string;
  priority: number;
  timestamp: number;
  errorKey?: string; // For deduplication
}

const toastQueue: QueuedToast[] = [];
let isProcessing = false;
let toastIdCounter = 0;

// Deduplication: Store recently shown errors by key to prevent duplicates
const recentErrors = new Map<string, number>();
const DEDUPLICATION_WINDOW = 5000; // 5 seconds - don't show same error again within this window

/**
 * Generate error key for deduplication
 */
const generateErrorKey = (message: string, key?: string, category?: ErrorCategory): string => {
  if (key) return key;
  // Generate key from message and category
  return `${category || 'unknown'}:${message}`;
};

/**
 * Check if error was recently shown (deduplication)
 */
const wasRecentlyShown = (errorKey: string): boolean => {
  const lastShown = recentErrors.get(errorKey);
  if (!lastShown) return false;
  
  const now = Date.now();
  if (now - lastShown < DEDUPLICATION_WINDOW) {
    return true; // Recently shown, skip
  }
  
  return false;
};

/**
 * Mark error as shown
 */
const markAsShown = (errorKey: string) => {
  recentErrors.set(errorKey, Date.now());
  
  // Clean up old entries (older than deduplication window)
  const now = Date.now();
  for (const [key, timestamp] of recentErrors.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW * 2) {
      recentErrors.delete(key);
    }
  }
};

/**
 * Toast bildirimi gösterir
 * @param message - Gösterilecek mesaj
 * @param type - Toast tipi (success, error, info)
 * @param options - Ek seçenekler (duration, priority)
 */
const show = (message: string, type: NotificationType = 'info', options?: ToastOptions & { category?: ErrorCategory; details?: any; key?: string }) => {
  const id = `toast-${++toastIdCounter}-${Date.now()}`;
  
  // For errors, check deduplication
  if (type === 'error' && options?.key !== undefined) {
    const errorKey = generateErrorKey(message, options.key, options.category);
    if (wasRecentlyShown(errorKey)) {
      return; // Skip duplicate error
    }
    
    const toast: QueuedToast = {
      id,
      message,
      type,
      duration: options?.duration || 3000,
      priority: options?.priority || 0,
      timestamp: Date.now(),
      category: options.category,
      details: options.details,
      errorKey,
    };

    // Priority'ye göre sıralı ekleme (yüksek priority önce)
    const insertIndex = toastQueue.findIndex(t => t.priority < toast.priority);
    if (insertIndex === -1) {
      toastQueue.push(toast);
    } else {
      toastQueue.splice(insertIndex, 0, toast);
    }

    // Mark as shown for deduplication
    markAsShown(errorKey);
  } else {
    // Non-error or no deduplication key
    const toast: QueuedToast = {
      id,
      message,
      type,
      duration: options?.duration || 3000,
      priority: options?.priority || 0,
      timestamp: Date.now(),
      category: options?.category,
      details: options?.details,
    };

    // Priority'ye göre sıralı ekleme (yüksek priority önce)
    const insertIndex = toastQueue.findIndex(t => t.priority < toast.priority);
    if (insertIndex === -1) {
      toastQueue.push(toast);
    } else {
      toastQueue.splice(insertIndex, 0, toast);
    }
  }

  processQueue();
};

/**
 * Queue'daki toast'ları sırayla işler
 */
const processQueue = () => {
  if (isProcessing || toastQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const nextToast = toastQueue.shift();
  
  if (nextToast) {
    const evt: NotificationEvent = {
      message: nextToast.message,
      type: nextToast.type,
      id: nextToast.id,
      duration: nextToast.duration,
    };
    
    // Tüm listener'lara bildir
    for (const l of listeners) {
      l(evt);
    }
  }
};

/**
 * Bir toast gösterildikten sonra çağrılır, sonraki toast'ı işler
 */
const onToastDismissed = () => {
  isProcessing = false;
  // Kısa bir gecikme ile sonraki toast'ı göster (smooth transition için)
  setTimeout(() => {
    processQueue();
  }, 300);
};

/**
 * Queue'yu temizler
 */
const clearQueue = () => {
  toastQueue.length = 0;
  isProcessing = false;
};

/**
 * Başarı mesajı gösterir
 */
const success = (message: string, options?: ToastOptions) => {
  show(message, 'success', options);
};

/**
 * Hata mesajı gösterir
 * @param message - Hata mesajı
 * @param options - Hata seçenekleri (category, details, key for deduplication)
 */
const error = (message: string, options?: ErrorOptions) => {
  show(message, 'error', options);
};

/**
 * API hatası gösterir
 */
const apiError = (message: string, details?: any, options?: Omit<ErrorOptions, 'category'>) => {
  error(message, { ...options, category: 'api', details });
};

/**
 * Sistem hatası gösterir
 */
const systemError = (message: string, details?: any, options?: Omit<ErrorOptions, 'category'>) => {
  error(message, { ...options, category: 'system', details });
};

/**
 * Validasyon hatası gösterir
 */
const validationError = (message: string, details?: any, options?: Omit<ErrorOptions, 'category'>) => {
  error(message, { ...options, category: 'validation', details });
};

/**
 * İzin hatası gösterir
 */
const permissionError = (message: string, details?: any, options?: Omit<ErrorOptions, 'category'>) => {
  error(message, { ...options, category: 'permission', details });
};

/**
 * İş mantığı hatası gösterir
 */
const businessError = (message: string, details?: any, options?: Omit<ErrorOptions, 'category'>) => {
  error(message, { ...options, category: 'business', details });
};

/**
 * Bilgi mesajı gösterir
 */
const info = (message: string, options?: ToastOptions) => {
  show(message, 'info', options);
};

export const notificationService = {
  show,
  success,
  error,
  apiError,
  systemError,
  validationError,
  permissionError,
  businessError,
  info,
  onToastDismissed,
  clearQueue,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export default notificationService;


