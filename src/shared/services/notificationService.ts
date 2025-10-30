export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationEvent {
  message: string;
  type: NotificationType;
}

type Listener = (evt: NotificationEvent) => void;

const listeners = new Set<Listener>();

export const notificationService = {
  show: (message: string, type: NotificationType = 'info') => {
    const evt: NotificationEvent = { message, type };
    for (const l of listeners) l(evt);
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export default notificationService;


