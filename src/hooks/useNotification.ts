import { useCallback } from 'react';
import { toast } from 'react-toastify';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  autoClose?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}

const defaultOptions: NotificationOptions = {
  autoClose: 3000,
  position: 'top-right',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const useNotification = (customOptions: NotificationOptions = {}) => {
  const options = { ...defaultOptions, ...customOptions };

  const showNotification = useCallback((type: NotificationType, message: string, opts?: NotificationOptions) => {
    const toastOptions = { ...options, ...opts };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  }, [options]);

  const showSuccess = useCallback((message: string, opts?: NotificationOptions) => {
    showNotification('success', message, opts);
  }, [showNotification]);

  const showError = useCallback((message: string, opts?: NotificationOptions) => {
    showNotification('error', message, opts);
  }, [showNotification]);

  const showInfo = useCallback((message: string, opts?: NotificationOptions) => {
    showNotification('info', message, opts);
  }, [showNotification]);

  const showWarning = useCallback((message: string, opts?: NotificationOptions) => {
    showNotification('warning', message, opts);
  }, [showNotification]);

  const showLoadingNotification = useCallback((message: string) => {
    return toast.loading(message, {
      ...options,
      autoClose: false,
    });
  }, [options]);

  const updateNotification = useCallback((toastId: string | number, type: NotificationType, message: string, opts?: NotificationOptions) => {
    const toastOptions = { ...options, ...opts };

    toast.update(toastId, {
      render: message,
      type,
      ...toastOptions,
      isLoading: false,
    });
  }, [options]);

  const dismissNotification = useCallback((toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoadingNotification,
    updateNotification,
    dismissNotification,
  };
};
