import express from 'express';
import { registerChannel, getAllChannels, getChannelById, getAllChannelsByDatalogger, updateChannel, deleteChannel } from '../controllers/channelController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/Channel
router.post('/', protect, registerChannel);
router.get('/', protect, getAllChannels);
router.get('/:id', protect, getChannelById);
router.get('/bydatalogger/:dataloggerId', getAllChannelsByDatalogger);
router.put('/:id', protect, updateChannel);
router.delete('/:id', protect, deleteChannel);

export default router;
