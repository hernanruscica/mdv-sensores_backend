import express from 'express';
import { registerAlarmLog, getAllAlarmLogs, updateAlarmLog, deleteAlarmLog, getAlarmLogById, getAlarmLogsByUserId, getAlarmLogsByChannelId  } from '../controllers/alarmLogController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/alarmlogs
router.post('/', protect, registerAlarmLog);
router.get('/', protect, getAllAlarmLogs);
router.get('/:id', protect, getAlarmLogById);
router.get('/byuser/:userId', getAlarmLogsByUserId);
router.get('/bychannel/:channelId', getAlarmLogsByChannelId)
router.put('/:id', protect, updateAlarmLog);
router.delete('/:id', protect, deleteAlarmLog);

export default router;
