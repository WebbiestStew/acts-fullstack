import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import taskService from '../services/taskService.js';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusLabels = {
    pending: 'Pendientes',
    'in-progress': 'En Progreso',
    completed: 'Completadas',
    cancelled: 'Canceladas',
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          taskService.getTasks({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
          isAdmin ? taskService.getStats() : Promise.resolve(null),
        ]);
        setRecentTasks(tasksRes.data.data);
        if (statsRes) setStats(statsRes.data.data);
        else {
          // Build local stats for non-admin
          const allRes = await taskService.getTasks({ limit: 100 });
          const byStatus = {};
          allRes.data.data.forEach((t) => {
            byStatus[t.status] = (byStatus[t.status] || 0) + 1;
          });
          setStats({ total: allRes.data.pagination.total, byStatus: Object.entries(byStatus).map(([_id, count]) => ({ _id, count })) });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const getCount = (status) => stats?.byStatus?.find((s) => s._id === status)?.count || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Hola, {user?.name}</h1>
          <p className="page-subtitle">Aquí tienes un resumen de tus tareas</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">+ Nueva Tarea</Link>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { key: 'pending', num: getCount('pending'), label: 'Pendientes', color: '#f59e0b' },
          { key: 'in-progress', num: getCount('in-progress'), label: 'En Progreso', color: '#0ea5e9' },
          { key: 'completed', num: getCount('completed'), label: 'Completadas', color: '#22c55e' },
          { key: 'total', num: stats?.total || 0, label: 'Total', color: '#6366f1' },
        ].map((s) => (
          <div key={s.key} className="card stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Tareas Recientes</h2>
        <Link to="/tasks" className="btn btn-secondary btn-sm">Ver todas →</Link>
      </div>

      {recentTasks.length === 0 ? (
        <div className="card empty-state">
          <h3>Sin tareas todavía</h3>
          <p>Crea tu primera tarea para empezar a organizar tu trabajo.</p>
          <Link to="/tasks/new" className="btn btn-primary">+ Crear primera tarea</Link>
        </div>
      ) : (
        <div className="grid-2">
          {recentTasks.map((task) => (
            <Link to={`/tasks/${task._id}`} key={task._id} style={{ textDecoration: 'none' }}>
              <div className="card task-card">
                <div className="task-card-header">
                  <div className="task-card-title">{task.title}</div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
                <div className="task-card-footer">
                  <span className={`badge badge-${task.status}`}>{statusLabels[task.status]}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
