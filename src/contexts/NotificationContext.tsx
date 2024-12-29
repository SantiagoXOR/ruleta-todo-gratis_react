import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

interface NotificationItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counter, setCounter] = useState(0);

  const showNotification = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000
  ) => {
    const id = counter;
    setCounter(prev => prev + 1);

    setNotifications(prev => [...prev, { id, message, type, duration }]);
  }, [counter]);

  const handleClose = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 