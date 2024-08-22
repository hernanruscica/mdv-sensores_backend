import express from 'express';
import { registerAlarm, getAllAlarms, getAlarmById, getAlarmsByLocationId, updateAlarm, deleteAlarm } from '../controllers/alarmController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/alarms
router.post('/', protect, registerAlarm);
router.get('/', protect, getAllAlarms);
router.get('/:id', protect, getAlarmById);
router.get('/bylocation/:id', getAlarmsByLocationId)
router.put('/:id', protect, updateAlarm);
router.delete('/:id', protect, deleteAlarm);

export default router;
