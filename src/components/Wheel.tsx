import React, { useState, useEffect, useRef } from 'react';
import '../styles/Wheel.css';
import confetti from 'canvas-confetti';
import { Icons } from './Icons';

interface Prize {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const prizes: Prize[] = [
  {
    name: "KIT DE PINTURA",
    description: "Con compras mayores a $50.000",
    icon: <Icons.Paint />,
    color: '#4ECDC4'
  },
  {
    name: "10% GRATIS",
    description: "En toda la tienda",
    icon: <Icons.Tag />,
    color: '#FF6B6B'
  },
  {
    name: "REGALO SORPRESA",
    description: "En tu próxima compra",
    icon: <Icons.Gift />,
    color: '#4ECDC4'
  },
  {
    name: "20% DESCUENTO",
    description: "En pinturas premium",
    icon: <Icons.Star />,
    color: '#FF6B6B'
  },
  {
    name: "BONO EXTRA",
    description: "Cupón de $10.000",
    icon: <Icons.Card />,
    color: '#FFD93D'
  },
  {
    name: "5% DESCUENTO",
    description: "En toda la tienda",
    icon: <Icons.Tag />,
    color: '#6C5CE7'
  },
  {
    name: "10% GRATIS",
    description: "En toda la tienda",
    icon: <Icons.Tag />,
    color: '#4ECDC4'
  },
  {
    name: "20% DESCUENTO",
    description: "En productos seleccionados",
    icon: <Icons.Star />,
    color: '#FF6B6B'
  }
];

function generateCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 2; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const Wheel: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showPrize, setShowPrize] = useState<boolean>(false);
  const [prizeCode, setPrizeCode] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLButtonElement | null>(null);
  const [labelRadiusPx, setLabelRadiusPx] = useState<number | null>(null);

  // Calcular radio real según tamaño del wheel y botón central
  useEffect(() => {
    function compute() {
      const wheel = wheelRef.current;
      const center = centerRef.current;
      if (!wheel || !center) return;
      const wheelRect = wheel.getBoundingClientRect();
      const centerRect = center.getBoundingClientRect();
      const wheelRadius = wheelRect.width / 2;
      const centerRadius = Math.max(centerRect.width, centerRect.height) / 2;
      const ring = Math.min(Math.max(10, wheelRect.width * 0.03), 18); // similar a --ring
      const gap = Math.max(12, wheelRect.width * 0.02); // separación visual del texto
      const radius = wheelRadius - ring - centerRadius - gap;
      setLabelRadiusPx(Math.max(0, radius));
    }

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);


  const spinWheel = (): void => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowPrize(false);

    const minSpins = 5;
    const maxSpins = 8;
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
    }, 5000);
  };

  const launchConfetti = (): void => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1500,
      colors: ['#F4DE00', '#841468', '#FF6B6B', '#4ECDC4']
    };

    function fire(particleRatio: number, opts: any): void {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

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

  // Ángulo fijo por segmento (dinámico según cantidad de premios)
  const sliceAngle = 360 / prizes.length;

  // Generar gradiente cónico dinámico basado en los colores de los premios
  const generateConicGradient = (): string => {
    const gradientStops = prizes.map((prize, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      return `${prize.color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');

    return `conic-gradient(${gradientStops})`;
  };

  return (
    <div className="wheel-container">
      <div className="wheel-section">
        <img src="/assets/images/logo.png" alt="PINTEMAS" className="logo" />
        <h1 className="title">TODO GRATIS</h1>
        <p className="subtitle">¡Participá y ganá premios increíbles!</p>

        <div className="wheel-wrapper">
          <div
            ref={wheelRef}
            className={`wheel ${isSpinning ? 'is-spinning' : ''}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              '--slices': prizes.length,
              background: generateConicGradient()
            } as React.CSSProperties}
          >
            <button
              ref={centerRef}
              className="wheel__center"
              onClick={spinWheel}
              disabled={isSpinning}
              aria-pressed={isSpinning}
              aria-busy={isSpinning}
              aria-live="polite"
              aria-label={isSpinning ? 'Girando ruleta, por favor espera' : 'Girar la ruleta'}
            >
              ¡GIRÁ Y<br/>GANÁ!
            </button>
            <div className="wheel__labels" ref={wrapperRef}>
              {prizes.map((prize, index) => {
                const angle = (index * sliceAngle);
                const translate = labelRadiusPx != null ? `${labelRadiusPx}px` : '35%';
                return (
                  <span
                    key={index}
                    className="label"
                    style={{
                      transform: `rotate(${angle}deg) translate(${translate}) rotate(-${angle}deg)`
                    } as React.CSSProperties}
                  >
                    {prize.icon}
                    {prize.name}
                  </span>
                );
              })}
            </div>
            <div className="wheel__pointer" aria-hidden="true"></div>
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
export { Wheel };
