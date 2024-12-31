import React, { useState } from 'react';
import { prizeService } from '../services/prizes';
import { Icons } from './Icons';
import '../styles/PrizeVerifier.css';

interface PrizeType {
  code: string;
  name: string;
  claimed: boolean;
  expiresAt: number;
}

function PrizeVerifier() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [prize, setPrize] = useState<PrizeType | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage('Verificando código...');
      
      const prizeData = await prizeService.getPrizeByCode(code);
      
      if (!prizeData) {
        setError('Código inválido');
        return;
      }

      if (!prizeService.isPrizeValid(prizeData)) {
        setError('Este premio ha expirado');
        return;
      }

      setPrize(prizeData);
      setMessage('Premio encontrado');
    } catch (err) {
      setError('Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!prize || claimed) return;

    try {
      setLoading(true);
      setError(null);
      
      const success = await prizeService.markPrizeAsClaimed(prize.code);
      
      if (success) {
        setClaimed(true);
        setMessage('¡Premio reclamado con éxito!');
      } else {
        setError('Error al reclamar el premio');
      }
    } catch (err) {
      setError('Error al reclamar el premio');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const renderPrizeInfo = () => {
    if (!prize) return null;

    const timeToExpiry = prizeService.getTimeToExpiry(prize);
    const expiryDate = new Date(prize.expiresAt).toLocaleString();

    return (
      <div 
        className="prize-info"
        role="region"
        aria-label="Información del Premio"
      >
        <h3>Información del Premio</h3>
        <dl>
          <dt>Nombre:</dt>
          <dd>{prize.name}</dd>
          
          <dt>Estado:</dt>
          <dd>{claimed ? 'Reclamado' : 'No reclamado'}</dd>
          
          <dt>Expira en:</dt>
          <dd>{timeToExpiry > 0 ? `${Math.ceil(timeToExpiry / 1000 / 60)} minutos` : 'Expirado'}</dd>
          
          <dt>Fecha de expiración:</dt>
          <dd>{expiryDate}</dd>
        </dl>
        
        {!claimed && (
          <button 
            onClick={handleClaim}
            className="claim-button"
            disabled={loading}
            aria-busy={loading}
            aria-label="Reclamar premio"
          >
            {loading ? 'Reclamando...' : 'Reclamar premio'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className="prize-verifier verifier-section"
      role="form"
      aria-label="Verificador de Premios"
    >
      <h2 id="verifier-title">Verificar Premio</h2>
      
      <div 
        className="verifier-container"
        role="search"
        aria-labelledby="verifier-title"
      >
        <label htmlFor="code-input" className="sr-only">
          Código del premio
        </label>
        <input
          id="code-input"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ingresa el código del premio"
          className="code-input"
          aria-label="Código del premio"
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : undefined}
          disabled={loading}
        />
        <button 
          onClick={handleVerify}
          className="verify-button"
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? 'Verificando...' : 'Verificar premio'}
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      {error && (
        <p 
          id="error-message"
          className="error-message"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      {message && !error && (
        <p 
          className="success-message"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      {renderPrizeInfo()}
    </div>
  );
}

export default PrizeVerifier;