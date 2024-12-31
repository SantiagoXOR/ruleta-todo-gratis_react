import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando proceso de login...');
      const { user } = await authService.login(email, password);
      console.log('Respuesta del login:', user);
      
      if (user) {
        console.log('Usuario autenticado, guardando en localStorage...');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', user.email || '');
        console.log('Estado de localStorage:', {
          isAuthenticated: localStorage.getItem('isAuthenticated'),
          userEmail: localStorage.getItem('userEmail')
        });
        console.log('Redirigiendo al dashboard...');
        navigate('/dashboard');
      } else {
        console.log('No se recibió usuario en la respuesta');
        setError('Error al iniciar sesión: No se recibió usuario');
      }
    } catch (err: any) {
      console.error('Error durante el login:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img 
          src="/pintemas-logo.png" 
          alt="Pintemas Logo" 
          className="login-logo"
        />
        <h2>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" role="alert">
              {error}
              <p className="help-text">
                Credenciales temporales:<br/>
                Email: santiagomartinez@upc.edu.ar<br/>
                Contraseña: Pintemas2024!
              </p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="santiagomartinez@upc.edu.ar"
              required
              autoComplete="email"
              disabled={loading}
              aria-invalid={!!error}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={!!error}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 