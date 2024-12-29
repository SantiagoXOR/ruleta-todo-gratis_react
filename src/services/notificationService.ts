import { PrizeWithCode } from '../types/wheel.types';

export interface NotificationConfig {
  expirationWarningDays: number;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'custom';
  customFrequencyHours?: number;
}

export interface Notification {
  id: string;
  type: 'expiration' | 'claim' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: {
    prizeId?: string;
    expirationDate?: Date;
    code?: string;
  };
}

class NotificationService {
  private config: NotificationConfig = {
    expirationWarningDays: 7,
    enableEmailNotifications: true,
    enablePushNotifications: true,
    notificationFrequency: 'daily'
  };

  async getNotificationConfig(): Promise<NotificationConfig> {
    // TODO: Obtener configuración desde el backend
    return this.config;
  }

  async updateNotificationConfig(config: Partial<NotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    // TODO: Actualizar configuración en el backend
  }

  async checkExpiringPrizes(): Promise<PrizeWithCode[]> {
    try {
      const response = await fetch('/api/prizes/expiring', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener premios próximos a vencer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async sendExpirationNotification(prize: PrizeWithCode): Promise<void> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type: 'expiration',
      title: 'Premio próximo a vencer',
      message: `Tu premio "${prize.name}" vencerá en ${this.config.expirationWarningDays} días.`,
      timestamp: new Date(),
      read: false,
      priority: 'high',
      data: {
        prizeId: prize.id,
        expirationDate: prize.expiresAt,
        code: prize.code
      }
    };

    await this.saveNotification(notification);

    if (this.config.enableEmailNotifications) {
      await this.sendEmailNotification(notification);
    }

    if (this.config.enablePushNotifications) {
      await this.sendPushNotification(notification);
    }
  }

  private async saveNotification(notification: Notification): Promise<void> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la notificación');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Error al enviar notificación por email');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await fetch('/api/notifications/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              subscription,
              notification
            })
          });
        }
      } catch (error) {
        console.error('Error al enviar notificación push:', error);
      }
    }
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch('/api/notifications/unread', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones no leídas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
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
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async requestPushPermission(): Promise<boolean> {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error al solicitar permisos de notificación:', error);
        return false;
      }
    }
    return false;
  }
}

export const notificationService = new NotificationService(); 