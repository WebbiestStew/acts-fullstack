import { useState, useEffect } from 'react';
import authService from '../services/authService.js';
import taskService from '../services/taskService.js';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleLoading, setRoleLoading] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        authService.getUsers(),
        taskService.getStats(),
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(userId);
    try {
      await authService.changeRole(userId, newRole);
      setSuccess(`Rol actualizado a '${newRole}'.`);
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar rol');
    } finally {
      setRoleLoading(null);
    }
  };

  const getStatusCount = (status) => stats?.byStatus?.find((s) => s._id === status)?.count || 0;

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛠 Panel Administrativo</h1>
          <p className="page-subtitle">Control global del sistema</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* System stats */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Estadísticas del Sistema</h2>
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Tareas', value: stats?.total || 0, color: '#6366f1' },
          { label: 'Pendientes', value: getStatusCount('pending'), color: '#f59e0b' },
          { label: 'En Progreso', value: getStatusCount('in-progress'), color: '#0ea5e9' },
          { label: 'Completadas', value: getStatusCount('completed'), color: '#22c55e' },
          { label: 'Canceladas', value: getStatusCount('cancelled'), color: '#94a3b8' },
          { label: 'Usuarios Totales', value: users.length, color: '#ec4899' },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>👥 Gestión de Usuarios ({users.length})</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>
                  <span className={`badge ${u.active ? 'badge-completed' : 'badge-cancelled'}`}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('es-MX')}
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                    disabled={roleLoading === u._id}
                    onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}
                  >
                    {roleLoading === u._id ? '...' : u.role === 'admin' ? '→ User' : '→ Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
