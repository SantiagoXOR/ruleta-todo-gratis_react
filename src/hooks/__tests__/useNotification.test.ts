import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotification } from '../useNotification';
import { toast } from 'react-toastify';

// Mock de react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    update: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra notificación de éxito', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Operación exitosa';

    result.current.showSuccess(message);

    expect(toast.success).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('muestra notificación de error', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Error en la operación';

    result.current.showError(message);

    expect(toast.error).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('muestra notificación de información', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Información importante';

    result.current.showInfo(message);

    expect(toast.info).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('muestra notificación de advertencia', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Advertencia importante';

    result.current.showWarning(message);

    expect(toast.warning).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('muestra notificación de carga', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Cargando...';

    result.current.showLoadingNotification(message);

    expect(toast.loading).toHaveBeenCalledWith(message, expect.any(Object));
  });

  it('actualiza una notificación existente', () => {
    const { result } = renderHook(() => useNotification());
    const toastId = '123';
    const message = 'Notificación actualizada';

    result.current.updateNotification(toastId, 'success', message);

    expect(toast.update).toHaveBeenCalledWith(toastId, expect.objectContaining({
      render: message,
      type: 'success',
      isLoading: false,
    }));
  });

  it('descarta una notificación específica', () => {
    const { result } = renderHook(() => useNotification());
    const toastId = '123';

    result.current.dismissNotification(toastId);

    expect(toast.dismiss).toHaveBeenCalledWith(toastId);
  });

  it('descarta todas las notificaciones', () => {
    const { result } = renderHook(() => useNotification());

    result.current.dismissNotification();

    expect(toast.dismiss).toHaveBeenCalled();
  });

  it('acepta opciones personalizadas', () => {
    const customOptions = {
      autoClose: 5000,
      position: 'top-center' as const,
    };

    const { result } = renderHook(() => useNotification(customOptions));
    const message = 'Notificación personalizada';

    result.current.showSuccess(message);

    expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining(customOptions));
  });

  it('permite sobreescribir opciones por notificación', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Notificación personalizada';
    const customOptions = {
      autoClose: 1000,
      position: 'bottom-right' as const,
    };

    result.current.showSuccess(message, customOptions);

    expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining(customOptions));
  });

  it('mantiene las opciones por defecto si no se proporcionan', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Notificación por defecto';

    result.current.showSuccess(message);

    expect(toast.success).toHaveBeenCalledWith(message, expect.objectContaining({
      autoClose: 3000,
      position: 'top-right',
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }));
  });
});
