import express from 'express';
import { registerChannel, getAllChannels, getChannelById, getAllChannelsByDatalogger, getAllChannelsByUser, updateChannel, deleteChannel } from '../controllers/channelController.js';
import { protect } from '../middlewares/authMiddleware.js';

import { uploadImage } from '../controllers/imageController.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();
//      /api/Channel
router.post('/', protect, upload.single('foto'), uploadImage, registerChannel);
router.get('/', protect, getAllChannels);
router.get('/:id', protect, getChannelById);
router.get('/bydatalogger/:dataloggerId', getAllChannelsByDatalogger);
///api/channels/byuser/
router.get('/byuser/:userId', getAllChannelsByUser)
router.put('/:id', protect, upload.single('foto'), uploadImage, updateChannel);
router.delete('/:id', protect, deleteChannel);

export default router;
