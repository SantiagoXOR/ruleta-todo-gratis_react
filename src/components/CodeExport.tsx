import React, { useState, useCallback, useMemo } from 'react';
import { uniqueCodeService } from '../services/uniqueCodeService';
import { Download } from './Icons';
import '../styles/CodeExport.css';

interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: 'all' | 'week' | 'month' | 'year';
  includeUsed: boolean;
  includeExpired: boolean;
}

const CodeExport: React.FC = () => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'all',
    includeUsed: true,
    includeExpired: false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoizar las opciones de fecha para evitar recálculos innecesarios
  const dateRangeOptions = useMemo(() => [
    { value: 'all', label: 'Todos' },
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Último Mes' },
    { value: 'year', label: 'Último Año' }
  ], []);

  // Memoizar los manejadores de eventos para evitar recreaciones innecesarias
  const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'excel' }));
    setError(null);
  }, []);

  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setOptions(prev => ({ ...prev, dateRange: e.target.value as ExportOptions['dateRange'] }));
    setError(null);
  }, []);

  const handleUsedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, includeUsed: e.target.checked }));
    setError(null);
  }, []);

  const handleExpiredChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, includeExpired: e.target.checked }));
    setError(null);
  }, []);

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setError(null);

    try {
      const response = await uniqueCodeService.exportCodes(options);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al exportar códigos');
      }

      // Descargar el archivo
      const link = document.createElement('a');
      link.href = response.data.url;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Error al exportar códigos');
      console.error('Error al exportar códigos:', err);
    } finally {
      setIsExporting(false);
    }
  }, [options, isExporting]);

  // Memoizar el contenido del botón para evitar recreaciones innecesarias
  const buttonContent = useMemo(() => {
    if (isExporting) {
      return 'Exportando...';
    }
    return (
      <>
        <Download className="code-export-icon" />
        Exportar Códigos
      </>
    );
  }, [isExporting]);

  return (
    <div className="code-export">
      <div className="code-export-options">
        <div className="code-export-section">
          <h3>Formato</h3>
          <div className="code-export-radio-group">
            <label>
              <input
                type="radio"
                name="format"
                value="csv"
                checked={options.format === 'csv'}
                onChange={handleFormatChange}
                disabled={isExporting}
              />
              CSV
            </label>
            <label>
              <input
                type="radio"
                name="format"
                value="excel"
                checked={options.format === 'excel'}
                onChange={handleFormatChange}
                disabled={isExporting}
              />
              Excel
            </label>
          </div>
        </div>

        <div className="code-export-section">
          <h3>Rango de Fechas</h3>
          <select
            value={options.dateRange}
            onChange={handleDateRangeChange}
            disabled={isExporting}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="code-export-section">
          <h3>Filtros</h3>
          <div className="code-export-checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={options.includeUsed}
                onChange={handleUsedChange}
                disabled={isExporting}
              />
              Códigos Usados
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.includeExpired}
                onChange={handleExpiredChange}
                disabled={isExporting}
              />
              Códigos Expirados
            </label>
          </div>
        </div>
      </div>

      {error && <div className="code-export-error" role="alert">{error}</div>}

      <button
        className="code-export-button"
        onClick={handleExport}
        disabled={isExporting}
        aria-busy={isExporting}
      >
        {buttonContent}
      </button>
    </div>
  );
};

export default CodeExport;
