import React, { useState, useEffect } from 'react';
import { adminService, AdminStats, Store, AdminUser, AuditLog } from '../services/adminService';
import { Icons } from './Icons';
import PrizeVerifier from './PrizeVerifier';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'users' | 'audit' | 'verifier'>('overview');
  const [filters, setFilters] = useState({
    storeSearch: '',
    userSearch: '',
    userRole: '',
    showInactive: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando datos iniciales...');
      const [statsData, storesData, usersData, logsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getStores(),
        adminService.getUsers(),
        adminService.getAuditLogs()
      ]);

      console.log('Datos cargados:', {
        stats: statsData,
        stores: storesData,
        users: usersData,
        logs: logsData
      });

      setStats(statsData);
      setStores(storesData);
      setUsers(usersData);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSearch = async (search: string) => {
    setFilters(prev => ({ ...prev, storeSearch: search }));
    try {
      const storesData = await adminService.getStores({ search });
      setStores(storesData);
    } catch (error) {
      setError('Error al buscar tiendas');
    }
  };

  const handleUserSearch = async (search: string) => {
    setFilters(prev => ({ ...prev, userSearch: search }));
    try {
      const usersData = await adminService.getUsers({ search });
      setUsers(usersData);
    } catch (error) {
      setError('Error al buscar usuarios');
    }
  };

  const handleUserRoleFilter = async (role: string) => {
    setFilters(prev => ({ ...prev, userRole: role }));
    try {
      const usersData = await adminService.getUsers({ role });
      setUsers(usersData);
    } catch (error) {
      setError('Error al filtrar usuarios');
    }
  };

  const handleGenerateReport = async (type: 'users' | 'prizes' | 'stores', format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await adminService.generateReport(type, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Error al generar el reporte');
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <Icons.Users />
          </div>
          <div className="stat-content">
            <h3>Usuarios</h3>
            <div className="stat-value">{stats?.totalUsers}</div>
            <div className="stat-subtitle">
              {stats?.activeUsers} activos
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon prizes">
            <Icons.Gift />
          </div>
          <div className="stat-content">
            <h3>Premios</h3>
            <div className="stat-value">{stats?.totalPrizes}</div>
            <div className="stat-subtitle">
              {stats?.claimedPrizes} canjeados
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stores">
            <Icons.Store />
          </div>
          <div className="stat-content">
            <h3>Tiendas</h3>
            <div className="stat-value">{stats?.totalStores}</div>
            <div className="stat-subtitle">
              {stats?.activeStores} activas
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <Icons.Chart />
          </div>
          <div className="stat-content">
            <h3>Conversión</h3>
            <div className="stat-value">{stats?.conversionRate}%</div>
            <div className="stat-subtitle">
              ${stats?.revenue} en premios
            </div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="activity-item">
              <div className="activity-icon">
                <Icons.Activity />
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-user">{log.userEmail}</span>
                  <span className="activity-time">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p>{log.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStores = () => (
    <div className="admin-stores">
      <div className="section-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Buscar tiendas..."
            value={filters.storeSearch}
            onChange={(e) => handleStoreSearch(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={filters.showInactive}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                showInactive: e.target.checked
              }))}
            />
            Mostrar inactivas
          </label>
        </div>
        <button
          className="action-button"
          onClick={() => handleGenerateReport('stores', 'excel')}
        >
          <Icons.Download /> Exportar
        </button>
      </div>

      <div className="stores-grid">
        {stores.map(store => (
          <div key={store.id} className={`store-card ${!store.active ? 'inactive' : ''}`}>
            <div className="store-header">
              <h4>{store.name}</h4>
              <span className={`status-badge ${store.active ? 'active' : 'inactive'}`}>
                {store.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div className="store-details">
              <p><Icons.Location /> {store.location}</p>
              <p><Icons.User /> {store.manager}</p>
            </div>
            <div className="store-config">
              <small>Configuración de premios:</small>
              <ul>
                <li>Máx. por día: {store.prizeConfig.maxPrizesPerDay}</li>
                <li>Máx. por usuario: {store.prizeConfig.maxPrizesPerUser}</li>
                <li>Días de expiración: {store.prizeConfig.expirationDays}</li>
              </ul>
            </div>
            <div className="store-actions">
              <button className="edit-button">
                <Icons.Edit /> Editar
              </button>
              <button className="config-button">
                <Icons.Settings /> Configurar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-users">
      <div className="section-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={filters.userSearch}
            onChange={(e) => handleUserSearch(e.target.value)}
          />
          <select
            value={filters.userRole}
            onChange={(e) => handleUserRoleFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="manager">Gerentes</option>
            <option value="user">Usuarios</option>
          </select>
        </div>
        <button
          className="action-button"
          onClick={() => handleGenerateReport('users', 'excel')}
        >
          <Icons.Download /> Exportar
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : 'Nunca'}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="icon-button" title="Editar">
                      <Icons.Edit />
                    </button>
                    <button className="icon-button" title="Permisos">
                      <Icons.Lock />
                    </button>
                    <button
                      className="icon-button danger"
                      title={user.active ? 'Desactivar' : 'Activar'}
                    >
                      {user.active ? <Icons.Ban /> : <Icons.Check />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="admin-audit">
      <div className="section-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Buscar en logs..."
            value={filters.userSearch}
            onChange={(e) => handleUserSearch(e.target.value)}
          />
          <input
            type="date"
            onChange={(e) => {
              // Implementar filtro por fecha
            }}
          />
        </div>
      </div>

      <div className="audit-logs">
        {auditLogs.map(log => (
          <div key={log.id} className="audit-item">
            <div className="audit-icon">
              <Icons.Activity />
            </div>
            <div className="audit-content">
              <div className="audit-header">
                <span className="audit-user">{log.userEmail}</span>
                <span className="audit-time">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="audit-action">{log.action}</p>
              <div className="audit-details">
                <small>IP: {log.ip}</small>
                <small>User Agent: {log.userAgent}</small>
              </div>
              {log.details && (
                <pre className="audit-json">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <Icons.Spinner className="spinner" />
          <p>Cargando datos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <Icons.Error className="error-icon" />
          <p>{error}</p>
          <button onClick={loadInitialData}>Reintentar</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'stores':
        return renderStores();
      case 'users':
        return renderUsers();
      case 'audit':
        return renderAuditLogs();
      case 'verifier':
        return <PrizeVerifier />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="dashboard-nav">
        <button
          className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vista General
        </button>
        <button
          className={`nav-button ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Tiendas
        </button>
        <button
          className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button
          className={`nav-button ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Auditoría
        </button>
        <button
          className={`nav-button ${activeTab === 'verifier' ? 'active' : ''}`}
          onClick={() => setActiveTab('verifier')}
        >
          Verificador
        </button>
      </nav>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard; 