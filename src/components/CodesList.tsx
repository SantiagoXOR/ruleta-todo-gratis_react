/**
 * @module Components
 * @description Componente que lista y gestiona códigos únicos, permitiendo filtrar por premio
 * y estado, con paginación y manejo de estados de carga y error.
 */

import React, { useState, useEffect } from 'react';
import { uniqueCodeService } from '../services/uniqueCodeService';
import { CodeDetails } from './CodeDetails';
import { UniqueCode } from '../types/uniqueCodes.types';
import './CodesList.css';

/**
 * Props para el componente CodesList
 * @typedef {Object} CodesListProps
 * @property {number} [prizeId] - ID opcional del premio para filtrar códigos
 * @property {boolean} [showOnlyValid=false] - Si es true, solo muestra códigos válidos
 */
interface CodesListProps {
  prizeId?: number;
  showOnlyValid?: boolean;
}

/**
 * Componente que lista y gestiona códigos únicos
 * @component
 * @param {CodesListProps} props - Props del componente
 * @returns {JSX.Element} Componente CodesList
 * @example
 * ```tsx
 * // Mostrar todos los códigos
 * <CodesList />
 * 
 * // Mostrar códigos de un premio específico
 * <CodesList prizeId={1} />
 * 
 * // Mostrar solo códigos válidos
 * <CodesList showOnlyValid={true} />
 * 
 * // Mostrar códigos válidos de un premio específico
 * <CodesList prizeId={1} showOnlyValid={true} />
 * ```
 */
export const CodesList: React.FC<CodesListProps> = ({ prizeId, showOnlyValid = false }) => {
  const [codes, setCodes] = useState<UniqueCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await uniqueCodeService.listCodes({
        page,
        prizeId,
        isUsed: showOnlyValid ? false : undefined,
      });

      if (response.success) {
        setCodes(response.data.codes);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.error || 'Error al cargar los códigos');
      }
    } catch (err) {
      setError('Error al cargar los códigos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, [page, prizeId, showOnlyValid]);

  const handleUseCode = async (code: string) => {
    try {
      const response = await uniqueCodeService.useCode(code, 'current-user-id'); // TODO: Obtener el ID real del usuario
      if (response) {
        // Recargar la lista después de usar un código
        loadCodes();
      }
    } catch (err) {
      setError('Error al usar el código');
    }
  };

  if (loading) {
    return (
      <div className="codes-list-loading">
        <div className="spinner"></div>
        <p>Cargando códigos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="codes-list-error">
        <p>{error}</p>
        <button onClick={loadCodes}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="codes-list">
      <div className="codes-list-header">
        <h2>Códigos {showOnlyValid ? 'Válidos' : ''}</h2>
        {prizeId && <span>Premio ID: {prizeId}</span>}
      </div>

      {codes.length === 0 ? (
        <div className="codes-list-empty">
          <p>No hay códigos {showOnlyValid ? 'válidos' : ''} disponibles</p>
        </div>
      ) : (
        <>
          <div className="codes-grid">
            {codes.map((code) => (
              <CodeDetails
                key={code.code}
                code={code}
                onUseCode={handleUseCode}
              />
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};
