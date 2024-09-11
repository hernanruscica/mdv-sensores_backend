import express from 'express';
import { getDataByTimePeriod, getPorcentagesOn, getAnalogData } from '../controllers/dataController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/data
router.get('/:table/:period', protect, getDataByTimePeriod);
router.get('/getporcentages/:tableName/:columnPrefix/:timePeriod/:rangePorcentage', protect, getPorcentagesOn);
router.get('/getanalog/:tableName/:columnPrefix/:timePeriod', protect, getAnalogData);

export default router;
