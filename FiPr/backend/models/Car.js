const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
      maxlength: [50, 'Make cannot exceed 50 characters'],
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      maxlength: [50, 'Model cannot exceed 50 characters'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
      maxlength: [30, 'Color cannot exceed 30 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage cannot be negative'],
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'maintenance'],
      default: 'available',
    },
    condition: {
      type: String,
      enum: ['new', 'used', 'certified'],
      default: 'used',
    },
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
      default: 'gasoline',
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic',
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN must be exactly 17 alphanumeric characters'],
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
carSchema.index({ status: 1, make: 1 });
carSchema.index({ make: 'text', model: 'text', description: 'text' });
carSchema.index({ price: 1 });
carSchema.index({ year: 1 });

module.exports = mongoose.model('Car', carSchema);
