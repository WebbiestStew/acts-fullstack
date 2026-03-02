import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import carService from '../services/carService.js';
import CarCard from '../components/CarCard.jsx';
import Pagination from '../components/Pagination.jsx';

const MAKES = ['Acura','Alfa Romeo','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge',
  'Ferrari','Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia',
  'Lamborghini','Land Rover','Lexus','Lincoln','Maserati','Mazda','McLaren','Mercedes-Benz',
  'Mitsubishi','Nissan','Porsche','Ram','Rolls-Royce','Subaru','Tesla','Toyota','Volkswagen','Volvo'];

const defaultFilters = {
  search: '', status: '', condition: '', fuelType: '', make: '',
  sortBy: 'createdAt', sortOrder: 'desc'
};

const Cars = () => {
  const { user, isAdmin } = useAuth();

  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasActiveFilters = Object.entries(filters).some(([k, v]) =>
    !['sortBy', 'sortOrder'].includes(k) && v !== ''
  );

  const loadCars = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await carService.getCars(params);
      setCars(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle listing?')) return;
    try {
      await carService.deleteCar(id);
      loadCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await carService.updateStatus(id, newStatus);
      loadCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {loading ? 'Loading...' : `${pagination.total} vehicle${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link to="/cars/new" className="btn btn-primary">+ Add Vehicle</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          <input
            className="form-control"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search make, model…"
            style={{ minWidth: 180, flex: '1 1 180px' }}
          />
          <select className="form-control" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select className="form-control" name="condition" value={filters.condition} onChange={handleFilterChange}>
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="certified">Certified</option>
          </select>
          <select className="form-control" name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
            <option value="">All Fuels</option>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <select className="form-control" name="make" value={filters.make} onChange={handleFilterChange}>
            <option value="">All Makes</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="form-control" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="year">Year</option>
            <option value="mileage">Mileage</option>
          </select>
          <select className="form-control" name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
            <option value="desc">High → Low</option>
            <option value="asc">Low → High</option>
          </select>
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="spinner-overlay"><div className="spinner" /></div>
      ) : cars.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>{hasActiveFilters ? 'No vehicles match your filters.' : 'No vehicles in inventory yet.'}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Start by adding your first vehicle listing.'}
          </p>
          {hasActiveFilters
            ? <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
            : <Link to="/cars/new" className="btn btn-primary">Add First Vehicle</Link>
          }
        </div>
      ) : (
        <>
          <div className="cars-grid">
            {cars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                isAdmin={isAdmin}
                currentUserId={user?._id}
              />
            ))}
          </div>
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default Cars;
