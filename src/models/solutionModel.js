import {pool} from '../config/database.js';

const Solution = {
    create: async (solutionData) => {
        const { nombre, descripcion, alarmas_logs_id, usuarios_id } = solutionData;
        const queryString = `
            INSERT INTO soluciones 
                (nombre, descripcion, alarmas_logs_id, usuarios_id, fecha_creacion)
            VALUES 
                (?, ?, ?, ?, CONVERT_TZ(CURRENT_TIMESTAMP(), '+00:00', '${process.env.UTC_LOCAL}'))`;
        
        const [result] = await pool.query(queryString, [nombre, descripcion, alarmas_logs_id, usuarios_id]);
        return result.insertId;
    },

    findByAlarmLogId: async (alarmLogId) => {
        const queryString = `
            SELECT soluciones.*, usuarios.nombre_1, usuarios.apellido_1
            FROM soluciones
            INNER JOIN usuarios ON soluciones.usuarios_id = usuarios.id
            WHERE soluciones.alarmas_logs_id = ?
            ORDER BY soluciones.fecha_creacion DESC`;
        
        const [rows] = await pool.query(queryString, [alarmLogId]);
        return rows;
    },

    findByUserId: async (userId) => {
        const queryString = `
            SELECT soluciones.*, alarmas_logs.mensaje as alarma_mensaje
            FROM soluciones
            INNER JOIN alarmas_logs ON soluciones.alarmas_logs_id = alarmas_logs.id
            WHERE soluciones.usuarios_id = ?
            ORDER BY soluciones.fecha_creacion DESC`;
        
        const [rows] = await pool.query(queryString, [userId]);
        return rows;
    }
};

export default Solution; 