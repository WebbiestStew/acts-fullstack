import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Car brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [50, 'Model name cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be 1900 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  transmission: {
    type: String,
    required: [true, 'Transmission is required'],
    enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plugin-Hybrid']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Used', 'Certified Pre-Owned']
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    maxlength: [17, 'VIN must be 17 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Car+Image'
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved'],
    default: 'Available'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Car = mongoose.model('Car', carSchema);

export default Car;
