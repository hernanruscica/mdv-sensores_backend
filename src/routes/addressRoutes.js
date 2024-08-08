import express from 'express';
import { registerAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress } from '../controllers/addressController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/address
router.post('/', protect, registerAddress);
router.get('/', protect, getAllAddresses);
router.get('/:id', protect, getAddressById);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);

export default router;
