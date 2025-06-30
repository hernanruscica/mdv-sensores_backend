import express from 'express';
import { registerUser, activateUser, sendActivationEmail, loginUser, getAllUsers, getUserById, getAllUsersByUser,  updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

import {uploadImage} from '../controllers/imageController.js';
import {upload} from '../middlewares/uploadMiddleware.js';

const router = express.Router();
//      /api/users
router.post('/login', loginUser);
router.post('/', protect, upload.single('foto'), uploadImage, registerUser);
router.get('/activate/:token', activateUser);
router.get('/sendactivation/:email', sendActivationEmail);
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.get('/byuser/:userId', getAllUsersByUser);

router.put('/:id', protect, upload.single('foto'), uploadImage, updateUser);

router.delete('/:id', protect, deleteUser);

export default router;
