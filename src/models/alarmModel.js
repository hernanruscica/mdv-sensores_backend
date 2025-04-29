import {pool} from '../config/database.js';

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
        `SELECT alarmas.*, \
          canales.id as canal_id,\
          dataloggers.id as datalogger_id\
        FROM alarmas\
        INNER JOIN canales ON alarmas.canal_id = canales.id
        INNER JOIN dataloggers ON canales.datalogger_id = dataloggers.id
        WHERE alarmas.estado = 1;
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },
      findAllByLocationId: async (id) => {
        const queryString = 
        `SELECT DISTINCT
            alarmas.id AS id,
            alarmas.nombre,
            alarmas.descripcion,
            alarmas.tabla,
            alarmas.columna,
            alarmas.nombre_variables,
            alarmas.condicion,
            alarmas.periodo_tiempo,
            alarmas.estado,
            alarmas.tipo_alarma,
            alarmas.fecha_creacion,
            alarmas.disparada,
            alarmas.canal_id,
            canales.datalogger_id
        FROM alarmas
        JOIN canales ON alarmas.canal_id = canales.id
        JOIN dataloggers_x_ubicacion ON canales.datalogger_id = dataloggers_x_ubicacion.datalogger_id
        WHERE dataloggers_x_ubicacion.ubicaciones_id = ?
        AND alarmas.estado = 1
        ORDER BY alarmas.id`;

        const [rows] = await pool.query(queryString, id);    
        return rows;
      },
      create: async (alarmData) => {
        //canal_id, tabla, columna, nombre, descripcion, nombre_variables, condicion, periodo_tiempo, estado
        const { canal_id, tabla, columna, nombre, descripcion, nombre_variables, condicion, periodo_tiempo, estado, tipo_alarma } = alarmData;        
        const queryString = `
          INSERT INTO alarmas\
            (canal_id, tabla, columna, nombre, descripcion, nombre_variables, condicion, periodo_tiempo, estado, tipo_alarma, fecha_creacion)\
          VALUES\
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE());`;
        const [result] = await pool.query(queryString, [canal_id, tabla, columna, nombre, descripcion, nombre_variables, condicion, periodo_tiempo, estado, tipo_alarma]);
        return result.insertId;
      },
      update: async (alarmData) => {
        const { id, canal_id, tabla, columna, nombre, descripcion, nombre_variables, condicion, periodo_tiempo, estado, tipo_alarma } = alarmData;
        
        const updateFields = [];
        const values = [];
    
        if (canal_id) { updateFields.push('canal_id = ?'); values.push(canal_id); }
        if (tabla) { updateFields.push('tabla = ?'); values.push(tabla); }
        if (columna) { updateFields.push('columna = ?'); values.push(columna); }
        if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
        if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }        
        if (periodo_tiempo) { updateFields.push('periodo_tiempo = ?'); values.push(periodo_tiempo); }
        if (estado) { updateFields.push('estado = ?'); values.push(estado); } 
        if (tipo_alarma) { updateFields.push('tipo_alarma = ?'); values.push(tipo_alarma); } 
        if (nombre_variables) { updateFields.push('nombre_variables = ?'); values.push(nombre_variables); } 
        if (condicion) { updateFields.push('condicion = ?'); values.push(condicion); } 
    
        values.push(id);
    
        const query = `UPDATE alarmas SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
      updateTrigger: async (id, triggerValue) => {
        const query = 'UPDATE alarmas SET disparada = ? WHERE id = ?';
        const [result] = await pool.query(query, [triggerValue, id]);
        return result.affectedRows;
      },
    
      // Método para eliminar una ubicacion
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM alarmas WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Alarm;