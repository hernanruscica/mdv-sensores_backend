import express from 'express';
import { registerUser, loginUser, getAllUsers, getUserById, getAllUsersByUser,  updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/users
router.post('/login', loginUser);
router.post('/', protect, registerUser);
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.get('/byuser/:userId', getAllUsersByUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;
