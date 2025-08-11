import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import '../styles/Wheel.css';

interface Prize {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Diferentes configuraciones para demostrar la flexibilidad
const prizeConfigurations = {
  minimal: [
    { name: "PREMIO A", description: "Descripción A", icon: <Icons.Gift />, color: '#4ECDC4' },
    { name: "PREMIO B", description: "Descripción B", icon: <Icons.Star />, color: '#FF6B6B' },
    { name: "PREMIO C", description: "Descripción C", icon: <Icons.Tag />, color: '#FFD93D' },
    { name: "PREMIO D", description: "Descripción D", icon: <Icons.Card />, color: '#6C5CE7' }
  ],
  standard: [
    { name: "KIT PINTURA", description: "Con compras +$50k", icon: <Icons.Paint />, color: '#4ECDC4' },
    { name: "10% GRATIS", description: "En toda la tienda", icon: <Icons.Tag />, color: '#FF6B6B' },
    { name: "REGALO SORPRESA", description: "En tu próxima compra", icon: <Icons.Gift />, color: '#4ECDC4' },
    { name: "20% DESCUENTO", description: "En pinturas premium", icon: <Icons.Star />, color: '#FF6B6B' },
    { name: "BONO EXTRA", description: "Cupón de $10.000", icon: <Icons.Card />, color: '#FFD93D' },
    { name: "5% DESCUENTO", description: "En toda la tienda", icon: <Icons.Tag />, color: '#6C5CE7' }
  ],
  extended: [
    { name: "GRAN PREMIO", description: "Kit completo", icon: <Icons.Gift />, color: '#4ECDC4' },
    { name: "15% OFF", description: "Descuento especial", icon: <Icons.Tag />, color: '#FF6B6B' },
    { name: "BONO $20K", description: "Cupón de regalo", icon: <Icons.Card />, color: '#FFD93D' },
    { name: "KIT BÁSICO", description: "Herramientas", icon: <Icons.Paint />, color: '#6C5CE7' },
    { name: "10% EXTRA", description: "Bonificación", icon: <Icons.Star />, color: '#4ECDC4' },
    { name: "SORPRESA", description: "Premio misterioso", icon: <Icons.Gift />, color: '#FF6B6B' },
    { name: "5% OFF", description: "Descuento básico", icon: <Icons.Tag />, color: '#FFD93D' },
    { name: "BONO $5K", description: "Cupón pequeño", icon: <Icons.Card />, color: '#6C5CE7' },
    { name: "REGALO", description: "Artículo gratis", icon: <Icons.Gift />, color: '#4ECDC4' },
    { name: "DESCUENTO", description: "Oferta especial", icon: <Icons.Star />, color: '#FF6B6B' }
  ]
};

const WheelShowcase: React.FC = () => {
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof prizeConfigurations>('standard');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const currentPrizes = prizeConfigurations[selectedConfig];

  const generateConicGradient = (prizes: Prize[]): string => {
    const sliceAngle = 360 / prizes.length;
    const gradientStops = prizes.map((prize, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      return `${prize.color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');
    
    return `conic-gradient(${gradientStops})`;
  };

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const randomSpins = Math.floor(Math.random() * 3 + 5);
    const randomAngle = Math.random() * 360;
    const finalRotation = rotation + (360 * randomSpins) + randomAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        🎡 Showcase de Ruleta Mejorada
      </h1>
      
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h3>Selecciona una configuración:</h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(prizeConfigurations).map(([key, prizes]) => (
            <button
              key={key}
              onClick={() => setSelectedConfig(key as keyof typeof prizeConfigurations)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedConfig === key ? '#4ECDC4' : '#e0e0e0',
                color: selectedConfig === key ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {prizes.length} Premios ({key})
            </button>
          ))}
        </div>
      </div>

      <div className="wheel-container" style={{ justifyContent: 'center' }}>
        <div className="wheel-section">
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Configuración: {currentPrizes.length} Premios
          </h2>
          
          <div className="wheel-wrapper">
            <div
              className={`wheel ${isSpinning ? 'is-spinning' : ''}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                '--slices': currentPrizes.length,
                background: generateConicGradient(currentPrizes)
              } as React.CSSProperties}
            >
              <button
                className="wheel__center"
                onClick={spinWheel}
                disabled={isSpinning}
                style={{ fontSize: '0.9rem', lineHeight: '1.2' }}
              >
                {isSpinning ? 'GIRANDO...' : '¡GIRÁ Y\nGANÁ!'}
              </button>
              
              <div className="wheel__labels">
                {currentPrizes.map((prize, index) => (
                  <span
                    key={index}
                    className="label"
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    {prize.icon}
                    {prize.name}
                  </span>
                ))}
              </div>
              
              <div className="wheel__pointer" aria-hidden="true"></div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: '#4ECDC4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                opacity: isSpinning ? 0.7 : 1
              }}
            >
              {isSpinning ? 'Girando...' : 'Girar Ruleta'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', backgroundColor: '#f5f5f5', padding: '2rem', borderRadius: '10px' }}>
        <h3>✅ Mejoras Implementadas:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h4>🎯 Distribución Dinámica</h4>
            <p>Los premios se distribuyen automáticamente sin importar la cantidad (4, 6, 10+ premios).</p>
          </div>
          <div>
            <h4>📏 Escalado Inteligente</h4>
            <p>El texto y los iconos se ajustan automáticamente para evitar superposiciones.</p>
          </div>
          <div>
            <h4>🎨 Colores Dinámicos</h4>
            <p>El gradiente de fondo se genera automáticamente basado en los colores de los premios.</p>
          </div>
          <div>
            <h4>📱 Responsive</h4>
            <p>Optimizado para diferentes tamaños de pantalla con escalado adicional en móviles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelShowcase;
