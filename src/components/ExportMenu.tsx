import React, { useState } from 'react';
import { Icons } from './Icons';
import { exportService, ExportOptions } from '../services/exportService';
import { PrizeStats, PrizeDistribution, TimeStats } from '../services/prizeStatsService';
import '../styles/ExportMenu.css';

interface ExportMenuProps {
  stats: PrizeStats;
  distribution: PrizeDistribution[];
  timeStats: TimeStats[];
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  stats,
  distribution,
  timeStats
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportOptions['format']) => {
    setLoading(true);
    setError(null);

    try {
      await exportService.exportFullReport(stats, distribution, timeStats, {
        format,
        includeCharts: true
      });
    } catch (err) {
      setError('Error al exportar los datos');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="export-menu">
      <button
        className="export-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        {loading ? (
          <span className="loading-spinner">
            <Icons.Spinner />
          </span>
        ) : (
          <Icons.Download />
        )}
        Exportar Datos
      </button>

      {isOpen && (
        <div className="export-dropdown">
          <div className="export-header">
            <h3>Exportar Datos</h3>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              <Icons.Close />
            </button>
          </div>

          {error && (
            <div className="export-error">
              <Icons.Error /> {error}
            </div>
          )}

          <div className="export-options">
            <button
              className="export-option"
              onClick={() => handleExport('csv')}
              disabled={loading}
            >
              <Icons.File /> CSV
              <span className="option-description">
                Datos en formato de texto separado por comas
              </span>
            </button>

            <button
              className="export-option"
              onClick={() => handleExport('excel')}
              disabled={loading}
            >
              <Icons.Excel /> Excel
              <span className="option-description">
                Hoja de cálculo con formato y gráficos
              </span>
            </button>

            <button
              className="export-option"
              onClick={() => handleExport('pdf')}
              disabled={loading}
            >
              <Icons.PDF /> PDF
              <span className="option-description">
                Reporte completo con gráficos y análisis
              </span>
            </button>
          </div>

          <div className="export-footer">
            <small>
              Los datos exportados incluirán todas las estadísticas y gráficos actuales
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu; 