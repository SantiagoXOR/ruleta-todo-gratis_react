import React, { useState } from 'react';
import '../styles/Wheel.css';
import confetti from 'canvas-confetti';
import { Icons } from './Icons';
import { Prize, ConfettiOptions, WheelProps } from '../types/wheel.types';

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

const generateCode = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 2; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const Wheel: React.FC<WheelProps> = ({
  initialRotation = 0,
  spinDuration = 5000,
  minSpins = 5,
  maxSpins = 8
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(initialRotation);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showPrize, setShowPrize] = useState<boolean>(false);
  const [prizeCode, setPrizeCode] = useState<string>('');

  const spinWheel = (): void => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowPrize(false);

    const randomSpins = Math.floor(Math.random() * (maxSpins - minSpins + 1) + minSpins);
    const sectionSize = 360 / prizes.length;
    const randomSection = Math.floor(Math.random() * prizes.length);
    const randomOffset = Math.random() * (sectionSize * 0.8) - sectionSize * 0.4;
    const finalRotation = rotation + (360 * randomSpins) + (randomSection * sectionSize) + randomOffset;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(prizes[prizes.length - 1 - randomSection]);
      setPrizeCode(generateCode());
      setShowPrize(true);
      launchConfetti();
    }, spinDuration);
  };

  const launchConfetti = (): void => {
    const count = 200;
    const defaults: ConfettiOptions = {
      origin: { y: 0.7 },
      zIndex: 1500,
      colors: ['#F4DE00', '#841468', '#FF6B6B', '#4ECDC4']
    };

    const fire = (particleRatio: number, opts: ConfettiOptions): void => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const shareOnWhatsApp = (): void => {
    if (!selectedPrize) return;
    const text = `¡Gané ${selectedPrize.name} en PINTEMAS! 🎉\nMi código es: ${prizeCode}\nVálido por 24 horas`;
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

      {showPrize && selectedPrize && (
        <div className="prize-modal">
          <div className="prize-modal-content">
            <h2>¡FELICITACIONES!</h2>
            <p>¡Ganaste {selectedPrize.name}!</p>
            <div className="prize-code">{prizeCode}</div>
            <div className="prize-validity">
              <Icons.Clock /> Válido por 24 horas
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