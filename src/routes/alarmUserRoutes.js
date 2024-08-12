import express from 'express';
import { registerAlarmUser, getAllAlarmUser, getAlarmUserById, getUsersByAlarmId, updateAlarmUser, deleteAlarmUser } from '../controllers/alarmUserController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/alarmsusers
router.post('/', protect, registerAlarmUser);
router.get('/', protect, getAllAlarmUser);
router.get('/:id', protect, getAlarmUserById);
router.get('/usersbyalarm/:alarmId', getUsersByAlarmId);
router.put('/:id', protect, updateAlarmUser);
router.delete('/:id', protect, deleteAlarmUser);

export default router;
