export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationEvent {
  message: string;
  type: NotificationType;
  id?: string;
  duration?: number;
}

export interface ToastOptions {
  duration?: number;
  priority?: number; // Daha yüksek priority önce gösterilir
}

type Listener = (evt: NotificationEvent) => void;

const listeners = new Set<Listener>();

// Toast queue sistemi
interface QueuedToast extends NotificationEvent {
  id: string;
  priority: number;
  timestamp: number;
}

const toastQueue: QueuedToast[] = [];
let isProcessing = false;
let toastIdCounter = 0;

/**
 * Toast bildirimi gösterir
 * @param message - Gösterilecek mesaj
 * @param type - Toast tipi (success, error, info)
 * @param options - Ek seçenekler (duration, priority)
 */
const show = (message: string, type: NotificationType = 'info', options?: ToastOptions) => {
  const id = `toast-${++toastIdCounter}-${Date.now()}`;
  const toast: QueuedToast = {
    id,
    message,
    type,
    duration: options?.duration || 3000,
    priority: options?.priority || 0,
    timestamp: Date.now(),
  };

  // Priority'ye göre sıralı ekleme (yüksek priority önce)
  const insertIndex = toastQueue.findIndex(t => t.priority < toast.priority);
  if (insertIndex === -1) {
    toastQueue.push(toast);
  } else {
    toastQueue.splice(insertIndex, 0, toast);
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
 */
const error = (message: string, options?: ToastOptions) => {
  show(message, 'error', options);
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
  info,
  onToastDismissed,
  clearQueue,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export default notificationService;


