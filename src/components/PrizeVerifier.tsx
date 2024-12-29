import React, { useState } from 'react';
import { prizeService } from '../services/prizes';
import '../styles/PrizeVerifier.css';

const PrizeVerifier: React.FC = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [prize, setPrize] = useState<any>(null);
  const [claimed, setClaimed] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      setMessage('Por favor ingresa un código');
      return;
    }

    setMessage('Verificando código...');
    const prizeData = await prizeService.getPrizeByCode(code);
    
    if (!prizeData) {
      setMessage('Código inválido');
      return;
    }

    if (!prizeService.isPrizeValid(prizeData)) {
      setMessage('Este premio ha expirado');
      return;
    }

    setPrize(prizeData);
    setMessage('');
  };

  const handleClaim = async () => {
    if (prize && !claimed) {
      const success = await prizeService.markPrizeAsClaimed(prize.code);
      if (success) {
        setClaimed(true);
        setMessage('¡Premio reclamado con éxito!');
      }
    }
  };

  const renderPrizeInfo = () => {
    if (!prize) return null;

    return (
      <div className="prize-info">
        <h3>Información del Premio</h3>
        <p>Nombre: {prize.name}</p>
        <p>Estado: {claimed ? 'Reclamado' : 'No reclamado'}</p>
        {!claimed && (
          <button onClick={handleClaim} className="claim-button">
            Reclamar premio
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="prize-verifier">
      <h2>Verificar Premio</h2>
      <div className="verifier-container">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ingresa el código del premio"
          className="code-input"
        />
        <button onClick={handleVerify} className="verify-button">
          Verificar
        </button>
      </div>
      {message && <p className="message">{message}</p>}
      {renderPrizeInfo()}
    </div>
  );
};

export default PrizeVerifier;