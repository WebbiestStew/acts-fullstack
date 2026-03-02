import { Link } from 'react-router-dom';

/**
 * Formats a number as a USD currency string.
 */
const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

/**
 * Formats mileage with commas.
 */
const formatMileage = (miles) =>
  new Intl.NumberFormat('en-US').format(miles);

const CarCard = ({ car, onDelete, onStatusChange, isAdmin, currentUserId }) => {
  const isOwner = car.addedBy?._id === currentUserId || car.addedBy === currentUserId;
  const canEdit = isAdmin || isOwner;

  return (
    <div className="card car-card">
      <div className="car-card-header">
        <div>
          <div className="car-card-title">{car.year} {car.make} {car.model}</div>
          <div className="car-card-year">{car.color} · {car.transmission}</div>
        </div>
        <span className={`badge badge-${car.status}`}>{car.status}</span>
      </div>

      <div className="car-card-price">{formatPrice(car.price)}</div>

      <div className="car-card-meta">
        <div className="car-meta-item">
          <div className="meta-label">Mileage</div>
          <div className="meta-value">{formatMileage(car.mileage)} mi</div>
        </div>
        <div className="car-meta-item">
          <div className="meta-label">Condition</div>
          <div className="meta-value" style={{ textTransform: 'capitalize' }}>{car.condition}</div>
        </div>
        <div className="car-meta-item">
          <div className="meta-label">Fuel</div>
          <div className="meta-value" style={{ textTransform: 'capitalize' }}>{car.fuelType}</div>
        </div>
        <div className="car-meta-item">
          <div className="meta-label">Added by</div>
          <div className="meta-value">{car.addedBy?.name || '—'}</div>
        </div>
      </div>

      {car.description && (
        <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {car.description}
        </p>
      )}

      <div className="car-card-footer">
        <span className={`badge badge-${car.condition}`}>{car.condition}</span>
        <span className={`badge badge-${car.fuelType}`}>{car.fuelType}</span>
      </div>

      <div className="car-card-actions">
        <Link to={`/cars/${car._id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>
        {canEdit && (
          <>
            <Link to={`/cars/${car._id}/edit`} className="btn btn-ghost btn-sm">
              Edit
            </Link>
            {onDelete && (
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(car._id)}>
                Delete
              </button>
            )}
          </>
        )}
        {canEdit && onStatusChange && car.status !== 'sold' && (
          <button
            className="btn btn-success btn-sm"
            onClick={() => onStatusChange(car._id, 'sold')}
            style={{ marginLeft: 'auto' }}
          >
            Mark Sold
          </button>
        )}
      </div>
    </div>
  );
};

export default CarCard;
