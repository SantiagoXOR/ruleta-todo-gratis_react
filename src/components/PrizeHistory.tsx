import React, { useState, useEffect } from 'react';
import { prizeHistoryService, PrizeHistoryItem, PrizeHistoryFilter, ExportFormat } from '../services/prizeHistoryService';
import { History, Download, Spinner, Error, ArrowLeft, ArrowRight } from './Icons';
import '../styles/variables.css';
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
    <div className="prize-history" role="region" aria-label="Historial de Premios">
      <div className="history-header">
        <h2 className="history-title">
          <History className="icon" /> Historial de Premios
        </h2>
        <div className="export-controls">
          <select
            className="export-format-select"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            disabled={exporting}
            aria-label="Formato de exportación"
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="pdf">PDF (.pdf)</option>
          </select>
          <button 
            className="export-button"
            onClick={handleExport}
            disabled={exporting || loading}
            aria-busy={exporting}
            aria-label={exporting ? 'Exportando...' : 'Exportar historial'}
          >
            {exporting ? (
              <span className="loading-spinner" aria-hidden="true">
                <Spinner className="icon" />
              </span>
            ) : (
              <>
                <Download className="icon" /> Exportar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="history-filters" role="search" aria-label="Filtros de historial">
        <div className="filter-group">
          <label htmlFor="status-filter">Estado:</label>
          <select
            id="status-filter"
            value={filter.claimed?.toString() ?? 'all'}
            onChange={(e) => handleFilterChange({
              claimed: e.target.value === 'all' ? undefined : e.target.value === 'true'
            })}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos</option>
            <option value="true">Canjeados</option>
            <option value="false">Pendientes</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date">Desde:</label>
          <input
            id="start-date"
            type="date"
            value={filter.startDate?.toISOString().split('T')[0] ?? ''}
            onChange={(e) => handleFilterChange({
              startDate: e.target.value ? new Date(e.target.value) : undefined
            })}
            aria-label="Fecha inicial"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">Hasta:</label>
          <input
            id="end-date"
            type="date"
            value={filter.endDate?.toISOString().split('T')[0] ?? ''}
            onChange={(e) => handleFilterChange({
              endDate: e.target.value ? new Date(e.target.value) : undefined
            })}
            aria-label="Fecha final"
          />
        </div>
      </div>

      {error && (
        <div className="history-error" role="alert">
          <Error className="icon" /> {error}
        </div>
      )}

      <div className="history-table-container">
        <table className="history-table" role="grid" aria-busy={loading}>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Premio</th>
              <th scope="col">Fecha de Generación</th>
              <th scope="col">Estado</th>
              <th scope="col">Fecha de Canje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="loading-cell">
                  <span className="loading-spinner" aria-hidden="true">
                    <Spinner className="icon" />
                  </span>
                  <span>Cargando...</span>
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
                    <span 
                      className={`status-badge ${prize.claimed ? 'claimed' : 'pending'}`}
                      role="status"
                    >
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
        <div className="pagination" role="navigation" aria-label="Paginación">
          <button
            className="page-button"
            disabled={filter.page === 1}
            onClick={() => handlePageChange(filter.page! - 1)}
            aria-label="Página anterior"
          >
            <ArrowLeft className="icon" /> Anterior
          </button>
          <span className="page-info" aria-current="page">
            Página {filter.page} de {Math.ceil(total / filter.limit!)}
          </span>
          <button
            className="page-button"
            disabled={filter.page! * filter.limit! >= total}
            onClick={() => handlePageChange(filter.page! + 1)}
            aria-label="Página siguiente"
          >
            Siguiente <ArrowRight className="icon" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PrizeHistory; 