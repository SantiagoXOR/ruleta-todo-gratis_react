import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { NotificationProvider, useNotification } from '../NotificationContext';
import theme from '../../styles/theme';

// Componente de prueba que usa el contexto
const TestComponent: React.FC = () => {
  const { showNotification } = useNotification();

  React.useEffect(() => {
    showNotification('Test notification');
  }, [showNotification]);

  return null;
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar una notificación', async () => {
    renderWithProviders(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });
  });

  it('debe mostrar múltiples notificaciones', async () => {
    const MultipleNotificationsTest = () => {
      const { showNotification } = useNotification();

      React.useEffect(() => {
        showNotification('First notification');
        showNotification('Second notification');
        showNotification('Third notification');
      }, [showNotification]);

      return null;
    };

    renderWithProviders(
      <NotificationProvider>
        <MultipleNotificationsTest />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('First notification')).toBeInTheDocument();
      expect(screen.getByText('Second notification')).toBeInTheDocument();
      expect(screen.getByText('Third notification')).toBeInTheDocument();
    });
  });

  it('debe mostrar notificaciones con diferentes tipos', async () => {
    const TypedNotificationsTest = () => {
      const { showNotification } = useNotification();

      React.useEffect(() => {
        showNotification('Success message', 'success');
        showNotification('Error message', 'error');
        showNotification('Info message', 'info');
      }, [showNotification]);

      return null;
    };

    renderWithProviders(
      <NotificationProvider>
        <TypedNotificationsTest />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  it('debe cerrar una notificación después del tiempo especificado', async () => {
    const duration = 100; // 100ms para la prueba
    
    const TimedNotificationTest = () => {
      const { showNotification } = useNotification();

      React.useEffect(() => {
        showNotification('Timed notification', 'info', duration);
      }, [showNotification]);

      return null;
    };

    renderWithProviders(
      <NotificationProvider>
        <TimedNotificationTest />
      </NotificationProvider>
    );

    // La notificación debe estar presente inicialmente
    await waitFor(() => {
      expect(screen.getByText('Timed notification')).toBeInTheDocument();
    });

    // La notificación debe desaparecer después del tiempo especificado
    await waitFor(() => {
      expect(screen.queryByText('Timed notification')).not.toBeInTheDocument();
    }, { timeout: duration + 500 }); // Añadir margen para la animación
  });

  it('debe lanzar error cuando se usa fuera del provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const InvalidTest = () => {
      expect(() => useNotification()).toThrow('useNotification must be used within a NotificationProvider');
      return null;
    };

    render(<InvalidTest />);
    
    consoleErrorSpy.mockRestore();
  });

  it('debe permitir cerrar una notificación manualmente', async () => {
    renderWithProviders(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      const closeButton = screen.getByLabelText('Cerrar notificación');
      expect(closeButton).toBeInTheDocument();
      closeButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
    });
  });
}); 