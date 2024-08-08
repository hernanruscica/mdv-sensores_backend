import pool from '../config/database.js';

const Alarm = {
    findById: async (id) => {
        const queryString = 
          `SELECT *\             
            FROM alarmas\            
            WHERE alarmas.id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT * \
        FROM alarmas\
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },
      create: async (alarmData) => {
        const { canal_id, tabla, columna, nombre, descripcion, max, min, periodo_tiempo, estado } = alarmData;        
        const queryString = `
          INSERT INTO alarmas\
            (canal_id, tabla, columna, nombre, descripcion, max, min, periodo_tiempo, estado, fecha_creacion)\
          VALUES\
            (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE());`;
        const [result] = await pool.query(queryString, [canal_id, tabla, columna, nombre, descripcion, max, min, periodo_tiempo, estado]);
        return result.insertId;
      },
      update: async (alarmData) => {
        const { id, canal_id, tabla, columna, nombre, descripcion, max, min, periodo_tiempo, estado } = alarmData;
        
        const updateFields = [];
        const values = [];
    
        if (canal_id) { updateFields.push('canal_id = ?'); values.push(canal_id); }
        if (tabla) { updateFields.push('tabla = ?'); values.push(tabla); }
        if (columna) { updateFields.push('columna = ?'); values.push(columna); }
        if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
        if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }
        if (max) { updateFields.push('max = ?'); values.push(max); }
        if (min) { updateFields.push('min = ?'); values.push(min); }
        if (periodo_tiempo) { updateFields.push('periodo_tiempo = ?'); values.push(periodo_tiempo); }
        if (estado) { updateFields.push('estado = ?'); values.push(estado); }
    
        values.push(id);
    
        const query = `UPDATE alarmas SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      // Método para eliminar una ubicacion
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM alarmas WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Alarm;