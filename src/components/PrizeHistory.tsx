import React, { useState, useEffect } from 'react';
import { prizeHistoryService, PrizeHistoryItem, PrizeHistoryFilter, ExportFormat } from '../services/prizeHistoryService';
import { Icons } from './Icons';
import '../styles/PrizeHistory.css';

interface PrizeHistoryProps {
  storeId?: string;
  initialFilter?: PrizeHistoryFilter;
}

const PrizeHistory: React.FC<PrizeHistoryProps> = ({ storeId, initialFilter = {} }) => {
  const [prizes, setPrizes] = useState<PrizeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PrizeHistoryFilter>({
    ...initialFilter,
    page: 1,
    limit: 10
  });
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('xlsx');

  const loadPrizes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await prizeHistoryService.getPrizeHistory({
        ...filter,
        storeId
      });

      if (response.success) {
        setPrizes(response.prizes);
        setTotal(response.total);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error al cargar el historial de premios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrizes();
  }, [filter, storeId]);

  const handleFilterChange = (changes: Partial<PrizeHistoryFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...changes,
      page: 1 // Resetear página al cambiar filtros
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilter(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await prizeHistoryService.exportHistory({
        ...filter,
        storeId
      }, exportFormat);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = prizeHistoryService.getFileName(exportFormat);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al exportar el historial');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="prize-history">
      <div className="history-header">
        <h2 className="history-title">
          <Icons.History /> Historial de Premios
        </h2>
        <div className="export-controls">
          <select
            className="export-format-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            disabled={exporting}
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="pdf">PDF (.pdf)</option>
          </select>
          <button 
            className="export-button"
            onClick={handleExport}
            disabled={exporting || loading}
          >
            {exporting ? (
              <span className="loading-spinner">
                <Icons.Spinner />
              </span>
            ) : (
              <>
                <Icons.Download /> Exportar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={filter.claimed?.toString() ?? 'all'}
            onChange={(e) => handleFilterChange({
              claimed: e.target.value === 'all' ? undefined : e.target.value === 'true'
            })}
          >
            <option value="all">Todos</option>
            <option value="true">Canjeados</option>
            <option value="false">Pendientes</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Desde:</label>
          <input
            type="date"
            value={filter.startDate?.toISOString().split('T')[0] ?? ''}
            onChange={(e) => handleFilterChange({
              startDate: e.target.value ? new Date(e.target.value) : undefined
            })}
          />
        </div>

        <div className="filter-group">
          <label>Hasta:</label>
          <input
            type="date"
            value={filter.endDate?.toISOString().split('T')[0] ?? ''}
            onChange={(e) => handleFilterChange({
              endDate: e.target.value ? new Date(e.target.value) : undefined
            })}
          />
        </div>
      </div>

      {error && (
        <div className="history-error">
          <Icons.Error /> {error}
        </div>
      )}

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Premio</th>
              <th>Fecha de Generación</th>
              <th>Estado</th>
              <th>Fecha de Canje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="loading-cell">
                  <span className="loading-spinner">
                    <Icons.Spinner />
                  </span>
                  Cargando...
                </td>
              </tr>
            ) : prizes.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  No hay premios para mostrar
                </td>
              </tr>
            ) : (
              prizes.map((prize) => (
                <tr key={prize.code}>
                  <td>{prize.code}</td>
                  <td>{prize.name}</td>
                  <td>{new Date(prize.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${prize.claimed ? 'claimed' : 'pending'}`}>
                      {prize.claimed ? 'Canjeado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    {prize.redeemedAt ? (
                      new Date(prize.redeemedAt).toLocaleString()
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > filter.limit! && (
        <div className="pagination">
          <button
            className="page-button"
            disabled={filter.page === 1}
            onClick={() => handlePageChange(filter.page! - 1)}
          >
            <Icons.ArrowLeft /> Anterior
          </button>
          <span className="page-info">
            Página {filter.page} de {Math.ceil(total / filter.limit!)}
          </span>
          <button
            className="page-button"
            disabled={filter.page! * filter.limit! >= total}
            onClick={() => handlePageChange(filter.page! + 1)}
          >
            Siguiente <Icons.ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default PrizeHistory; 