import React from 'react';
import '../styles/Stats.css';

const Statistics: React.FC = () => {
  return (
    <div className="statistics">
      <h2>Estadísticas</h2>
      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-label">Total de giros:</span>
          <span className="stat-value">0</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Premios ganados:</span>
          <span className="stat-value">0</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Premios reclamados:</span>
          <span className="stat-value">0</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 