import React, { useState, useCallback } from 'react';
import '../styles/Wheel.css';
import confetti from 'canvas-confetti';
import { Icons } from './Icons';
import { Prize, PrizeWithCode, WheelProps } from '../types/wheel.types';
import { uniqueCodeService } from '../services/uniqueCodeService';
import { prizeService } from '../services/prizeService';

const prizes: Prize[] = [
  {
    name: "TODO GRATIS",
    description: "Bonificamos el 100% de tu compra hasta $30.000",
    icon: <Icons.Gift />,
    color: '#FF6B6B'
  },
  {
    name: "5% DESCUENTO",
    description: "En toda la tienda",
    icon: <Icons.Tag />,
    color: '#FF8B94'
  },
  {
    name: "BONO EXTRA",
    description: "Cupón de $10.000",
    icon: <Icons.Card />,
    color: '#FFD93D'
  },
  {
    name: "15% DESCUENTO",
    description: "En productos seleccionados",
    icon: <Icons.Tag />,
    color: '#6C5CE7'
  },
  {
    name: "KIT DE PINTURA",
    description: "Con compras mayores a $50.000",
    icon: <Icons.Paint />,
    color: '#4ECDC4'
  },
  {
    name: "REGALO SORPRESA",
    description: "En tu próxima compra",
    icon: <Icons.Gift />,
    color: '#A8E6CF'
  },
  {
    name: "20% DESCUENTO",
    description: "En pinturas premium",
    icon: <Icons.Star />,
    color: '#FF6B6B'
  },
  {
    name: "10% DESCUENTO",
    description: "En toda la tienda",
    icon: <Icons.Tag />,
    color: '#4ECDC4'
  }
];

const Wheel: React.FC<WheelProps> = ({
  initialRotation = 0,
  spinDuration = 5000,
  minSpins = 5,
  maxSpins = 8,
  onPrizeWon
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(initialRotation);
  const [selectedPrize, setSelectedPrize] = useState<PrizeWithCode | null>(null);
  const [showPrize, setShowPrize] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrizeCode = async (prize: Prize): Promise<PrizeWithCode | null> => {
    try {
      const response = await uniqueCodeService.generateCode(prize.id);
      if (response.success && response.data) {
        return {
          ...prize,
          code: response.data.code,
          timestamp: Date.now(),
          claimed: false,
          expiresAt: new Date(response.data.expiresAt).getTime()
        };
      }
      throw new Error('Error al generar el código del premio');
    } catch (error) {
      console.error('Error generating prize code:', error);
      setError('Error al generar el código del premio. Por favor, intenta nuevamente.');
      return null;
    }
  };

  const handlePrizeWon = async (prize: Prize) => {
    const prizeWithCode = await generatePrizeCode(prize);
    if (prizeWithCode) {
      setSelectedPrize(prizeWithCode);
      setShowPrize(true);
      if (onPrizeWon) {
        onPrizeWon(prizeWithCode);
      }
      // Guardar el premio en el servicio
      await prizeService.savePrize({
        id: prizeWithCode.id,
        name: prizeWithCode.name,
        code: prizeWithCode.code
      });
    }
  };

  const spinWheel = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowPrize(false);
    setError(null);

    // Calcular rotación final
    const numberOfSpins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = numberOfSpins * 360 + extraDegrees;
    
    // Calcular el premio ganado basado en la rotación final
    const normalizedDegree = extraDegrees % 360;
    const prizeIndex = Math.floor(normalizedDegree / (360 / prizes.length));
    const selectedPrize = prizes[prizes.length - 1 - prizeIndex];

    setRotation(rotation + totalRotation);

    // Esperar a que termine la animación
    setTimeout(async () => {
      setIsSpinning(false);
      await handlePrizeWon(selectedPrize);
      
      // Efectos de celebración
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, spinDuration);
  }, [isSpinning, rotation, maxSpins, minSpins, spinDuration, onPrizeWon]);

  const shareOnWhatsApp = (): void => {
    if (!selectedPrize) return;
    const text = `¡Gané ${selectedPrize.name} en PINTEMAS! 🎉\nMi código es: ${selectedPrize.code}\nVálido por 24 horas`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="wheel-container">
      <div className="wheel-section">
        <img src="/assets/images/logo.png" alt="PINTEMAS" className="logo" />
        <h1 className="title">TODO GRATIS</h1>
        <p className="subtitle">¡Participá y ganá premios increíbles!</p>

        <div className="wheel-wrapper">
          <div className="wheel-marker"></div>
          <div 
            className={`wheel ${isSpinning ? 'spinning' : ''}`} 
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none'
            }}
          >
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="section"
                style={{
                  transform: `rotate(${(360 / prizes.length) * index}deg)`,
                  backgroundColor: prize.color
                }}
              >
                <div className="prize-content">
                  <div className="prize-icon">{prize.icon}</div>
                  <div className="prize-text">{prize.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="wheel-center-container">
            <button 
              className="wheel-center" 
              onClick={spinWheel} 
              disabled={isSpinning}
            >
              ¡GIRÁ Y<br/>GANÁ!
            </button>
          </div>
        </div>
      </div>

      <div className="prizes-section">
        <h2 className="prizes-title">
          <Icons.Gift /> Premios Disponibles
        </h2>
        <div className="prize-list">
          {prizes.map((prize, index) => (
            <div key={index} className="prize-item">
              <div className="prize-icon">
                {prize.icon}
              </div>
              <div className="prize-content">
                <div className="prize-name">{prize.name}</div>
                <div className="prize-description">{prize.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="terms-section">
          <h3 className="terms-title">
            <Icons.Document /> Bases y Condiciones
          </h3>
          <div className="terms-list">
            <div className="terms-item">
              <div className="terms-bullet"></div>
              <p className="terms-text"><strong>Promoción válida hasta agotar stock de premios</strong></p>
            </div>
            <div className="terms-item">
              <div className="terms-bullet"></div>
              <p className="terms-text">Un giro por persona por día</p>
            </div>
            <div className="terms-item">
              <div className="terms-bullet"></div>
              <p className="terms-text">Los descuentos no son acumulables con otras promociones</p>
            </div>
            <div className="terms-item">
              <div className="terms-bullet"></div>
              <p className="terms-text">Los códigos tienen una validez de 24 horas</p>
            </div>
            <div className="terms-item">
              <div className="terms-bullet"></div>
              <p className="terms-text">Promoción exclusiva para clientes PINTEMAS</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showPrize && selectedPrize && (
        <div className="prize-modal">
          <div className="prize-modal-content">
            <h2>¡FELICITACIONES!</h2>
            <p>¡Ganaste {selectedPrize.name}!</p>
            <div className="prize-code">{selectedPrize.code}</div>
            <div className="prize-validity">
              <Icons.Clock /> Válido hasta: {new Date(selectedPrize.expiresAt).toLocaleString()}
            </div>
            <button className="share-whatsapp" onClick={shareOnWhatsApp}>
              <Icons.Share /> COMPARTIR EN WHATSAPP
            </button>
            <p className="prize-instructions">
              Presentá este código en PINTEMAS para reclamar tu premio
            </p>
            <button className="close-modal" onClick={() => setShowPrize(false)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wheel;