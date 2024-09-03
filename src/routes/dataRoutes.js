import express from 'express';
import { getDataByTimePeriod, getPorcentagesOn } from '../controllers/dataController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/data
//router.post('/', protect, registerAddress);
router.get('/:table/:period', protect, getDataByTimePeriod);
router.get('/getporcentages/:tableName/:columnPrefix/:timePeriod/:rangePorcentage', protect, getPorcentagesOn);
//router.get('/:id', protect, getAddressById);
//router.put('/:id', protect, updateAddress);
//router.delete('/:id', protect, deleteAddress);

export default router;
