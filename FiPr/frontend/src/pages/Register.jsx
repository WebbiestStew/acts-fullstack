import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden.');
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      const errs = err.response?.data?.errors;
      setError(errs ? errs.map((e) => e.message).join(', ') : msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <h1>✅ TaskManager Pro</h1>
          <p>Crea tu cuenta gratis</p>
        </div>

        <h2 style={{ marginBottom: 20, fontSize: 20 }}>Registro</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input className="form-control" type="text" name="name" placeholder="Tu nombre" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input className="form-control" type="password" name="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input className="form-control" type="password" name="confirm" placeholder="Repite la contraseña" value={form.confirm} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
