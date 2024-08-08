import express from 'express';
import { registerChannel, getAllChannels, getChannelById, updateChannel, deleteChannel } from '../controllers/channelController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/Channel
router.post('/', protect, registerChannel);
router.get('/', protect, getAllChannels);
router.get('/:id', protect, getChannelById);
router.put('/:id', protect, updateChannel);
router.delete('/:id', protect, deleteChannel);

export default router;
