import express from 'express';
import { registerLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } from '../controllers/locationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/locations
router.post('/', protect, registerLocation);
router.get('/', protect, getAllLocations);
router.get('/:id', protect, getLocationById);
router.put('/:id', protect, updateLocation);
router.delete('/:id', protect, deleteLocation);

export default router;
