import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService.js';
import { useAuth } from '../context/AuthContext.jsx';

const statusLabels = { pending: 'Pendiente', 'in-progress': 'En Progreso', completed: 'Completada', cancelled: 'Cancelada' };
const priorityLabels = { low: 'Baja', medium: 'Media', high: 'Alta' };

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await taskService.getTaskById(id);
        setTask(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar la tarea');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await taskService.deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await taskService.updateStatus(id, newStatus);
      setTask(res.data.data);
      setSuccessMsg('Estado actualizado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error" style={{ marginTop: 20 }}>{error}</div>;
  if (!task) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/tasks" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>← Volver a tareas</Link>
          <h1 className="page-title" style={{ marginTop: 8 }}>{task.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/tasks/${id}/edit`} className="btn btn-secondary">✏️ Editar</Link>
          <button className="btn btn-danger" onClick={handleDelete}>🗑 Eliminar</button>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="detail-grid">
        {/* Main content */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12, fontSize: 16, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 12, fontWeight: 700 }}>Descripción</h3>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: task.description ? 'var(--text)' : 'var(--text-muted)' }}>
              {task.description || 'Sin descripción.'}
            </p>
          </div>

          {/* Status change */}
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cambiar Estado</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['pending', 'in-progress', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  disabled={task.status === s || statusLoading}
                  className={`btn btn-sm ${task.status === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleStatusChange(s)}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="card detail-meta">
          <div className="detail-meta-item">
            <label>Estado</label>
            <p><span className={`badge badge-${task.status}`}>{statusLabels[task.status]}</span></p>
          </div>
          <div className="detail-meta-item">
            <label>Prioridad</label>
            <p><span className={`badge badge-${task.priority}`}>{priorityLabels[task.priority]}</span></p>
          </div>
          <div className="detail-meta-item">
            <label>Categoría</label>
            <p>{task.category || '—'}</p>
          </div>
          <div className="detail-meta-item">
            <label>Fecha límite</label>
            <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-MX', { dateStyle: 'long' }) : '—'}</p>
          </div>
          {isAdmin && task.owner && (
            <div className="detail-meta-item">
              <label>Dueño</label>
              <p>{task.owner.name} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({task.owner.email})</span></p>
            </div>
          )}
          <div className="detail-meta-item">
            <label>Creada</label>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(task.createdAt).toLocaleString('es-MX')}</p>
          </div>
          <div className="detail-meta-item">
            <label>Actualizada</label>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(task.updatedAt).toLocaleString('es-MX')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
