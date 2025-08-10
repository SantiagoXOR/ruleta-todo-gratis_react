/**
 * @module Components
 * @description Componente que muestra los detalles de un código único, incluyendo su estado,
 * tiempo de expiración y opciones de uso.
 */

import React from 'react';
import { UniqueCode } from '../types/uniqueCodes.types';
// import { formatDistanceToNow } from 'date-fns';
// import { es } from 'date-fns/locale/es';
import './CodeDetails.css';

/**
 * Props para el componente CodeDetails
 * @typedef {Object} CodeDetailsProps
 * @property {UniqueCode} code - El código único a mostrar
 * @property {(code: string) => Promise<void>} [onUseCode] - Callback opcional para usar el código
 */
interface CodeDetailsProps {
  code: UniqueCode;
  onUseCode?: (code: string) => Promise<void>;
}

/**
 * Componente que muestra los detalles de un código único
 * @component
 * @param {CodeDetailsProps} props - Props del componente
 * @returns {JSX.Element} Componente CodeDetails
 * @example
 * ```tsx
 * const code = {
 *   code: 'ABC123',
 *   prizeId: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   expiresAt: '2024-02-01T00:00:00Z',
 *   isUsed: false
 * };
 * 
 * return (
 *   <CodeDetails 
 *     code={code}
 *     onUseCode={async (code) => {
 *       await useCode(code);
 *     }}
 *   />
 * );
 * ```
 */
export const CodeDetails: React.FC<CodeDetailsProps> = ({ code, onUseCode }) => {
  const isExpired = new Date() > new Date(code.expiresAt);
  const timeLeft = !isExpired
    ? `Expira el ${new Date(code.expiresAt).toLocaleDateString('es-ES')}`
    : 'Expirado';

  const handleUseCode = async () => {
    if (onUseCode && !code.isUsed && !isExpired) {
      await onUseCode(code.code);
    }
  };

  return (
    <div className="code-details">
      <div className="code-header">
        <h3>Código: {code.code}</h3>
        <span className={`code-status ${code.isUsed ? 'used' : isExpired ? 'expired' : 'valid'}`}>
          {code.isUsed ? 'Usado' : isExpired ? 'Expirado' : 'Válido'}
        </span>
      </div>

      <div className="code-info">
        <div className="info-row">
          <span className="label">Premio ID:</span>
          <span className="value">{code.prizeId}</span>
        </div>

        <div className="info-row">
          <span className="label">Creado:</span>
          <span className="value">
            {new Date(code.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="info-row">
          <span className="label">Expira:</span>
          <span className="value">{timeLeft}</span>
        </div>

        {code.isUsed && code.usedBy && (
          <div className="info-row">
            <span className="label">Usado por:</span>
            <span className="value">{code.usedBy}</span>
          </div>
        )}

        {code.isUsed && code.usedAt && (
          <div className="info-row">
            <span className="label">Usado el:</span>
            <span className="value">
              {new Date(code.usedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>

      {!code.isUsed && !isExpired && onUseCode && (
        <button
          className="use-code-button"
          onClick={handleUseCode}
        >
          Usar Código
        </button>
      )}
    </div>
  );
};
