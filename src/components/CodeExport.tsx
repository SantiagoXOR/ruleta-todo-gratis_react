import React, { useState } from 'react';
import { uniqueCodeService } from '../services/uniqueCodeService';
import './CodeExport.css';

interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: 'all' | 'week' | 'month' | 'year';
  includeUsed: boolean;
  includeExpired: boolean;
  prizeId?: number;
}

export const CodeExport: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'all',
    includeUsed: true,
    includeExpired: false,
  });

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const response = await uniqueCodeService.exportCodes(options);
      
      if (response.success) {
        // Crear un blob con los datos
        const blob = new Blob([response.data], {
          type: options.format === 'csv'
            ? 'text/csv;charset=utf-8;'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Crear URL del blob
        const url = window.URL.createObjectURL(blob);

        // Crear link temporal y simular click
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `codigos_${new Date().toISOString().split('T')[0]}.${options.format}`);
        document.body.appendChild(link);
        link.click();

        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError(response.error || 'Error al exportar códigos');
      }
    } catch (err) {
      setError('Error al exportar códigos');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-container">
      <h2>Exportar Códigos</h2>

      <div className="export-options">
        <div className="option-group">
          <label>Formato</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="format"
                checked={options.format === 'csv'}
                onChange={() => setOptions({ ...options, format: 'csv' })}
              />
              CSV
            </label>
            <label>
              <input
                type="radio"
                name="format"
                checked={options.format === 'excel'}
                onChange={() => setOptions({ ...options, format: 'excel' })}
              />
              Excel
            </label>
          </div>
        </div>

        <div className="option-group">
          <label>Rango de Fechas</label>
          <select
            value={options.dateRange}
            onChange={(e) => setOptions({ ...options, dateRange: e.target.value as ExportOptions['dateRange'] })}
          >
            <option value="all">Todos</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mes</option>
            <option value="year">Último Año</option>
          </select>
        </div>

        <div className="option-group">
          <label>Incluir</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={options.includeUsed}
                onChange={(e) => setOptions({ ...options, includeUsed: e.target.checked })}
              />
              Códigos Usados
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.includeExpired}
                onChange={(e) => setOptions({ ...options, includeExpired: e.target.checked })}
              />
              Códigos Expirados
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="export-error">
          <p>{error}</p>
        </div>
      )}

      <button
        className={`export-button ${exporting ? 'loading' : ''}`}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exportando...' : 'Exportar Códigos'}
      </button>
    </div>
  );
};
