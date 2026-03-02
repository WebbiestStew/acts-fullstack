import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import carService from '../services/carService.js';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCars, setRecentCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [carsRes, statsRes] = await Promise.all([
          carService.getCars({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
          isAdmin ? carService.getStats() : Promise.resolve(null),
        ]);

        setRecentCars(carsRes.data.data);

        if (statsRes) {
          setStats(statsRes.data.data);
        } else {
          // Build basic stats for regular user from their own cars
          const allRes = await carService.getCars({ limit: 100 });
          const cars = allRes.data.data;
          const byStatus = cars.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {});
          const totalValue = cars.reduce((sum, c) => sum + c.price, 0);
          setStats({
            totals: { total: allRes.data.pagination.total, totalValue, avgPrice: totalValue / (cars.length || 1) },
            byStatus: Object.entries(byStatus).map(([_id, count]) => ({ _id, count })),
            byMake: [],
            byCondition: [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  const getCount = (status) => stats?.byStatus?.find((s) => s._id === status)?.count || 0;

  const statCards = [
    { label: 'Available', value: getCount('available'), color: 'color-green', icon: '✅' },
    { label: 'Reserved', value: getCount('reserved'),  color: 'color-yellow', icon: '🔒' },
    { label: 'Sold',      value: getCount('sold'),      color: 'color-info',   icon: '🏷️' },
    {
      label: 'Total Value',
      value: stats?.totals?.totalValue ? formatPrice(stats.totals.totalValue) : '$0',
      color: 'color-orange',
      icon: '💰',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your inventory overview</p>
        </div>
        <Link to="/cars/new" className="btn btn-accent">+ Add Vehicle</Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {statCards.map((s) => (
          <div key={s.label} className={`card stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick info row */}
      {isAdmin && stats?.totals && (
        <div className="card" style={{ marginBottom: 28, display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Total Vehicles</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{stats.totals.total}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Avg. Price</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>{formatPrice(stats.totals.avgPrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Inventory Value</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{formatPrice(stats.totals.totalValue)}</div>
          </div>
          {stats?.byMake?.length > 0 && (
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700, marginBottom: 8 }}>Top Makes</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stats.byMake.slice(0, 5).map((m) => (
                  <span key={m._id} className="feature-tag">{m._id} ({m.count})</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent listings */}
      <div className="page-header" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Listings</h2>
        <Link to="/cars" className="btn btn-secondary btn-sm">View all →</Link>
      </div>

      {recentCars.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🚗</div>
          <h3>No vehicles yet</h3>
          <p>Add your first vehicle to start building your inventory.</p>
          <Link to="/cars/new" className="btn btn-accent">+ Add First Vehicle</Link>
        </div>
      ) : (
        <div className="grid-2">
          {recentCars.map((car) => (
            <Link to={`/cars/${car._id}`} key={car._id} style={{ textDecoration: 'none' }}>
              <div className="card car-card">
                <div className="car-card-header">
                  <div>
                    <div className="car-card-title">{car.year} {car.make} {car.model}</div>
                    <div className="car-card-year">{car.color} · {car.transmission}</div>
                  </div>
                  <span className={`badge badge-${car.status}`}>{car.status}</span>
                </div>
                <div className="car-card-price">{formatPrice(car.price)}</div>
                <div className="car-card-footer">
                  <span className={`badge badge-${car.condition}`}>{car.condition}</span>
                  <span className={`badge badge-${car.fuelType}`}>{car.fuelType}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Intl.NumberFormat('en-US').format(car.mileage)} mi
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
