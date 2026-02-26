import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService.js';

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  category: 'General',
  dueDate: '',
};

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await taskService.getTaskById(id);
        const t = res.data.data;
        setForm({
          title: t.title || '',
          description: t.description || '',
          status: t.status || 'pending',
          priority: t.priority || 'medium',
          category: t.category || 'General',
          dueDate: t.dueDate ? t.dueDate.substring(0, 10) : '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar tarea');
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (isEdit) {
        await taskService.updateTask(id, payload);
      } else {
        await taskService.createTask(payload);
      }
      navigate('/tasks');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fe = {};
        data.errors.forEach((e) => { fe[e.field] = e.message; });
        setFieldErrors(fe);
      }
      setError(data?.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/tasks" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>← Volver a tareas</Link>
          <h1 className="page-title" style={{ marginTop: 8 }}>
            {isEdit ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
          </h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              className="form-control"
              name="title"
              placeholder="Título de la tarea"
              value={form.title}
              onChange={handleChange}
              required
            />
            {fieldErrors.title && <p className="error-msg">{fieldErrors.title}</p>}
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              className="form-control"
              name="description"
              placeholder="Descripción opcional..."
              rows={4}
              value={form.description}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
            {fieldErrors.description && <p className="error-msg">{fieldErrors.description}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label>Prioridad</label>
              <select className="form-control" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Categoría</label>
              <input
                className="form-control"
                name="category"
                placeholder="ej. Trabajo, Personal..."
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Fecha límite</label>
              <input
                className="form-control"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? '💾 Guardar cambios' : '➕ Crear tarea'}
            </button>
            <Link to="/tasks" className="btn btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
