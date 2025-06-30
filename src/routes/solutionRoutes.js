import express from 'express';
import { createSolution, getSolutionsByAlarmLogId, getSolutionsByUserId } from '../controllers/solutionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Crear una nueva solución
router.post('/', protect, createSolution);

// Obtener soluciones por ID de alarma_log
router.get('/byalarmlog/:id', protect, getSolutionsByAlarmLogId);

// Obtener soluciones por ID de usuario
router.get('/byuser/:id', protect, getSolutionsByUserId);

export default router; 