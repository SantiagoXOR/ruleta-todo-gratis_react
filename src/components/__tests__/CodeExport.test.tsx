import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeExport } from '../CodeExport';
import { uniqueCodeService } from '../../services/uniqueCodeService';

// Mock del servicio
vi.mock('../../services/uniqueCodeService', () => ({
  uniqueCodeService: {
    exportCodes: vi.fn(),
  },
}));

describe('CodeExport', () => {
  // Mock de URL.createObjectURL y URL.revokeObjectURL
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configurar mocks de URL
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;
    mockCreateObjectURL.mockReturnValue('mock-url');

    // Mock de document.createElement para el link de descarga
    const mockLink = {
      click: vi.fn(),
      setAttribute: vi.fn(),
      href: '',
    };
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockLink as any;
      return document.createElement(tag);
    });
  });

  it('renderiza todas las opciones de exportación', () => {
    render(<CodeExport />);

    // Verificar opciones de formato
    expect(screen.getByLabelText('CSV')).toBeInTheDocument();
    expect(screen.getByLabelText('Excel')).toBeInTheDocument();

    // Verificar selector de rango de fechas
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();

    // Verificar checkboxes
    expect(screen.getByLabelText('Códigos Usados')).toBeInTheDocument();
    expect(screen.getByLabelText('Códigos Expirados')).toBeInTheDocument();

    // Verificar botón de exportar
    expect(screen.getByText('Exportar Códigos')).toBeInTheDocument();
  });

  it('maneja la exportación exitosa', async () => {
    (uniqueCodeService.exportCodes as any).mockResolvedValue({
      success: true,
      data: 'mock-data',
    });

    render(<CodeExport />);

    const exportButton = screen.getByText('Exportar Códigos');
    fireEvent.click(exportButton);

    // Verificar estado de carga
    expect(screen.getByText('Exportando...')).toBeInTheDocument();

    await waitFor(() => {
      // Verificar que se llamó al servicio con las opciones correctas
      expect(uniqueCodeService.exportCodes).toHaveBeenCalledWith({
        format: 'csv',
        dateRange: 'all',
        includeUsed: true,
        includeExpired: false,
      });

      // Verificar que se creó el blob y el link
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  it('maneja errores de exportación', async () => {
    (uniqueCodeService.exportCodes as any).mockResolvedValue({
      success: false,
      error: 'Error al exportar códigos',
    });

    render(<CodeExport />);

    const exportButton = screen.getByText('Exportar Códigos');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Error al exportar códigos')).toBeInTheDocument();
    });
  });

  it('actualiza las opciones correctamente', () => {
    render(<CodeExport />);

    // Cambiar formato
    const excelRadio = screen.getByLabelText('Excel');
    fireEvent.click(excelRadio);
    expect(excelRadio).toBeChecked();

    // Cambiar rango de fechas
    const dateSelect = screen.getByRole('combobox');
    fireEvent.change(dateSelect, { target: { value: 'week' } });
    expect(dateSelect.value).toBe('week');

    // Cambiar checkboxes
    const usedCheckbox = screen.getByLabelText('Códigos Usados');
    const expiredCheckbox = screen.getByLabelText('Códigos Expirados');

    fireEvent.click(usedCheckbox);
    fireEvent.click(expiredCheckbox);

    expect(usedCheckbox).not.toBeChecked();
    expect(expiredCheckbox).toBeChecked();
  });

  it('deshabilita el botón durante la exportación', async () => {
    (uniqueCodeService.exportCodes as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<CodeExport />);

    const exportButton = screen.getByText('Exportar Códigos');
    fireEvent.click(exportButton);

    expect(exportButton).toBeDisabled();
    expect(screen.getByText('Exportando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(exportButton).not.toBeDisabled();
      expect(screen.getByText('Exportar Códigos')).toBeInTheDocument();
    });
  });

  it('limpia los recursos después de la exportación', async () => {
    (uniqueCodeService.exportCodes as any).mockResolvedValue({
      success: true,
      data: 'mock-data',
    });

    render(<CodeExport />);

    const exportButton = screen.getByText('Exportar Códigos');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });

  it('maneja errores de red', async () => {
    (uniqueCodeService.exportCodes as any).mockRejectedValue(new Error('Network error'));

    render(<CodeExport />);

    const exportButton = screen.getByText('Exportar Códigos');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText('Error al exportar códigos')).toBeInTheDocument();
      expect(exportButton).not.toBeDisabled();
    });
  });
});
