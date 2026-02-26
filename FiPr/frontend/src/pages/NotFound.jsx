import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '80px 20px' }}>
    <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>404 – Página no encontrada</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
      La página que buscas no existe o fue movida.
    </p>
    <Link to="/" className="btn btn-primary">Ir al inicio</Link>
  </div>
);

export default NotFound;
