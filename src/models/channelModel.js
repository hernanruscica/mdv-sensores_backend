import {pool} from '../config/database.js';

const Channel = {
    findById: async (id) => {
        const queryString = 
          `SELECT canales.*,\       
            dataloggers.nombre as datalogger_nombre, dataloggers.id as datalogger_id, dataloggers.nombre_tabla as datalogger_nombre_tabla\      
          FROM canales\           
          INNER JOIN dataloggers ON dataloggers.id = canales.datalogger_id\          
          WHERE canales.id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT * \
        FROM canales\
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },
      findByDataloggerId: async (dataloggerId) => {
        const queryString = 
            `SELECT canales.id as canal_id, 
              dataloggers.nombre_tabla,
              canales.nombre_columna, 
              canales.nombre as canal_nombre, 
              canales.descripcion as canal_descripcion,
              canales.multiplicador,
              canales.tiempo_a_promediar,
              canales.datalogger_id,
              canales.foto,
              canales.fecha_creacion,
              dataloggers_x_ubicacion.ubicaciones_id
            FROM canales
            INNER JOIN dataloggers_x_ubicacion ON dataloggers_x_ubicacion.datalogger_id = canales.datalogger_id\
            INNER JOIN dataloggers ON dataloggers_x_ubicacion.datalogger_id = dataloggers.id
            WHERE canales.datalogger_id = ?`;
        const [rows] = await pool.query(queryString, [dataloggerId]);    
        return rows;
      },      
      create: async (channelData) => {
        const { datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador } = channelData;        
        const queryString = `
          INSERT INTO canales\
            (datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, multiplicador, foto, fecha_creacion)\
          VALUES\
            (?, ?, ?, ?, ?, ?, CURDATE(), ?);`;
        const [result] = await pool.query(queryString, [datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador]);
        return result.insertId;
      },
      update: async (addressData) => {
        const { id, datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador } = addressData;
        
        const updateFields = [];
        const values = [];
    
        if (datalogger_id) { updateFields.push('datalogger_id = ?'); values.push(datalogger_id); }
        if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
        if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }
        if (nombre_columna) { updateFields.push('nombre_columna = ?'); values.push(nombre_columna); }
        if (tiempo_a_promediar) { updateFields.push('tiempo_a_promediar = ?'); values.push(tiempo_a_promediar); }
        if (foto) { updateFields.push('foto = ?'); values.push(foto); }
        if (multiplicador) { updateFields.push('multiplicador = ?'); values.push(multiplicador); }        
    
        values.push(id);
    
        const query = `UPDATE canales SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      // Método para eliminar una ubicacion
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM canales WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Channel;