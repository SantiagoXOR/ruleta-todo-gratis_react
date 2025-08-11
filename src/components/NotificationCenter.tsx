import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, Notification, NotificationPreferences } from '../services/notificationService';
import { securityService } from '../services/securityService';
import { Icons } from './Icons';
import '../styles/NotificationCenter.css';

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [pushSupported] = useState('PushManager' in window);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const loadNotifications = async () => {
    try {
      const currentUser = securityService.getCurrentUser();
      if (!currentUser) return;

      const data = await notificationService.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (error) {
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const currentUser = securityService.getCurrentUser();
      if (!currentUser) return;

      const data = await notificationService.getPreferences(currentUser.id);
      setPreferences(data);
    } catch (error) {
      setError('Error al cargar las preferencias');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      setError('Error al marcar la notificación como leída');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      setError('Error al eliminar la notificación');
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const currentUser = securityService.getCurrentUser();
      if (!currentUser) return;

      await notificationService.updatePreferences(currentUser.id, updates);
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      setError('Error al actualizar las preferencias');
    }
  };

  const handlePushToggle = async () => {
    if (!preferences) return;

    try {
      if (preferences.push) {
        await notificationService.unsubscribeFromWebPush();
      } else {
        await notificationService.subscribeToWebPush();
      }
      
      await handleUpdatePreferences({ push: !preferences.push });
    } catch (error) {
      setError('Error al actualizar la suscripción de notificaciones push');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.data?.url) {
      navigate(notification.data.url);
    }
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={`notification-item ${notification.read ? 'read' : ''}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="notification-icon">
        {notification.type === 'prize_expiring' && <Icons.Clock />}
        {notification.type === 'prize_won' && <Icons.Gift />}
        {notification.type === 'system' && <Icons.Info />}
        {notification.type === 'custom' && <Icons.Bell />}
      </div>

      <div className="notification-content">
        <div className="notification-header">
          <h4>{notification.title}</h4>
          <span className="notification-time">
            {new Date(notification.timestamp).toLocaleString()}
          </span>
        </div>
        <p>{notification.message}</p>
      </div>

      <div className="notification-actions">
        {!notification.read && (
          <button
            className="icon-button"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(notification.id);
            }}
            title="Marcar como leída"
          >
            <Icons.Check />
          </button>
        )}
        <button
          className="icon-button danger"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(notification.id);
          }}
          title="Eliminar"
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="preferences-panel">
      <h3>Preferencias de Notificaciones</h3>

      <div className="preferences-group">
        <h4>Canales de Notificación</h4>
        <label className="preference-item">
          <span>Notificaciones en la aplicación</span>
          <input
            type="checkbox"
            checked={preferences?.inApp}
            onChange={(e) => handleUpdatePreferences({ inApp: e.target.checked })}
          />
        </label>

        <label className="preference-item">
          <span>Notificaciones por email</span>
          <input
            type="checkbox"
            checked={preferences?.email}
            onChange={(e) => handleUpdatePreferences({ email: e.target.checked })}
          />
        </label>

        {pushSupported && (
          <label className="preference-item">
            <span>Notificaciones push</span>
            <input
              type="checkbox"
              checked={preferences?.push}
              onChange={handlePushToggle}
            />
          </label>
        )}
      </div>

      <div className="preferences-group">
        <h4>Tipos de Notificación</h4>
        <label className="preference-item">
          <span>Premios próximos a vencer</span>
          <input
            type="checkbox"
            checked={preferences?.prizeExpiring}
            onChange={(e) => handleUpdatePreferences({ prizeExpiring: e.target.checked })}
          />
        </label>

        <label className="preference-item">
          <span>Premios ganados</span>
          <input
            type="checkbox"
            checked={preferences?.prizeWon}
            onChange={(e) => handleUpdatePreferences({ prizeWon: e.target.checked })}
          />
        </label>

        <label className="preference-item">
          <span>Actualizaciones del sistema</span>
          <input
            type="checkbox"
            checked={preferences?.systemUpdates}
            onChange={(e) => handleUpdatePreferences({ systemUpdates: e.target.checked })}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>
          <Icons.Bell />
          Notificaciones
        </h2>
        <div className="header-actions">
          <button
            className="text-button"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            <Icons.Settings />
            Preferencias
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <Icons.Error />
          {error}
        </div>
      )}

      {showPreferences ? (
        renderPreferences()
      ) : (
        <div className="notifications-list" role="region" aria-live="polite" aria-label="Lista de notificaciones">
          {loading ? (
            <div className="loading-state" role="status" aria-busy="true">
              <Icons.Spinner className="spin" />
              Cargando notificaciones...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(renderNotification)
          ) : (
            <div className="empty-state" role="status">
              <Icons.Inbox />
              <p>No tienes notificaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 