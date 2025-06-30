import {pool} from '../config/database.js';

const Alarm = {
    findById: async (id) => {
        const queryString = 
          `SELECT * FROM alarmas WHERE alarmas.id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT alarmas.*, 
          canales.id as canal_id,
          dataloggers.id as datalogger_id
        FROM alarmas
        INNER JOIN canales ON alarmas.canal_id = canales.id
        INNER JOIN dataloggers ON canales.datalogger_id = dataloggers.id
        WHERE alarmas.estado = 1;`
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
            alarmas.variable01, alarmas.variable02, alarmas.variable03, alarmas.variable04, alarmas.variable05, alarmas.variable06,
            alarmas.condicion,
            alarmas.condicion_mostrar,
            alarmas.periodo_tiempo,
            alarmas.estado,
            alarmas.tipo_alarma,
            alarmas.fecha_creacion,
            alarmas.disparada,
            alarmas.canal_id,
            alarmas.datalogger_id,
            canales.datalogger_id as canal_datalogger_id,
            canales.nombre AS canal_nombre
        FROM alarmas
        JOIN canales ON alarmas.canal_id = canales.id
        JOIN dataloggers_x_ubicacion ON canales.datalogger_id = dataloggers_x_ubicacion.datalogger_id
        WHERE dataloggers_x_ubicacion.ubicaciones_id = ?        
        ORDER BY alarmas.id`;

        const [rows] = await pool.query(queryString, id);    
        return rows;
      },
      findAllByChannelId: async (channelId) => {
        const queryString = 
        `SELECT DISTINCT
            alarmas.id AS id,
            alarmas.nombre,
            alarmas.descripcion,
            alarmas.tabla,
            alarmas.columna,
            alarmas.variable01, alarmas.variable02, alarmas.variable03, alarmas.variable04, alarmas.variable05, alarmas.variable06,
            alarmas.condicion,
            alarmas.condicion_mostrar,
            alarmas.periodo_tiempo,
            alarmas.estado,
            alarmas.tipo_alarma,
            alarmas.fecha_creacion,
            alarmas.disparada,
            alarmas.canal_id,
            alarmas.datalogger_id,
            canales.datalogger_id as canal_datalogger_id,
            canales.nombre AS canal_nombre
        FROM alarmas
        JOIN canales ON alarmas.canal_id = canales.id
        WHERE alarmas.canal_id = ?
        ORDER BY alarmas.id`;

        const [rows] = await pool.query(queryString, channelId);    
        return rows;
    },
      create: async (alarmData) => {       
        const { canal_id, datalogger_id, tabla, columna, nombre, descripcion,
          variable01, variable02, variable03, variable04, variable05, variable06, 
          condicion, condicion_mostrar, periodo_tiempo, tipo_alarma } = alarmData;        
        const queryString = `
          INSERT INTO alarmas
            (canal_id, datalogger_id, tabla, columna, nombre, descripcion,
            variable01, variable02, variable03, variable04, variable05, variable06,
            condicion, condicion_mostrar, periodo_tiempo, estado, tipo_alarma, fecha_creacion)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, CURDATE());`;
        const [result] = await pool.query(queryString, [canal_id, datalogger_id, tabla, columna, nombre, descripcion, 
          variable01, variable02, variable03, variable04, variable05, variable06, condicion, condicion_mostrar, periodo_tiempo, tipo_alarma]);
        return result.insertId;
      },
      update: async (alarmData) => {
        const { id, canal_id, datalogger_id, tabla, columna, nombre, descripcion,
          variable01, variable02, variable03, variable04, variable05, variable06, 
          condicion, condicion_mostrar, periodo_tiempo, estado, tipo_alarma } = alarmData;
        
        const updateFields = [];
        const values = [];
    
        if (canal_id) { updateFields.push('canal_id = ?'); values.push(canal_id); }
        if (datalogger_id) { updateFields.push('datalogger_id = ?'); values.push(datalogger_id); }
        if (tabla) { updateFields.push('tabla = ?'); values.push(tabla); }
        if (columna) { updateFields.push('columna = ?'); values.push(columna); }
        if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
        if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }        
        if (periodo_tiempo) { updateFields.push('periodo_tiempo = ?'); values.push(periodo_tiempo); }
        if (estado) { updateFields.push('estado = ?'); values.push(estado); } 
        if (tipo_alarma) { updateFields.push('tipo_alarma = ?'); values.push(tipo_alarma); }         
        if (variable01) { updateFields.push('variable01 = ?'); values.push(variable01); } 
        if (variable02) { updateFields.push('variable02 = ?'); values.push(variable02); } 
        if (variable03) { updateFields.push('variable03 = ?'); values.push(variable03); } 
        if (variable04) { updateFields.push('variable04 = ?'); values.push(variable04); } 
        if (variable05) { updateFields.push('variable05 = ?'); values.push(variable05); } 
        if (variable06) { updateFields.push('variable06 = ?'); values.push(variable06); } 
        if (condicion) { updateFields.push('condicion = ?'); values.push(condicion); } 
        if (condicion_mostrar) { updateFields.push('condicion_mostrar = ?'); values.push(condicion_mostrar); } 
    
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
    
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM alarmas WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Alarm;