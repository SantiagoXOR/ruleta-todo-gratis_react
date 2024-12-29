import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityService } from '../services/securityService';
import { Icons } from './Icons';
import '../styles/Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await securityService.login({ email, password });
      navigate('/admin');
    } catch (error) {
      setError('Credenciales inválidas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await securityService.requestPasswordReset(resetEmail);
      setResetSent(true);
    } catch (error) {
      setError('Error al enviar el correo de restablecimiento. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Restablecer Contraseña</h2>
            <button
              className="back-button"
              onClick={() => setShowForgotPassword(false)}
            >
              <Icons.ArrowLeft /> Volver
            </button>
          </div>

          {resetSent ? (
            <div className="success-message">
              <Icons.Check />
              <p>Se ha enviado un correo con las instrucciones para restablecer su contraseña.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label htmlFor="resetEmail">Correo electrónico</label>
                <div className="input-group">
                  <Icons.Mail />
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Ingrese su correo electrónico"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <Icons.Error />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icons.Spinner className="spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-group">
              <Icons.Mail />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo electrónico"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-group">
              <Icons.Lock />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <Icons.Error />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icons.Spinner className="spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>

          <button
            type="button"
            className="text-button"
            onClick={() => setShowForgotPassword(true)}
          >
            ¿Olvidó su contraseña?
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 