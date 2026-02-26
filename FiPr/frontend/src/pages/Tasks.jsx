import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import taskService from '../services/taskService.js';
import TaskCard from '../components/TaskCard.jsx';
import Pagination from '../components/Pagination.jsx';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    status: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await taskService.getTasks(params);
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDelete = async (id) => {
    try {
      await taskService.deleteTask(id);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await taskService.updateStatus(id, status);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Tareas</h1>
          <p className="page-subtitle">Gestiona todas tus tareas</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">+ Nueva Tarea</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="form-control"
          type="text"
          placeholder="🔍 Buscar..."
          value={filters.search}
          onChange={(e) => handleFilter('search', e.target.value)}
        />
        <select className="form-control" value={filters.status} onChange={(e) => handleFilter('status', e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in-progress">En Progreso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <select className="form-control" value={filters.priority} onChange={(e) => handleFilter('priority', e.target.value)}>
          <option value="">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <select className="form-control" value={filters.sortOrder} onChange={(e) => handleFilter('sortOrder', e.target.value)}>
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguas</option>
        </select>
        {(filters.status || filters.priority || filters.search) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setFilters((p) => ({ ...p, status: '', priority: '', search: '', page: 1 }))}
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-overlay"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="card empty-state">
          <h3>Sin resultados</h3>
          <p>No se encontraron tareas con los filtros actuales.</p>
          <Link to="/tasks/new" className="btn btn-primary">+ Crear tarea</Link>
        </div>
      ) : (
        <>
          <div className="grid-2">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />
        </>
      )}
    </div>
  );
};

export default Tasks;
