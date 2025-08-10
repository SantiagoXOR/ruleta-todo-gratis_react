import React, { useState, useEffect } from 'react';
import { prizeService } from '../services/prizes';
import { CodesList } from './CodesList';
import '../styles/PrizesList.css';

interface Prize {
  id: number;
  name: string;
  description: string;
  icon: string;
  claimed: boolean;
  timestamp: number;
  code: string;
}

const PrizesList: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingPrize, setClaimingPrize] = useState<number | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    loadPrizes();
    const interval = setInterval(loadPrizes, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadPrizes = async () => {
    try {
      setLoading(true);
      setError(null);
      const availablePrizes = await prizeService.getAvailablePrizes();
      setPrizes(availablePrizes as any);
    } catch (err) {
      setError('Error al cargar los premios. Por favor, intenta nuevamente.');
      console.error('Error loading prizes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrize = async (prizeId: number) => {
    try {
      setClaimingPrize(prizeId);
      const prize = prizes.find(p => p.id === prizeId);
      if (!prize) return;
      
      const success = await (prizeService as any).claimPrize(prize.code);
      if (success) {
        await loadPrizes(); // Refresh the list after claiming
      } else {
        setError('No se pudo reclamar el premio. Por favor, intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error claiming prize:', err);
      setError('Error al reclamar el premio. Por favor, intenta nuevamente.');
    } finally {
      setClaimingPrize(null);
    }
  };

  const getExpirationTime = (timestamp: number) => {
    const expirationTime = timestamp + 24 * 60 * 60 * 1000; // 24 hours
    const timeLeft = expirationTime - Date.now();
    if (timeLeft <= 0) return 'Expirado';
    
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) {
    return (
      <div className="prizes-section loading">
        <div className="spinner"></div>
        <p>Cargando premios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prizes-section error">
        <p className="error-message">{error}</p>
        <button onClick={loadPrizes} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="prizes-container">
      <h2>Premios Disponibles</h2>
      {prizes.length === 0 ? (
        <div className="prizes-section empty">
          <p>No tienes premios disponibles</p>
          <small>¡Gira la ruleta para ganar increíbles premios!</small>
        </div>
      ) : (
        <>
          <div className="prizes-grid">
            {prizes.map((prize) => (
              <div key={prize.id} className="prize-card">
                <h3>{prize.name}</h3>
                <div className="prize-actions">
                  <button
                    onClick={() => handleClaimPrize(prize.id)}
                    disabled={prize.claimed}
                    className="claim-button"
                  >
                    {prize.claimed ? 'Reclamado' : 'Reclamar'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPrize(prize);
                      setShowCodes(true);
                    }}
                    className="view-codes-button"
                  >
                    Ver Códigos
                  </button>
                </div>
                {prize.claimed && (
                  <div className="claimed-info">
                    <span>Reclamado el: {new Date(prize.timestamp).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="expiry-time">{getExpirationTime(prize.timestamp)}</div>
              </div>
            ))}
          </div>

          {/* Modal para mostrar códigos */}
          {showCodes && selectedPrize && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Códigos para: {selectedPrize.name}</h3>
                  <button
                    onClick={() => {
                      setShowCodes(false);
                      setSelectedPrize(null);
                    }}
                    className="close-button"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <CodesList
                    prizeId={selectedPrize.id}
                    showOnlyValid={!selectedPrize.claimed}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrizesList;