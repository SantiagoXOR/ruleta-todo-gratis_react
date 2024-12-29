import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Wheel } from '../../components/Wheel';
import PrizeValidator from '../../components/PrizeValidator';
import PrizeHistory from '../../components/PrizeHistory';
import { prizeValidationService } from '../../services/prizeValidationService';
import { prizeHistoryService } from '../../services/prizeHistoryService';

// Mock de servicios
vi.mock('../../services/prizeValidationService');
vi.mock('../../services/prizeHistoryService');

const mockPrize = {
  id: 1,
  code: 'TEST123',
  name: 'Premio de Prueba',
  description: 'Descripción del premio',
  color: '#FF0000',
  icon: null,
  timestamp: Date.now(),
  claimed: false,
  expiresAt: Date.now() + 86400000
};

describe('Sistema de Premios - Tests de Integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Flujo de Generación y Validación de Premio', () => {
    it('debería generar un premio y permitir su validación', async () => {
      // Mock de la generación del premio
      const onPrizeWon = vi.fn();
      render(<Wheel onPrizeWon={onPrizeWon} />);

      // Simular giro de la ruleta
      const spinButton = screen.getByText('¡GIRÁ Y GANÁ!');
      await userEvent.click(spinButton);

      // Esperar a que se genere el premio
      await waitFor(() => {
        expect(onPrizeWon).toHaveBeenCalledWith(expect.objectContaining({
          code: expect.any(String)
        }));
      });

      // Mock de la validación del premio
      (prizeValidationService.validatePrize as any).mockResolvedValueOnce({
        success: true,
        message: 'Premio validado correctamente',
        prize: mockPrize
      });

      // Renderizar el validador
      render(<PrizeValidator storeId="test-store" />);

      // Ingresar el código del premio
      const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
      await userEvent.type(codeInput, mockPrize.code);

      // Validar el premio
      const validateButton = screen.getByText('Validar');
      await userEvent.click(validateButton);

      // Verificar que se validó correctamente
      await waitFor(() => {
        expect(screen.getByText('Premio validado correctamente')).toBeInTheDocument();
      });
    });
  });

  describe('Flujo de Historial y Exportación', () => {
    it('debería mostrar premios en el historial y permitir su exportación', async () => {
      // Mock del historial
      (prizeHistoryService.getPrizeHistory as any).mockResolvedValueOnce({
        success: true,
        prizes: [mockPrize],
        total: 1
      });

      render(<PrizeHistory />);

      // Verificar que el premio aparece en el historial
      await waitFor(() => {
        expect(screen.getByText(mockPrize.code)).toBeInTheDocument();
      });

      // Mock de la exportación
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });
      (prizeHistoryService.exportHistory as any).mockResolvedValueOnce(mockBlob);

      // Mock de funciones del DOM
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
      const mockAnchor = { click: vi.fn(), href: '', download: '' };
      document.createElement = vi.fn().mockReturnValue(mockAnchor);

      // Exportar historial
      const exportButton = screen.getByText('Exportar');
      await userEvent.click(exportButton);

      // Verificar la exportación
      await waitFor(() => {
        expect(prizeHistoryService.exportHistory).toHaveBeenCalled();
        expect(mockAnchor.click).toHaveBeenCalled();
      });
    });
  });

  describe('Flujo de Filtrado y Paginación', () => {
    it('debería filtrar premios y manejar la paginación correctamente', async () => {
      // Mock inicial del historial
      (prizeHistoryService.getPrizeHistory as any).mockResolvedValueOnce({
        success: true,
        prizes: [mockPrize],
        total: 20
      });

      render(<PrizeHistory />);

      // Aplicar filtro por estado
      const select = screen.getByLabelText('Estado:');
      await userEvent.selectOptions(select, 'false');

      // Verificar que se aplicó el filtro
      await waitFor(() => {
        expect(prizeHistoryService.getPrizeHistory).toHaveBeenCalledWith(
          expect.objectContaining({ claimed: false })
        );
      });

      // Cambiar de página
      const nextButton = screen.getByText('Siguiente');
      await userEvent.click(nextButton);

      // Verificar la paginación
      await waitFor(() => {
        expect(prizeHistoryService.getPrizeHistory).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  describe('Manejo de Errores', () => {
    it('debería manejar errores en la validación y el historial', async () => {
      // Mock de error en la validación
      (prizeValidationService.validatePrize as any).mockRejectedValueOnce(
        new Error('Error de validación')
      );

      render(<PrizeValidator storeId="test-store" />);

      // Intentar validar un código
      const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
      await userEvent.type(codeInput, 'INVALID');
      const validateButton = screen.getByText('Validar');
      await userEvent.click(validateButton);

      // Verificar mensaje de error
      await waitFor(() => {
        expect(screen.getByText(/Error al validar el premio/)).toBeInTheDocument();
      });

      // Mock de error en el historial
      (prizeHistoryService.getPrizeHistory as any).mockRejectedValueOnce(
        new Error('Error al cargar historial')
      );

      render(<PrizeHistory />);

      // Verificar mensaje de error en el historial
      await waitFor(() => {
        expect(screen.getByText(/Error al cargar el historial/)).toBeInTheDocument();
      });
    });
  });
}); 