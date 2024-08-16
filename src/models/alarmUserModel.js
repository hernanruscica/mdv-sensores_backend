import pool from '../config/database.js';

const AlarmUser = {
    findById: async (id) => {
        const queryString = 
          `SELECT *\             
            FROM alarmas_x_usuarios\            
            WHERE id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT * \
        FROM alarmas_x_usuarios\
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },      
      findUsersByAlarmId: async (alarmId) => {
        const queryString =         
          `SELECT usuarios.id, usuarios.email, usuarios.nombre_1, usuarios.apellido_1, usuarios.email, usuarios.telefono
            FROM alarmas_x_usuarios 
            INNER JOIN usuarios ON usuarios.id = alarmas_x_usuarios.usuario_id
            WHERE alarma_id = ?`
        const [rows] = await pool.query(queryString, alarmId);    
        return rows;
      },
      findAlarmsByUserId: async (userId) => {
        const queryString = 
         `SELECT alarmas_x_usuarios.usuario_id as usuario_id, canales.datalogger_id, alarmas.*
          FROM alarmas_x_usuarios
          INNER JOIN alarmas on alarmas.id = alarmas_x_usuarios.alarma_id
          INNER JOIN canales on alarmas.canal_id = canales.id
          WHERE alarmas_x_usuarios.usuario_id = ?;`
          const [rows] = await pool.query(queryString, userId);    
        return rows;
      },
      create: async (alarmUserData) => {
        const { alarma_id, usuario_id } = alarmUserData;  
        const queryStringIfExist = 
          `SELECT * FROM alarmas_x_usuarios 
           WHERE alarma_id = ? 
           AND usuario_id= ?`;
        const [rows] = await pool.query(queryStringIfExist, [alarma_id, usuario_id]);
        if (rows.length > 0){
          return -1;
        }
        const queryString = 
          `INSERT INTO alarmas_x_usuarios
            (alarma_id, usuario_id, fecha_creacion)
            VALUES
            (?, ?, CURRENT_TIMESTAMP());`;
        const [result] = await pool.query(queryString, [alarma_id, usuario_id]);
        return result.insertId;
      },
      update: async (alarmUserData) => {
        const { id, alarma_id, usuario_id  } = alarmUserData;
        const queryStringIfExist = 
          `SELECT * FROM alarmas_x_usuarios 
           WHERE alarma_id = ? 
           AND usuario_id= ?`;
        const [rows] = await pool.query(queryStringIfExist, [alarma_id, usuario_id]);
        if (rows.length > 0){
          return -1;
        }
        
        const updateFields = [];
        const values = [];
    
        if (alarma_id) { updateFields.push('alarma_id = ?'); values.push(alarma_id); }
        if (usuario_id) { updateFields.push('usuario_id = ?'); values.push(usuario_id); }
       
        values.push(id);
    
        const query = `UPDATE alarmas_x_usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM alarmas_x_usuarios WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default AlarmUser;