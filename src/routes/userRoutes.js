import express from 'express';
import { registerUser, loginUser, getAllUsers, getUserByDni } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
//      /api/users
router.post('/login', loginUser);
router.post('/register', protect, registerUser);
router.get('/all', protect, getAllUsers);
router.get('/:dni', protect, getUserByDni);

export default router;
