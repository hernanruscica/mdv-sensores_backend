import express from 'express';
import { getDataloggerById, getAllDataloggers, getAllDataloggersByLocation, registerDatalogger, updateDatalogger, deleteDatalogger} from '../controllers/dataloggerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/dataloggers
router.post('/', protect, registerDatalogger);
router.get('/', protect, getAllDataloggers);
router.get('/:id', protect, getDataloggerById);
router.get('/bylocation/:locationId', protect, getAllDataloggersByLocation)
router.put('/:id', protect, updateDatalogger);
router.delete('/:id', protect, deleteDatalogger);

export default router;
