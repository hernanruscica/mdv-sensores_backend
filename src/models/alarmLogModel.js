import {pool} from '../config/database.js';

const AlarmLog = {
    findById: async (id) => {
        const queryString = 
          `SELECT *\             
            FROM alarmas_logs\            
            WHERE id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT * \
        FROM alarmas_logs\
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },      
      findAllAlarmLogsByUser: async (userId) => {
        const queryString =         
          `SELECT *
            FROM alarmas_logs             
            WHERE usuario_id = ?`
        const [rows] = await pool.query(queryString, userId);    
        return rows;
      },
      findAllAlarmLogsByChannel: async (channelId) => {
        const queryString =         
          `SELECT alarmas_logs.*, usuarios.nombre_1, usuarios.apellido_1, usuarios.email\
           FROM alarmas_logs 
           INNER JOIN usuarios 
           ON alarmas_logs.usuario_id = usuarios.id  
           WHERE canal_id = ?  
           ORDER BY fecha_disparo DESC;`
        const [rows] = await pool.query(queryString, channelId);    
        return rows;
      },
      create: async (alarmUserData) => {
        const { alarma_id, usuario_id, canal_id, variables } = alarmUserData;  
        const query = 
          `insert into alarmas_logs
            (alarma_id, usuario_id, canal_id, variables_valores, fecha_disparo)
            values
            (?, ?, ?, ?, CURRENT_TIMESTAMP());`;
        const [result] = await pool.query(query, [alarma_id, usuario_id, canal_id, variables]);
        return result.insertId;
      },
      update: async (alarmUserData) => {
        const { id, alarma_id, usuario_id, canal_id, valor, fecha_vista  } = alarmUserData;        
        
        const updateFields = [];
        const values = [];
    
        if (alarma_id) { updateFields.push('alarma_id = ?'); values.push(alarma_id); }
        if (usuario_id) { updateFields.push('usuario_id = ?'); values.push(usuario_id); }
        if (canal_id) { updateFields.push('canal_id = ?'); values.push(canal_id); }
        if (valor) { updateFields.push('valor = ?'); values.push(valor); }
        if (fecha_vista) { updateFields.push('fecha_vista = ?'); values.push(fecha_vista); }
       
        values.push(id);
    
        const query = `UPDATE alarmas_logs SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM alarmas_logs WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default AlarmLog;