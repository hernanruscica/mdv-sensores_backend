import express from 'express';
import { registerLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } from '../controllers/locationController.js';
import { protect } from '../middlewares/authMiddleware.js';

import { uploadImage } from '../controllers/imageController.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();
//      /api/locations
router.post('/', protect, registerLocation);
router.get('/', protect, getAllLocations);
router.get('/:id', protect, getLocationById);

router.put('/:id', upload.single('foto'), uploadImage, protect, updateLocation);

router.delete('/:id', protect, deleteLocation);

export default router;
