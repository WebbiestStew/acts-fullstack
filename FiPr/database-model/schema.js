/**
 * ============================================================
 * AutoVault - Car Inventory — MongoDB Schema
 * Database: MongoDB (Mongoose ODM)
 * ============================================================
 *
 * Collections:
 *   1. users
 *   2. cars
 * ============================================================
 */

import mongoose from 'mongoose';

// ─── User Collection ──────────────────────────
const userSchema = new mongoose.Schema(
  {
    name:     { type: String,  required: true, trim: true, maxlength: 50 },
    email:    { type: String,  required: true, unique: true, lowercase: true },
    password: { type: String,  required: true, select: false },
    role:     { type: String,  enum: ['user', 'admin'], default: 'user' },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Car Collection ───────────────────────────
const carSchema = new mongoose.Schema(
  {
    make:     { type: String, required: true, trim: true, maxlength: 50 },
    model:    { type: String, required: true, trim: true, maxlength: 50 },
    year:     { type: Number, required: true, min: 1900 },
    color:    { type: String, required: true, trim: true },
    price:    { type: Number, required: true, min: 0 },
    mileage:  { type: Number, required: true, min: 0 },
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
      type: String, uppercase: true, sparse: true, unique: true,
      match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN must be exactly 17 characters'],
    },
    description: { type: String, maxlength: 1000 },
    features:    [{ type: String }],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

carSchema.index({ status: 1, make: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: -1 });
carSchema.index({ make: 'text', model: 'text', description: 'text' });

export const User = mongoose.model('User', userSchema);
export const Car  = mongoose.model('Car',  carSchema);
