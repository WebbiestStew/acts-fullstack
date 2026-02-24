import Car from '../models/Car.js';

// @desc    Get all cars
// @route   GET /api/cars
// @access  Private
export const getCars = async (req, res, next) => {
  try {
    const cars = await Car.find().populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Private
export const getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('createdBy', 'username email');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new car
// @route   POST /api/cars
// @access  Private
export const createCar = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private
export const updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Make sure user is car owner or admin
    if (car.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this car'
      });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Make sure user is car owner or admin
    if (car.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this car'
      });
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
