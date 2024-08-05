import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerUser);
router.post('/login', loginUser);

export default router;
