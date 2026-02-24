import express from 'express';
import {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar
} from '../controllers/carController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getCars)
  .post(createCar);

router.route('/:id')
  .get(getCar)
  .put(updateCar)
  .delete(deleteCar);

export default router;
