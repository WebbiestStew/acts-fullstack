require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Car  = require('./models/Car');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/car-inventory';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Car.deleteMany({});
  console.log('Cleared existing data');

  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass  = await bcrypt.hash('user1234', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@autovault.com', password: adminPass, role: 'admin' });
  const user1 = await User.create({ name: 'Carlos Mendez', email: 'carlos@example.com', password: userPass });
  const user2 = await User.create({ name: 'Sofia Rivera', email: 'sofia@example.com', password: userPass });
  console.log('Users created');

  const cars = [
    { make: 'Toyota', model: 'Camry', year: 2022, color: 'Pearl White', price: 27500, mileage: 12400, status: 'available', condition: 'used', fuelType: 'gasoline', transmission: 'automatic', description: 'Clean title, single owner, excellent condition.', features: ['Backup Camera', 'Lane Assist', 'Apple CarPlay', 'Heated Seats'], addedBy: admin._id },
    { make: 'Honda', model: 'Civic', year: 2023, color: 'Sonic Gray', price: 24800, mileage: 5200, status: 'available', condition: 'certified', fuelType: 'gasoline', transmission: 'automatic', description: 'Honda Certified Pre-Owned with extended warranty.', features: ['Honda Sensing', 'Sunroof', 'Android Auto'], addedBy: admin._id },
    { make: 'Ford', model: 'Mustang GT', year: 2021, color: 'Race Red', price: 38900, mileage: 22000, status: 'available', condition: 'used', fuelType: 'gasoline', transmission: 'manual', description: '5.0L V8, 450hp. Upgraded exhaust. Clean Carfax.', features: ['Performance Package', 'Brembo Brakes', 'MagneRide'], addedBy: user1._id },
    { make: 'Tesla', model: 'Model 3', year: 2023, color: 'Midnight Silver', price: 43000, mileage: 8100, status: 'available', condition: 'used', fuelType: 'electric', transmission: 'automatic', description: 'Long Range AWD. Autopilot included. 358-mile range.', features: ['Full Self-Driving', 'Supercharging', 'Glass Roof'], addedBy: user1._id },
    { make: 'BMW', model: '3 Series', year: 2022, color: 'Alpine White', price: 45500, mileage: 18000, status: 'reserved', condition: 'certified', fuelType: 'gasoline', transmission: 'automatic', description: 'CPO with 2-year warranty. Sport Line trim.', features: ['M Sport Package', 'Harman Kardon', 'Parking Assist'], addedBy: user2._id },
    { make: 'Chevrolet', model: 'Silverado 1500', year: 2021, color: 'Black', price: 42000, mileage: 31000, status: 'available', condition: 'used', fuelType: 'gasoline', transmission: 'automatic', description: 'LTZ trim, crew cab. Towing package. Bed liner.', features: ['Z71 Off-Road', 'Trailer Package', 'MyLink'], addedBy: user2._id },
    { make: 'Hyundai', model: 'Tucson', year: 2023, color: 'Phantom Black', price: 31200, mileage: 4500, status: 'available', condition: 'new', fuelType: 'hybrid', transmission: 'automatic', description: 'Hybrid AWD. Top safety pick. Under factory warranty.', features: ['BOSE Audio', 'Panoramic Sunroof', 'Wireless Charging'], addedBy: admin._id },
    { make: 'Jeep', model: 'Wrangler', year: 2020, color: 'Firecracker Red', price: 35000, mileage: 44000, status: 'sold', condition: 'used', fuelType: 'gasoline', transmission: 'manual', description: 'Rubicon trim. 2-inch lift kit. 35-inch tires.', features: ['Rock-Trac 4WD', 'Dana 44 Axles', 'LED Lighting'], addedBy: admin._id },
  ];

  await Car.insertMany(cars);
  console.log(`Created ${cars.length} vehicles`);

  console.log('\n--- Seed complete ---');
  console.log('Admin:  admin@autovault.com / admin123');
  console.log('User 1: carlos@example.com / user1234');
  console.log('User 2: sofia@example.com  / user1234');

  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
