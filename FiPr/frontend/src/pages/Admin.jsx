import { useState, useEffect, useCallback } from 'react';
import carService from '../services/carService.js';
import authService from '../services/authService.js';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
const formatNum = (n) => new Intl.NumberFormat('en-US').format(n);

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [roleMsg, setRoleMsg] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadStats = useCallback(async () => {
    try {
      const res = await carService.getStats();
      setStats(res.data.data);
    } catch (err) {
      setError('Failed to load stats: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await authService.getUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, [loadStats, loadUsers]);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change this user rank to "${newRole}"?`)) return;
    setUpdatingRole(userId);
    try {
      await authService.changeRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      setRoleMsg(`Role updated to "${newRole}".`);
      setTimeout(() => setRoleMsg(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Inventory analytics and user management</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {roleMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{roleMsg}</div>}

      <div className="tab-bar">
        {['overview', 'users'].map((t) => (
          <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'overview' ? 'Overview & Stats' : 'User Management'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        loadingStats ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : stats ? (
          <>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              <div className="stat-card color-blue">
                <div className="stat-value">{formatNum(stats.totals?.total ?? 0)}</div>
                <div className="stat-label">Total Vehicles</div>
              </div>
              <div className="stat-card color-orange">
                <div className="stat-value">{formatPrice(stats.totals?.totalValue ?? 0)}</div>
                <div className="stat-label">Inventory Value</div>
              </div>
              <div className="stat-card color-green">
                <div className="stat-value">{formatPrice(stats.totals?.avgPrice ?? 0)}</div>
                <div className="stat-label">Average Price</div>
              </div>
              <div className="stat-card color-info">
                <div className="stat-value">{formatNum(Math.round(stats.totals?.avgMileage ?? 0))} mi</div>
                <div className="stat-label">Average Mileage</div>
              </div>
            </div>

            <div className="admin-grid">
              <div className="card">
                <div className="detail-section-title">By Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                  {(stats.byStatus || []).map((s) => (
                    <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${s._id}`}>{s._id}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700 }}>{s.count} vehicles</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>avg {formatPrice(s.avgPrice)}</div>
                      </div>
                    </div>
                  ))}
                  {(!stats.byStatus || stats.byStatus.length === 0) && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet.</p>}
                </div>
              </div>

              <div className="card">
                <div className="detail-section-title">By Condition</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                  {(stats.byCondition || []).map((c) => (
                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${c._id}`}>{c._id}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700 }}>{c.count} vehicles</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>avg {formatPrice(c.avgPrice)}</div>
                      </div>
                    </div>
                  ))}
                  {(!stats.byCondition || stats.byCondition.length === 0) && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet.</p>}
                </div>
              </div>

              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="detail-section-title">Top Makes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginTop: 14 }}>
                  {(stats.byMake || []).map((m, i) => (
                    <div key={m._id} style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{m._id}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>avg {formatPrice(m.avgPrice)}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: i < 3 ? 'var(--accent)' : 'var(--text-subtle)' }}>{m.count}</div>
                    </div>
                  ))}
                  {(!stats.byMake || stats.byMake.length === 0) && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet.</p>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state"><div className="empty-icon">📊</div><p>No stats available yet.</p></div>
        )
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="detail-section-title" style={{ marginBottom: 20 }}>All Users ({users.length})</div>
          {loadingUsers ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👤</div><p>No users found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role === 'admin' ? 'available' : 'maintenance'}`}>{u.role}</span></td>
                      <td><span className={`badge ${u.active ? 'badge-available' : 'badge-sold'}`}>{u.active ? 'Active' : 'Disabled'}</span></td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggleRole(u._id, u.role)}
                          disabled={updatingRole === u._id}
                        >
                          {updatingRole === u._id ? '...' : u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
