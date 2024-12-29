import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import '../styles/Unauthorized.css';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <Icons.Lock />
        </div>
        <h1>Acceso No Autorizado</h1>
        <p>Lo sentimos, no tienes los permisos necesarios para acceder a esta página.</p>
        <div className="unauthorized-actions">
          <button
            className="primary-button"
            onClick={() => navigate('/')}
          >
            <Icons.Home />
            Ir al inicio
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate(-1)}
          >
            <Icons.ArrowLeft />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 