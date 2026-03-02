import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import carService from '../services/carService.js';

const MAKES = [
  'Acura','Alfa Romeo','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge',
  'Ferrari','Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep',
  'Kia','Lamborghini','Land Rover','Lexus','Lincoln','Maserati','Mazda','McLaren',
  'Mercedes-Benz','Mitsubishi','Nissan','Porsche','Ram','Rolls-Royce','Subaru',
  'Tesla','Toyota','Volkswagen','Volvo','Other'
];
const CURRENT_YEAR = new Date().getFullYear();

const defaultForm = {
  make: '', model: '', year: CURRENT_YEAR, color: '', price: '', mileage: '',
  status: 'available', condition: 'used', fuelType: 'gasoline', transmission: 'automatic',
  vin: '', description: '', features: ''
};

const CarForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await carService.getCarById(id);
        const c = res.data.data;
        setForm({
          make: c.make || '', model: c.model || '', year: c.year || CURRENT_YEAR,
          color: c.color || '', price: c.price !== undefined ? String(c.price) : '',
          mileage: c.mileage !== undefined ? String(c.mileage) : '',
          status: c.status || 'available', condition: c.condition || 'used',
          fuelType: c.fuelType || 'gasoline', transmission: c.transmission || 'automatic',
          vin: c.vin || '', description: c.description || '',
          features: Array.isArray(c.features) ? c.features.join(', ') : ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vehicle.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const payload = {
      make: form.make, model: form.model, year: parseInt(form.year, 10),
      color: form.color, price: parseFloat(form.price), mileage: parseFloat(form.mileage),
      status: form.status, condition: form.condition, fuelType: form.fuelType,
      transmission: form.transmission, description: form.description || undefined,
      features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
    };
    if (form.vin.trim()) payload.vin = form.vin.trim().toUpperCase();

    setSubmitting(true);
    try {
      if (isEdit) {
        await carService.updateCar(id, payload);
        navigate(`/cars/${id}`);
      } else {
        const res = await carService.createCar(payload);
        navigate(`/cars/${res.data.data._id}`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fErr = {};
        data.errors.forEach((e) => { if (e.path) fErr[e.path] = e.msg; });
        setFieldErrors(fErr);
        setError('Please fix the errors below.');
      } else {
        setError(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/cars" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Inventory</Link>
        {isEdit && (
          <>
            <span>›</span>
            <Link to={`/cars/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Detail</Link>
          </>
        )}
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</span>
      </div>

      <div className="card">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          {isEdit ? 'Update the vehicle details below.' : 'Fill in the details to add a new vehicle to inventory.'}
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section-title">Basic Info</div>
          <div className="form-row-3">
            <div className="form-group">
              <label>Make <span className="required">*</span></label>
              <select name="make" value={form.make} onChange={handleChange} required className={fieldErrors.make ? 'input-error' : ''}>
                <option value="">— Select make —</option>
                {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {fieldErrors.make && <span className="field-error">{fieldErrors.make}</span>}
            </div>
            <div className="form-group">
              <label>Model <span className="required">*</span></label>
              <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="e.g. Camry" required maxLength={50} className={fieldErrors.model ? 'input-error' : ''} />
              {fieldErrors.model && <span className="field-error">{fieldErrors.model}</span>}
            </div>
            <div className="form-group">
              <label>Year <span className="required">*</span></label>
              <input type="number" name="year" value={form.year} onChange={handleChange} min={1900} max={CURRENT_YEAR + 1} required className={fieldErrors.year ? 'input-error' : ''} />
              {fieldErrors.year && <span className="field-error">{fieldErrors.year}</span>}
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Price (USD) <span className="required">*</span></label>
              <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 24500" min={0} step={1} required className={fieldErrors.price ? 'input-error' : ''} />
              {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
            </div>
            <div className="form-group">
              <label>Mileage (miles) <span className="required">*</span></label>
              <input type="number" name="mileage" value={form.mileage} onChange={handleChange} placeholder="e.g. 35000" min={0} step={1} required className={fieldErrors.mileage ? 'input-error' : ''} />
              {fieldErrors.mileage && <span className="field-error">{fieldErrors.mileage}</span>}
            </div>
            <div className="form-group">
              <label>Color <span className="required">*</span></label>
              <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="e.g. Midnight Black" required maxLength={30} className={fieldErrors.color ? 'input-error' : ''} />
              {fieldErrors.color && <span className="field-error">{fieldErrors.color}</span>}
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: 8 }}>Specifications</div>
          <div className="form-row">
            <div className="form-group">
              <label>Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange}>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="certified">Certified Pre-Owned</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fuel Type</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange}>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transmission</label>
              <select name="transmission" value={form.transmission} onChange={handleChange}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>VIN <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional, 17 characters)</span></label>
            <input type="text" name="vin" value={form.vin} onChange={handleChange} placeholder="e.g. 1HGBH41JXMN109186" maxLength={17} style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1 }} className={fieldErrors.vin ? 'input-error' : ''} />
            {fieldErrors.vin && <span className="field-error">{fieldErrors.vin}</span>}
          </div>

          <div className="form-section-title" style={{ marginTop: 8 }}>Additional Details</div>
          <div className="form-group">
            <label>Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the vehicle condition, history, notable features..." rows={4} maxLength={1000} className={fieldErrors.description ? 'input-error' : ''} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.description.length}/1000</span>
          </div>

          <div className="form-group">
            <label>Features <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
            <input type="text" name="features" value={form.features} onChange={handleChange} placeholder="e.g. Sunroof, Leather Seats, Apple CarPlay, Backup Camera" />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
            <Link to={isEdit ? `/cars/${id}` : '/cars'} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add to Inventory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarForm;
