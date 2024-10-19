import express from 'express';
import { uploadImage, getImage } from '../controllers/imageController.js';
import { protect } from '../middlewares/authMiddleware.js';

// const upload = require('../middlewares/multerConfig');
import upload from '../middlewares/multerConfig.js';

//ruta base '/api/images'

const router = express.Router();
// Ruta para subir una imagen
router.post('/',  upload.single('image'), protect, uploadImage);

// Ruta opcional para acceder a una imagen
router.get('/:imageName', protect, getImage);

export default router;
