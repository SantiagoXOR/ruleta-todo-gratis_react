import React, { useState } from 'react';
import { prizeValidationService, ValidationResponse } from '../services/prizeValidationService';
import { Icons } from './Icons';
import '../styles/PrizeValidator.css';

interface PrizeValidatorProps {
  storeId: string;
  onValidationComplete?: (response: ValidationResponse) => void;
}

const PrizeValidator: React.FC<PrizeValidatorProps> = ({ storeId, onValidationComplete }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Por favor, ingresa un código');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await prizeValidationService.validatePrize({
        code: code.trim(),
        storeId
      });

      if (response.success) {
        setSuccess(response.message);
        if (onValidationComplete) {
          onValidationComplete(response);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error al validar el premio. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prize-validator">
      <h2 className="validator-title">
        <Icons.Tag /> Validar Premio
      </h2>
      
      <form onSubmit={handleSubmit} className="validator-form">
        <div className="input-group">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ingresa el código del premio"
            className="code-input"
            maxLength={10}
            disabled={loading}
          />
          <button type="submit" className="validate-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner">
                <Icons.Spinner />
              </span>
            ) : (
              <>
                <Icons.Check /> Validar
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="validation-message error">
            <Icons.Error /> {error}
          </div>
        )}

        {success && (
          <div className="validation-message success">
            <Icons.Success /> {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default PrizeValidator; 