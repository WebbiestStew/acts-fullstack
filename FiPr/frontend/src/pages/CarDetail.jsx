import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import carService from '../services/carService.js';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
const formatMileage = (m) => new Intl.NumberFormat('en-US').format(m);
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await carService.getCarById(id);
        setCar(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Car not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isOwner = car?.addedBy?._id === user?._id || car?.addedBy === user?._id;
  const canEdit = isAdmin || isOwner;

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${car.year} ${car.make} ${car.model}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await carService.deleteCar(id);
      navigate('/cars');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await carService.updateStatus(id, newStatus);
      setCar(res.data.data);
      setSuccessMsg('Status updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  if (error && !car) return (
    <div>
      <div className="alert alert-error">{error}</div>
      <Link to="/cars" className="btn btn-secondary" style={{ marginTop: 16, display: 'inline-block' }}>← Back to Inventory</Link>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/cars" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Inventory</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{car.year} {car.make} {car.model}</span>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{successMsg}</div>}

      <div className="detail-grid">
        {/* Left: main info */}
        <div>
          {/* Header card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, letterSpacing: '-.3px' }}>
                  {car.year} {car.make} {car.model}
                </h1>
                <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                  {car.color} &middot; {car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)} &middot; {car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price-display">
                  <span className="price-currency">$</span>
                  {new Intl.NumberFormat('en-US').format(car.price)}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge badge-${car.status}`}>{car.status}</span>
                </div>
              </div>
            </div>

            {car.description && (
              <>
                <div className="section-divider" />
                <p style={{ color: 'var(--text-subtle)', fontSize: 14, lineHeight: 1.8 }}>{car.description}</p>
              </>
            )}

            {car.features?.length > 0 && (
              <>
                <div className="section-divider" />
                <div className="detail-section-title">Features</div>
                <div className="features-list">
                  {car.features.map((f, i) => <span key={i} className="feature-tag">{f}</span>)}
                </div>
              </>
            )}
          </div>

          {/* Specs card */}
          <div className="card">
            <div className="detail-section-title">Vehicle Specifications</div>
            <div className="detail-meta-grid">
              <div className="detail-meta-item"><label>Make</label><p>{car.make}</p></div>
              <div className="detail-meta-item"><label>Model</label><p>{car.model}</p></div>
              <div className="detail-meta-item"><label>Year</label><p>{car.year}</p></div>
              <div className="detail-meta-item"><label>Color</label><p>{car.color}</p></div>
              <div className="detail-meta-item">
                <label>Mileage</label>
                <p>{formatMileage(car.mileage)} miles</p>
              </div>
              <div className="detail-meta-item">
                <label>Transmission</label>
                <p style={{ textTransform: 'capitalize' }}>{car.transmission}</p>
              </div>
              <div className="detail-meta-item">
                <label>Fuel Type</label>
                <p style={{ textTransform: 'capitalize' }}>{car.fuelType}</p>
              </div>
              <div className="detail-meta-item">
                <label>Condition</label>
                <p><span className={`badge badge-${car.condition}`}>{car.condition}</span></p>
              </div>
              {car.vin && (
                <div className="detail-meta-item" style={{ gridColumn: '1 / -1' }}>
                  <label>VIN</label>
                  <p><span className="vin-code">{car.vin}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {canEdit && (
            <div className="card">
              <div className="detail-section-title">Status Management</div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label>Current Status</label>
                <select className="form-control" value={car.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={statusUpdating}>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {statusUpdating && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Updating...</div>}
            </div>
          )}

          <div className="card">
            <div className="detail-section-title">Listing Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="detail-meta-item"><label>Added by</label><p>{car.addedBy?.name || '—'}</p></div>
              <div className="detail-meta-item">
                <label>Email</label>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{car.addedBy?.email || '—'}</p>
              </div>
              <div className="detail-meta-item"><label>Listed on</label><p>{formatDate(car.createdAt)}</p></div>
              <div className="detail-meta-item"><label>Last updated</label><p>{formatDate(car.updatedAt)}</p></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/cars" className="btn btn-secondary" style={{ justifyContent: 'center' }}>← Back to Inventory</Link>
            {canEdit && (
              <>
                <Link to={`/cars/${id}/edit`} className="btn btn-primary" style={{ justifyContent: 'center' }}>Edit Vehicle</Link>
                <button className="btn btn-danger" style={{ justifyContent: 'center' }} onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Listing'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
