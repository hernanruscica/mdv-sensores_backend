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
          `SELECT \
           CONVERT_TZ(alarmas_logs.fecha_disparo, '+00:00', '${process.env.UTC_LOCAL}') AS fecha_disparo,\
           CONVERT_TZ(alarmas_logs.fecha_vista, '+00:00', '${process.env.UTC_LOCAL}') AS fecha_vista,\
           alarmas_logs.id, alarmas_logs.alarma_id, alarmas_logs.usuario_id, alarmas_logs.canal_id,\
           alarmas_logs.variables_valores, alarmas_logs.disparada,\
           usuarios.nombre_1, usuarios.apellido_1, usuarios.email\
           FROM alarmas_logs 
           INNER JOIN usuarios 
           ON alarmas_logs.usuario_id = usuarios.id  
           WHERE canal_id = ?  
           ORDER BY fecha_disparo DESC;`
        const [rows] = await pool.query(queryString, channelId);    
        return rows;
      },
      //findAllAlarmLogsByAlarm
      findAllAlarmLogsByAlarm: async (alarmId) => {
        const queryString =         
          `SELECT \
           CONVERT_TZ(alarmas_logs.fecha_disparo, '+00:00', '${process.env.UTC_LOCAL}') AS fecha_disparo,\
           CONVERT_TZ(alarmas_logs.fecha_vista, '+00:00', '${process.env.UTC_LOCAL}') AS fecha_vista,\
           alarmas_logs.id, alarmas_logs.alarma_id, alarmas_logs.usuario_id, alarmas_logs.canal_id,\
           alarmas_logs.disparada, alarmas_logs.mensaje,\
           usuarios.nombre_1, usuarios.apellido_1, usuarios.email\
           FROM alarmas_logs 
           INNER JOIN usuarios 
           ON alarmas_logs.usuario_id = usuarios.id  
           WHERE alarma_id = ?  
           ORDER BY fecha_disparo DESC;`
        const [rows] = await pool.query(queryString, alarmId);    
        return rows;
      },
      create: async (alarmLogData) => {
        const { id, alarma_id, usuario_id, canal_id, mensaje, disparada, email_enviado } = alarmLogData;
        const query = 
          `INSERT INTO alarmas_logs
        (id, alarma_id, usuario_id, canal_id, mensaje, disparada, fecha_disparo, email_enviado)
        VALUES
        (?, ?, ?, ?, ?, ?, CONVERT_TZ(CURRENT_TIMESTAMP(), '+00:00', '${process.env.UTC_LOCAL}'), ?);`;
        const [result] = await pool.query(query, [id, alarma_id, usuario_id, canal_id, mensaje, disparada, email_enviado]);
        console.log('results on create alarmLogModel:', result);
        
        return result.affectedRows > 0 ? id : null;

        },    
      update: async (alarmLogData) => {
        const { id, alarma_id, usuario_id, canal_id, valor, fecha_vista, email_enviado  } = alarmLogData;        
        console.log('alarmLogData on update alarmLogModel:', alarmLogData);
        const updateFields = [];
        const values = [];
    
        if (alarma_id) { updateFields.push('alarma_id = ?'); values.push(alarma_id); }
        //if (usuario_id) { updateFields.push('usuario_id = ?'); values.push(usuario_id); }
        if (canal_id) { updateFields.push('canal_id = ?'); values.push(canal_id); }
        if (valor) { updateFields.push('valor = ?'); values.push(valor); }
        if (fecha_vista) { updateFields.push('fecha_vista = ?'); values.push(fecha_vista); }
        if (email_enviado) { updateFields.push('email_enviado = ?'); values.push(email_enviado); }
       
        values.push(id);
        values.push(usuario_id);

        console.log('updateFields:', updateFields);
        console.log('values:', values);
    
        const query = `UPDATE alarmas_logs SET ${updateFields.join(', ')} WHERE id = ? AND usuario_id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM alarmas_logs WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default AlarmLog;