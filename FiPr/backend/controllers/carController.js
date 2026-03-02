const Car = require('../models/Car');

/**
 * GET /api/cars
 * List cars with pagination, filters, and search.
 * Admins see all cars; regular users see only their own listings.
 */
const getCars = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      condition,
      fuelType,
      transmission,
      make,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    // Admins see all; regular users see only their own listings
    if (req.user.role !== 'admin') {
      filter.addedBy = req.user._id;
    }

    if (status) filter.status = status;
    if (condition) filter.condition = condition;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (make) filter.make = { $regex: make, $options: 'i' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }

    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .populate('addedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Car.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cars/stats
 * Returns inventory statistics (admin only).
 */
const getCarStats = async (req, res, next) => {
  try {
    const [byStatus, byMake, byCondition, totals] = await Promise.all([
      Car.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Car.aggregate([
        { $group: { _id: '$make', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Car.aggregate([{ $group: { _id: '$condition', count: { $sum: 1 } } }]),
      Car.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            totalValue: { $sum: '$price' },
            avgMileage: { $avg: '$mileage' },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        byMake,
        byCondition,
        totals: totals[0] || { total: 0, avgPrice: 0, totalValue: 0, avgMileage: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cars/:id
 * Get a single car by ID.
 */
const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('addedBy', 'name email');

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    // Regular users can only view their own listings
    if (req.user.role !== 'admin' && car.addedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this car.' });
    }

    res.status(200).json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cars
 * Create a new car listing.
 */
const createCar = async (req, res, next) => {
  try {
    const {
      make, model, year, color, price, mileage,
      status, condition, fuelType, transmission,
      vin, description, features,
    } = req.body;

    const car = await Car.create({
      make, model, year, color, price, mileage,
      status, condition, fuelType, transmission,
      vin: vin || null,
      description,
      features: features || [],
      addedBy: req.user._id,
    });

    await car.populate('addedBy', 'name email');

    res.status(201).json({ success: true, message: 'Car listing created successfully.', data: car });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cars/:id
 * Fully update a car listing.
 */
const updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    // Regular users can only edit their own listings
    if (req.user.role !== 'admin' && car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this car.' });
    }

    const {
      make, model, year, color, price, mileage,
      status, condition, fuelType, transmission,
      vin, description, features,
    } = req.body;

    car = await Car.findByIdAndUpdate(
      req.params.id,
      { make, model, year, color, price, mileage, status, condition, fuelType, transmission, vin, description, features },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    res.status(200).json({ success: true, message: 'Car listing updated successfully.', data: car });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cars/:id
 * Delete a car listing.
 */
const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    // Regular users can only delete their own listings
    if (req.user.role !== 'admin' && car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this car.' });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Car listing deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/cars/:id/status
 * Update only the status of a car listing.
 */
const updateCarStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'sold', 'reserved', 'maintenance'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    if (req.user.role !== 'admin' && car.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this car.' });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    res.status(200).json({ success: true, message: 'Car status updated successfully.', data: updatedCar });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCars,
  getCarStats,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
};
