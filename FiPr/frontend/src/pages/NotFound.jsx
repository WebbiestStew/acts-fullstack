import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ textAlign: 'center', paddingTop: 80 }}>
    <div style={{ fontSize: 72, marginBottom: 16 }}>🚗</div>
    <h1 style={{ fontSize: 56, fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>404</h1>
    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Destination Not Found</h2>
    <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
      Looks like this road doesn't exist. Head back to the dashboard and get back on track.
    </p>
    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
  </div>
);

export default NotFound;
