import { PrizeWithCode } from '../types/wheel.types';

export interface Notification {
  id: string;
  type: 'prize_expiring' | 'prize_won' | 'system' | 'custom';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: any;
  recipientId: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  prizeExpiring: boolean;
  prizeWon: boolean;
  systemUpdates: boolean;
}

export interface EmailConfig {
  enabled: boolean;
  template: string;
  from: string;
  subject: string;
}

export interface PushConfig {
  enabled: boolean;
  vapidKey: string;
  icon: string;
  badge: string;
}

class NotificationService {
  private worker: ServiceWorker | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        this.worker = registration.active;
      } catch (error) {
        console.error('Error al registrar el service worker:', error);
      }
    }
  }

  async getNotifications(userId: string, filters?: {
    read?: boolean;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Notification[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof Date) {
              queryParams.append(key, value.toISOString());
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`/api/notifications/${userId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`/api/notifications/${userId}/preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener preferencias de notificaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar preferencias de notificaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async subscribeToWebPush(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      const response = await fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Error al suscribirse a notificaciones push');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async unsubscribeFromWebPush(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        const response = await fetch('/api/notifications/push-subscription', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
        });

        if (!response.ok) {
          throw new Error('Error al cancelar suscripción de notificaciones push');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async checkExpiringPrizes(userId: string): Promise<PrizeWithCode[]> {
    try {
      const response = await fetch(`/api/notifications/${userId}/expiring-prizes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al verificar premios próximos a vencer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async sendCustomNotification(
    userId: string,
    notification: Pick<Notification, 'title' | 'message' | 'priority' | 'data'>
  ): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${userId}/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Error al enviar notificación personalizada');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService(); 