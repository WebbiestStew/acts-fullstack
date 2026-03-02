import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <div className="brand-icon">🚗</div>
        <div className="brand-name">Auto<span>Vault</span></div>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/cars" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Inventory
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Admin
          </NavLink>
        )}
      </div>

      <div className="navbar-right">
        <div className="navbar-user-info">
          <div className="navbar-user-name">{user?.name}</div>
          <div className="navbar-user-role">
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

