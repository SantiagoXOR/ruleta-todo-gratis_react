import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeExport from '../CodeExport';
import { uniqueCodeService } from '../../services/uniqueCodeService';
import type { ExportResponse } from '../../types/uniqueCodes.types';

// Mock del servicio
vi.mock('../../services/uniqueCodeService', () => ({
  uniqueCodeService: {
    exportCodes: vi.fn()
  }
}));

describe('CodeExport', () => {
  const mockSuccessResponse: ExportResponse = {
    success: true,
    data: {
      url: 'mock-url',
      filename: 'mock-file.csv'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (uniqueCodeService.exportCodes as any).mockResolvedValue(mockSuccessResponse);
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<CodeExport />);
      
      // Verifica los encabezados de sección
      expect(screen.getByText('Formato')).toBeInTheDocument();
      expect(screen.getByText('Rango de Fechas')).toBeInTheDocument();
      expect(screen.getByText('Filtros')).toBeInTheDocument();

      // Verifica las opciones de formato
      expect(screen.getByLabelText('CSV')).toBeInTheDocument();
      expect(screen.getByLabelText('Excel')).toBeInTheDocument();

      // Verifica el selector de rango de fechas
      const dateRangeSelect = screen.getByRole('combobox');
      expect(dateRangeSelect).toBeInTheDocument();
      expect(dateRangeSelect).toHaveValue('all');

      // Verifica los checkboxes de filtros
      expect(screen.getByLabelText('Códigos Usados')).toBeInTheDocument();
      expect(screen.getByLabelText('Códigos Expirados')).toBeInTheDocument();

      // Verifica el botón de exportar
      const exportButton = screen.getByRole('button');
      expect(exportButton).toHaveTextContent('Exportar Códigos');
      expect(exportButton).not.toBeDisabled();
    });

    it('shows initial state correctly', () => {
      render(<CodeExport />);
      
      // Verifica los valores iniciales
      expect(screen.getByLabelText('CSV')).toBeChecked();
      expect(screen.getByLabelText('Excel')).not.toBeChecked();
      expect(screen.getByLabelText('Códigos Usados')).toBeChecked();
      expect(screen.getByLabelText('Códigos Expirados')).not.toBeChecked();
      expect(screen.getByRole('combobox')).toHaveValue('all');
    });
  });

  describe('User Interactions', () => {
    it('updates format when radio buttons are clicked', () => {
      render(<CodeExport />);
      
      const excelRadio = screen.getByLabelText('Excel');
      fireEvent.click(excelRadio);
      expect(excelRadio).toBeChecked();
      expect(screen.getByLabelText('CSV')).not.toBeChecked();
    });

    it('updates date range when select is changed', () => {
      render(<CodeExport />);
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'week' } });
      expect(select).toHaveValue('week');
    });

    it('updates filters when checkboxes are clicked', () => {
      render(<CodeExport />);
      
      const usedCheckbox = screen.getByLabelText('Códigos Usados');
      const expiredCheckbox = screen.getByLabelText('Códigos Expirados');

      fireEvent.click(usedCheckbox);
      fireEvent.click(expiredCheckbox);

      expect(usedCheckbox).not.toBeChecked();
      expect(expiredCheckbox).toBeChecked();
    });
  });

  describe('Export Functionality', () => {
    it('handles successful export correctly', async () => {
      const { container } = render(<CodeExport />);
      
      const exportButton = screen.getByRole('button');
      fireEvent.click(exportButton);

      // Verifica el estado de carga
      expect(exportButton).toBeDisabled();
      expect(screen.getByText('Exportando...')).toBeInTheDocument();

      // Verifica que todos los controles estén deshabilitados durante la exportación
      expect(screen.getByLabelText('CSV')).toBeDisabled();
      expect(screen.getByLabelText('Excel')).toBeDisabled();
      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByLabelText('Códigos Usados')).toBeDisabled();
      expect(screen.getByLabelText('Códigos Expirados')).toBeDisabled();

      // Espera a que se complete la exportación
      await waitFor(() => {
        expect(exportButton).not.toBeDisabled();
        expect(exportButton).toHaveTextContent('Exportar Códigos');
      });

      // Verifica que el servicio fue llamado con las opciones correctas
      expect(uniqueCodeService.exportCodes).toHaveBeenCalledWith({
        format: 'csv',
        dateRange: 'all',
        includeUsed: true,
        includeExpired: false
      });

      // Verifica que se creó y eliminó el enlace de descarga
      expect(container.querySelector('a')).toBeNull();
    });

    it('handles export error correctly', async () => {
      (uniqueCodeService.exportCodes as any).mockRejectedValueOnce(new Error('Export failed'));

      render(<CodeExport />);
      
      const exportButton = screen.getByRole('button');
      fireEvent.click(exportButton);

      // Espera a que aparezca el mensaje de error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Error al exportar códigos');
      });

      // Verifica que el botón vuelva a estar habilitado
      expect(exportButton).not.toBeDisabled();
      expect(exportButton).toHaveTextContent('Exportar Códigos');

      // Verifica que los controles vuelvan a estar habilitados
      expect(screen.getByLabelText('CSV')).not.toBeDisabled();
      expect(screen.getByLabelText('Excel')).not.toBeDisabled();
      expect(screen.getByRole('combobox')).not.toBeDisabled();
      expect(screen.getByLabelText('Códigos Usados')).not.toBeDisabled();
      expect(screen.getByLabelText('Códigos Expirados')).not.toBeDisabled();
    });

    it('prevents multiple simultaneous exports', async () => {
      render(<CodeExport />);
      
      const exportButton = screen.getByRole('button');
      
      // Primer click
      fireEvent.click(exportButton);
      expect(exportButton).toBeDisabled();
      
      // Segundo click no debería llamar al servicio nuevamente
      fireEvent.click(exportButton);
      expect(uniqueCodeService.exportCodes).toHaveBeenCalledTimes(1);
    });
  });
});
