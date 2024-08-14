import express from 'express';
import { registerLocationUser, getAllLocationsUser, getLocationsUserById, getLocationsByUserId, getUsersByLocationId, updateLocationUser, deleteLocationUser } from '../controllers/locationUserController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/locationsusers
router.post('/', protect, registerLocationUser);
router.get('/', protect, getAllLocationsUser);
router.get('/:id', protect, getLocationsUserById);
router.get('/locationsbyuser/:userId', getLocationsByUserId);
router.get('/usersbylocation/:locationId', getUsersByLocationId);
router.put('/:id', protect, updateLocationUser);
router.delete('/:id', protect, deleteLocationUser);

export default router;
