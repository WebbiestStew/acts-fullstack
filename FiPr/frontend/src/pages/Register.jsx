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
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      const errs = err.response?.data?.errors;
      setError(errs ? errs.map((e) => e.message).join(', ') : msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🚗</div>
          <h1>Auto<span>Vault</span></h1>
          <p>Create your free account</p>
        </div>

        <h2 style={{ marginBottom: 22, fontSize: 20, fontWeight: 700 }}>Create Account</h2>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" type="text" name="name" placeholder="Your full name"
              value={form.name} onChange={handleChange} required autoFocus />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-control" type="password" name="confirm" placeholder="Repeat password"
                value={form.confirm} onChange={handleChange} required />
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider" />
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
