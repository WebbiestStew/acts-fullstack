import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Cars from './pages/Cars.jsx';
import CarDetail from './pages/CarDetail.jsx';
import CarForm from './pages/CarForm.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  const { user } = useAuth();

  return (
    <div className="app-wrapper">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/new" element={<CarForm />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/cars/:id/edit" element={<CarForm />} />
          </Route>

          {/* Admin only */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

