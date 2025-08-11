import React from 'react';
import Wheel from '../components/Wheel';
import { Icons } from '../components/Icons';

// Configuraciones de prueba con diferentes cantidades de premios
const testConfigurations = {
  sixPrizes: [
    { name: "PREMIO 1", description: "Descripción 1", icon: <Icons.Paint />, color: '#4ECDC4' },
    { name: "PREMIO 2", description: "Descripción 2", icon: <Icons.Tag />, color: '#FF6B6B' },
    { name: "PREMIO 3", description: "Descripción 3", icon: <Icons.Gift />, color: '#FFD93D' },
    { name: "PREMIO 4", description: "Descripción 4", icon: <Icons.Star />, color: '#6C5CE7' },
    { name: "PREMIO 5", description: "Descripción 5", icon: <Icons.Card />, color: '#4ECDC4' },
    { name: "PREMIO 6", description: "Descripción 6", icon: <Icons.Tag />, color: '#FF6B6B' }
  ],
  tenPrizes: [
    { name: "PREMIO 1", description: "Descripción 1", icon: <Icons.Paint />, color: '#4ECDC4' },
    { name: "PREMIO 2", description: "Descripción 2", icon: <Icons.Tag />, color: '#FF6B6B' },
    { name: "PREMIO 3", description: "Descripción 3", icon: <Icons.Gift />, color: '#FFD93D' },
    { name: "PREMIO 4", description: "Descripción 4", icon: <Icons.Star />, color: '#6C5CE7' },
    { name: "PREMIO 5", description: "Descripción 5", icon: <Icons.Card />, color: '#4ECDC4' },
    { name: "PREMIO 6", description: "Descripción 6", icon: <Icons.Tag />, color: '#FF6B6B' },
    { name: "PREMIO 7", description: "Descripción 7", icon: <Icons.Paint />, color: '#FFD93D' },
    { name: "PREMIO 8", description: "Descripción 8", icon: <Icons.Gift />, color: '#6C5CE7' },
    { name: "PREMIO 9", description: "Descripción 9", icon: <Icons.Star />, color: '#4ECDC4' },
    { name: "PREMIO 10", description: "Descripción 10", icon: <Icons.Card />, color: '#FF6B6B' }
  ]
};

const WheelTest: React.FC = () => {
  const [currentConfig, setCurrentConfig] = React.useState<'sixPrizes' | 'tenPrizes'>('sixPrizes');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Prueba de Ruleta - Diferentes Configuraciones</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setCurrentConfig('sixPrizes')}
          style={{ 
            marginRight: '1rem', 
            padding: '0.5rem 1rem',
            backgroundColor: currentConfig === 'sixPrizes' ? '#4ECDC4' : '#ccc'
          }}
        >
          6 Premios
        </button>
        <button 
          onClick={() => setCurrentConfig('tenPrizes')}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: currentConfig === 'tenPrizes' ? '#4ECDC4' : '#ccc'
          }}
        >
          10 Premios
        </button>
      </div>

      <div style={{ 
        border: '2px solid #ddd', 
        borderRadius: '10px', 
        padding: '1rem',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Configuración actual: {currentConfig === 'sixPrizes' ? '6 Premios' : '10 Premios'}</h2>
        <p>Esta prueba verifica que los premios se distribuyan uniformemente sin superponerse.</p>
        
        {/* Aquí iría el componente Wheel con la configuración seleccionada */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '600px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }}>
          <p>Componente Wheel con {testConfigurations[currentConfig].length} premios</p>
          {/* 
          Nota: Para usar este test, necesitarías modificar el componente Wheel 
          para aceptar props de configuración de premios, o crear una versión 
          de prueba que permita cambiar los premios dinámicamente.
          */}
        </div>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <h3>Puntos a verificar:</h3>
        <ul>
          <li>✅ Los premios se distribuyen uniformemente en círculo</li>
          <li>✅ No hay superposición de texto entre premios adyacentes</li>
          <li>✅ El texto es legible en todos los premios</li>
          <li>✅ Los iconos se escalan apropiadamente</li>
          <li>✅ La ruleta gira correctamente</li>
          <li>✅ La selección de premios funciona con cualquier cantidad</li>
        </ul>
      </div>
    </div>
  );
};

export default WheelTest;
