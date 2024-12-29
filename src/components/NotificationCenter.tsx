import React, { useState, useEffect } from 'react';
import { notificationService, Notification, NotificationConfig } from '../services/notificationService';
import { Icons } from './Icons';
import '../styles/NotificationCenter.css';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
    loadConfig();
  }, []);

  const loadNotifications = async () => {
    try {
      const unreadNotifications = await notificationService.getUnreadNotifications();
      setNotifications(unreadNotifications);
    } catch (error) {
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const config = await notificationService.getNotificationConfig();
      setConfig(config);
    } catch (error) {
      setError('Error al cargar la configuración');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      setError('Error al marcar como leída');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      setError('Error al eliminar la notificación');
    }
  };

  const handleUpdateConfig = async (changes: Partial<NotificationConfig>) => {
    if (!config) return;

    try {
      await notificationService.updateNotificationConfig(changes);
      setConfig(prev => prev ? { ...prev, ...changes } : null);
    } catch (error) {
      setError('Error al actualizar la configuración');
    }
  };

  const handleRequestPushPermission = async () => {
    const granted = await notificationService.requestPushPermission();
    if (granted && config) {
      handleUpdateConfig({ enablePushNotifications: true });
    }
  };

  const renderNotification = (notification: Notification) => (
    <div 
      key={notification.id} 
      className={`notification-item ${notification.read ? 'read' : ''} ${notification.priority}`}
    >
      <div className="notification-icon">
        {notification.type === 'expiration' && <Icons.Clock />}
        {notification.type === 'claim' && <Icons.Check />}
        {notification.type === 'system' && <Icons.Info />}
      </div>

      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <div className="notification-meta">
          <span className="notification-time">
            {new Date(notification.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="notification-actions">
        {!notification.read && (
          <button
            className="action-button"
            onClick={() => handleMarkAsRead(notification.id)}
            title="Marcar como leída"
          >
            <Icons.Check />
          </button>
        )}
        <button
          className="action-button delete"
          onClick={() => handleDelete(notification.id)}
          title="Eliminar"
        >
          <Icons.Delete />
        </button>
      </div>
    </div>
  );

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>
          <Icons.Bell /> Notificaciones
          {notifications.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
        </h3>
        <div className="header-actions">
          <button
            className="config-button"
            onClick={() => setShowConfig(!showConfig)}
            title="Configuración"
          >
            <Icons.Settings />
          </button>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              <Icons.Close />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="notification-error">
          <Icons.Error /> {error}
        </div>
      )}

      {showConfig && config && (
        <div className="notification-config">
          <h4>Configuración de Notificaciones</h4>
          
          <div className="config-group">
            <label>
              <input
                type="checkbox"
                checked={config.enableEmailNotifications}
                onChange={(e) => handleUpdateConfig({
                  enableEmailNotifications: e.target.checked
                })}
              />
              Notificaciones por email
            </label>

            <label>
              <input
                type="checkbox"
                checked={config.enablePushNotifications}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleRequestPushPermission();
                  } else {
                    handleUpdateConfig({ enablePushNotifications: false });
                  }
                }}
              />
              Notificaciones push
            </label>
          </div>

          <div className="config-group">
            <label>Días de advertencia antes del vencimiento:</label>
            <input
              type="number"
              min="1"
              max="30"
              value={config.expirationWarningDays}
              onChange={(e) => handleUpdateConfig({
                expirationWarningDays: parseInt(e.target.value)
              })}
            />
          </div>

          <div className="config-group">
            <label>Frecuencia de notificaciones:</label>
            <select
              value={config.notificationFrequency}
              onChange={(e) => handleUpdateConfig({
                notificationFrequency: e.target.value as NotificationConfig['notificationFrequency']
              })}
            >
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="custom">Personalizada</option>
            </select>

            {config.notificationFrequency === 'custom' && (
              <div className="custom-frequency">
                <label>Horas entre notificaciones:</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={config.customFrequencyHours ?? 24}
                  onChange={(e) => handleUpdateConfig({
                    customFrequencyHours: parseInt(e.target.value)
                  })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="notifications-list">
        {loading ? (
          <div className="loading-state">
            <span className="loading-spinner">
              <Icons.Spinner />
            </span>
            Cargando notificaciones...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <div className="empty-state">
            <Icons.Empty />
            <p>No hay notificaciones nuevas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 