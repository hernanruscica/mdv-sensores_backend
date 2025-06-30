import express from 'express';
import { registerLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } from '../controllers/locationController.js';
import { protect } from '../middlewares/authMiddleware.js';

import {uploadImage} from '../controllers/imageController.js';
import {upload} from '../middlewares/uploadMiddleware.js';

const router = express.Router();
//      /api/locations
router.post('/', protect, upload.single('foto'), uploadImage, registerLocation);
router.get('/', protect, getAllLocations);
router.get('/:id', protect, getLocationById);

router.put('/:id', protect, upload.single('foto'), uploadImage, updateLocation);

router.delete('/:id', protect, deleteLocation);

export default router;
