import { useNavigate } from 'react-router-dom';

const priorityLabels = { low: 'Baja', medium: 'Media', high: 'Alta' };
const statusLabels = { pending: 'Pendiente', 'in-progress': 'En Progreso', completed: 'Completada', cancelled: 'Cancelada' };

const TaskCard = ({ task, onDelete, onStatusChange }) => {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta tarea?')) onDelete(task._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/tasks/${task._id}/edit`);
  };

  return (
    <div className="card task-card" onClick={() => navigate(`/tasks/${task._id}`)}>
      <div className="task-card-header">
        <div>
          <div className="task-card-title">{task.title}</div>
          <span className="badge badge-{task.category}">{task.category || 'General'}</span>
        </div>
        <span className={`badge badge-${task.priority}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <span className={`badge badge-${task.status}`}>
          {statusLabels[task.status]}
        </span>
        {task.dueDate && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            📅 {new Date(task.dueDate).toLocaleDateString('es-MX')}
          </span>
        )}
      </div>

      <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
        {task.status !== 'completed' && (
          <button
            className="btn btn-success btn-sm"
            onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, 'completed'); }}
          >
            ✓ Completar
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
          ✏️ Editar
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
