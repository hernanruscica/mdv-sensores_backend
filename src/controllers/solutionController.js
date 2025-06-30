import Solution from '../models/solutionModel.js';

export const createSolution = async (req, res, next) => {
    try {
        const solutionData = req.body;
        
        const solutionId = await Solution.create(solutionData);
        
        if (!solutionId) {
            return res.status(400).json({
                success: false,
                message: 'Error al crear la solución'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Solución creada exitosamente',
            solution: {
                id: solutionId,
                ...solutionData
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getSolutionsByAlarmLogId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const solutions = await Solution.findByAlarmLogId(id);

        if (!solutions?.length) {
            return res.status(200).json({
                success: true,
                message: 'No se encontraron soluciones para esta alarma',
                solutions: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Soluciones encontradas',
            count: solutions.length,
            solutions
        });
    } catch (error) {
        next(error);
    }
};

export const getSolutionsByUserId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const solutions = await Solution.findByUserId(id);

        if (!solutions?.length) {
            return res.status(200).json({
                success: true,
                message: 'No se encontraron soluciones para este usuario',
                solutions: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Soluciones encontradas',
            count: solutions.length,
            solutions
        });
    } catch (error) {
        next(error);
    }
}; 