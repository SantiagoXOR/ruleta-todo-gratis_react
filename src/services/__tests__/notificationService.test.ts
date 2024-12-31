import { notificationService } from '../notificationService';

describe('NotificationService', () => {
  const mockUserId = 'test-user-id';
  const mockNotification = {
    id: 'test-notification-id',
    type: 'prize_won',
    title: 'Test Notification',
    message: 'This is a test notification',
    timestamp: new Date(),
    read: false,
    priority: 'high',
    recipientId: mockUserId
  };

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Mock de fetch global
    global.fetch = jest.fn();
  });

  describe('getNotifications', () => {
    it('debería obtener las notificaciones del usuario', async () => {
      const mockResponse = [mockNotification];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await notificationService.getNotifications(mockUserId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockUserId}?`,
        expect.any(Object)
      );
    });

    it('debería manejar errores al obtener notificaciones', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.getNotifications(mockUserId))
        .rejects
        .toThrow('Error al obtener notificaciones');
    });
  });

  describe('markAsRead', () => {
    it('debería marcar una notificación como leída', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await notificationService.markAsRead(mockNotification.id);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockNotification.id}/read`,
        expect.any(Object)
      );
    });

    it('debería manejar errores al marcar como leída', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.markAsRead(mockNotification.id))
        .rejects
        .toThrow('Error al marcar notificación como leída');
    });
  });

  describe('deleteNotification', () => {
    it('debería eliminar una notificación', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await notificationService.deleteNotification(mockNotification.id);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockNotification.id}`,
        expect.any(Object)
      );
    });

    it('debería manejar errores al eliminar', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.deleteNotification(mockNotification.id))
        .rejects
        .toThrow('Error al eliminar notificación');
    });
  });

  describe('getPreferences', () => {
    it('debería obtener las preferencias del usuario', async () => {
      const mockPreferences = {
        email: true,
        push: false,
        inApp: true,
        prizeExpiring: true,
        prizeWon: true,
        systemUpdates: false
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPreferences)
      });

      const result = await notificationService.getPreferences(mockUserId);

      expect(result).toEqual(mockPreferences);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockUserId}/preferences`,
        expect.any(Object)
      );
    });

    it('debería manejar errores al obtener preferencias', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.getPreferences(mockUserId))
        .rejects
        .toThrow('Error al obtener preferencias de notificaciones');
    });
  });

  describe('updatePreferences', () => {
    it('debería actualizar las preferencias del usuario', async () => {
      const mockUpdates = {
        email: false,
        push: true
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await notificationService.updatePreferences(mockUserId, mockUpdates);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockUserId}/preferences`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockUpdates)
        })
      );
    });

    it('debería manejar errores al actualizar preferencias', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.updatePreferences(mockUserId, {}))
        .rejects
        .toThrow('Error al actualizar preferencias de notificaciones');
    });
  });

  describe('checkExpiringPrizes', () => {
    it('debería obtener los premios próximos a vencer', async () => {
      const mockPrizes = [{
        id: 'test-prize-id',
        name: 'Test Prize',
        code: '123456',
        expiresAt: new Date()
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrizes)
      });

      const result = await notificationService.checkExpiringPrizes(mockUserId);

      expect(result).toEqual(mockPrizes);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockUserId}/expiring-prizes`,
        expect.any(Object)
      );
    });

    it('debería manejar errores al verificar premios próximos a vencer', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.checkExpiringPrizes(mockUserId))
        .rejects
        .toThrow('Error al verificar premios próximos a vencer');
    });
  });

  describe('sendCustomNotification', () => {
    it('debería enviar una notificación personalizada', async () => {
      const mockCustomNotification = {
        title: 'Custom Notification',
        message: 'This is a custom notification',
        priority: 'medium',
        data: { key: 'value' }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await notificationService.sendCustomNotification(mockUserId, mockCustomNotification);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/notifications/${mockUserId}/custom`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockCustomNotification)
        })
      );
    });

    it('debería manejar errores al enviar notificación personalizada', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(notificationService.sendCustomNotification(mockUserId, {
        title: 'Test',
        message: 'Test',
        priority: 'low',
        data: {}
      }))
        .rejects
        .toThrow('Error al enviar notificación personalizada');
    });
  });
}); 