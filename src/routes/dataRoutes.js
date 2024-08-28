import express from 'express';
import { getDataByTimePeriod } from '../controllers/dataController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/data
//router.post('/', protect, registerAddress);
router.get('/', protect, getDataByTimePeriod);
//router.get('/:id', protect, getAddressById);
//router.put('/:id', protect, updateAddress);
//router.delete('/:id', protect, deleteAddress);

export default router;
