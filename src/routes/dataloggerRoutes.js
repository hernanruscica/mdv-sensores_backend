import express from 'express';
import { getDataloggerById, getAllDataloggers, getAllDataloggersByLocation, getAllDataloggersByUser, registerDatalogger, updateDatalogger, deleteDatalogger} from '../controllers/dataloggerController.js';
import { protect } from '../middlewares/authMiddleware.js';

import { uploadImage } from '../controllers/imageController.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();
//      /api/dataloggers
router.post('/', protect, registerDatalogger);
router.get('/', protect, getAllDataloggers);
router.get('/:id', protect, getDataloggerById);
router.get('/bylocation/:locationId', protect, getAllDataloggersByLocation)
router.get('/byuser/:userId', protect, getAllDataloggersByUser)

router.put('/:id', protect, upload.single('foto'), uploadImage, updateDatalogger);

router.delete('/:id', protect, deleteDatalogger);

export default router;
