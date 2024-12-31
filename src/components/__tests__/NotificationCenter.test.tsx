import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationCenter from '../NotificationCenter';
import { notificationService } from '../../services/notificationService';
import { securityService } from '../../services/securityService';

// Mock de los servicios
jest.mock('../../services/notificationService');
jest.mock('../../services/securityService');

describe('NotificationCenter', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockNotifications = [
    {
      id: '1',
      type: 'prize_won',
      title: 'Premio Ganado',
      message: '¡Felicidades! Has ganado un premio.',
      timestamp: new Date(),
      read: false,
      priority: 'high',
      recipientId: mockUser.id
    },
    {
      id: '2',
      type: 'prize_expiring',
      title: 'Premio por Vencer',
      message: 'Tu premio vencerá pronto.',
      timestamp: new Date(),
      read: true,
      priority: 'medium',
      recipientId: mockUser.id
    }
  ];

  const mockPreferences = {
    email: true,
    push: false,
    inApp: true,
    prizeExpiring: true,
    prizeWon: true,
    systemUpdates: false
  };

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();

    // Configurar mocks de los servicios
    (securityService.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (notificationService.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <NotificationCenter />
      </BrowserRouter>
    );
  };

  it('debería renderizar el componente correctamente', async () => {
    renderComponent();

    // Verificar que se muestre el título
    expect(screen.getByText('Notificaciones')).toBeInTheDocument();

    // Verificar que se muestren las notificaciones
    await waitFor(() => {
      expect(screen.getByText('Premio Ganado')).toBeInTheDocument();
      expect(screen.getByText('Premio por Vencer')).toBeInTheDocument();
    });
  });

  it('debería mostrar el estado de carga', () => {
    renderComponent();

    expect(screen.getByText('Cargando notificaciones...')).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay notificaciones', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue([]);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
    });
  });

  it('debería marcar una notificación como leída', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Premio Ganado')).toBeInTheDocument();
    });

    const markAsReadButton = screen.getAllByTitle('Marcar como leída')[0];
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('debería eliminar una notificación', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Premio Ganado')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByTitle('Eliminar')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(notificationService.deleteNotification).toHaveBeenCalledWith('1');
    });
  });

  it('debería mostrar y ocultar el panel de preferencias', async () => {
    renderComponent();

    // Mostrar preferencias
    const preferencesButton = screen.getByText('Preferencias');
    fireEvent.click(preferencesButton);

    await waitFor(() => {
      expect(screen.getByText('Preferencias de Notificaciones')).toBeInTheDocument();
    });

    // Verificar que se muestren las opciones de preferencias
    expect(screen.getByText('Notificaciones en la aplicación')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones por email')).toBeInTheDocument();
    expect(screen.getByText('Premios próximos a vencer')).toBeInTheDocument();

    // Ocultar preferencias
    fireEvent.click(preferencesButton);

    await waitFor(() => {
      expect(screen.queryByText('Preferencias de Notificaciones')).not.toBeInTheDocument();
    });
  });

  it('debería actualizar las preferencias', async () => {
    renderComponent();

    // Mostrar preferencias
    fireEvent.click(screen.getByText('Preferencias'));

    await waitFor(() => {
      expect(screen.getByText('Preferencias de Notificaciones')).toBeInTheDocument();
    });

    // Cambiar una preferencia
    const emailCheckbox = screen.getByLabelText('Notificaciones por email');
    fireEvent.click(emailCheckbox);

    await waitFor(() => {
      expect(notificationService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ email: false })
      );
    });
  });

  it('debería manejar errores al cargar notificaciones', async () => {
    const error = new Error('Error al cargar las notificaciones');
    (notificationService.getNotifications as jest.Mock).mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las notificaciones')).toBeInTheDocument();
    });
  });

  it('debería manejar errores al cargar preferencias', async () => {
    const error = new Error('Error al cargar las preferencias');
    (notificationService.getPreferences as jest.Mock).mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las preferencias')).toBeInTheDocument();
    });
  });

  it('debería navegar al hacer clic en una notificación con URL', async () => {
    const notificationWithUrl = {
      ...mockNotifications[0],
      data: { url: '/prizes/123' }
    };
    (notificationService.getNotifications as jest.Mock).mockResolvedValue([notificationWithUrl]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Premio Ganado')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Premio Ganado'));

    // Verificar que se intente marcar como leída
    expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
  });
}); 