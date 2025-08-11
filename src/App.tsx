import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Wheel from './components/Wheel';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import PintemasLandingSimple from './pages/PintemasLandingSimple';
import './styles/variables.css';
import './styles/global.css';

// Componente de protección de rutas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('PrivateRoute - localStorage:', localStorage.getItem('isAuthenticated'));
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Ruta principal - Landing Pintemas */}
          <Route path="/" element={<PintemasLandingSimple />} />

          {/* Ruta de la ruleta */}
          <Route path="/ruleta" element={
            <main className="content-wrapper">
              <section aria-label="Ruleta">
                <Wheel />
              </section>
            </main>
          } />

          {/* Ruta de inicio de sesión */}
          <Route path="/login" element={<Login />} />

          {/* Ruta del dashboard protegida */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Ruta por defecto - Redirige a la página principal */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;