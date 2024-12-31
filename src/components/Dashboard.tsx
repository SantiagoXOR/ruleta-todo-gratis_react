import React, { useState } from 'react';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<string | null>(null);

  // Lista temporal de premios
  const prizes = [
    "Premio 1",
    "Premio 2",
    "Premio 3",
    "Premio 4",
    "Premio 5",
    "Premio 6"
  ];

  const spinWheel = () => {
    setIsSpinning(true);
    // Simular el giro de la ruleta
    setTimeout(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setCurrentPrize(randomPrize);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Ruleta de Premios</h1>
        <button onClick={() => window.location.href = '/logout'} className="logout-button">
          Cerrar Sesión
        </button>
      </header>

      <main className="dashboard-content">
        <div className="wheel-container">
          <div className={`prize-wheel ${isSpinning ? 'spinning' : ''}`}>
            {prizes.map((prize, index) => (
              <div 
                key={index} 
                className="prize-segment"
                style={{ 
                  transform: `rotate(${index * (360 / prizes.length)}deg)`
                }}
              >
                {prize}
              </div>
            ))}
          </div>
          <button 
            className="spin-button"
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? 'Girando...' : 'Girar Ruleta'}
          </button>
        </div>

        {currentPrize && (
          <div className="prize-result">
            <h2>¡Felicitaciones!</h2>
            <p>Has ganado: {currentPrize}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 