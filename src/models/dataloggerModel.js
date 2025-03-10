import {pool} from '../config/database.js';

const Datalogger = {
    findById: async (id) => {
        const queryString = 
            `SELECT dataloggers.*,\
            dataloggers_x_ubicacion.ubicaciones_id as ubicacion_id\
            FROM dataloggers_x_ubicacion\
            inner join dataloggers on dataloggers_x_ubicacion.datalogger_id = dataloggers.id\
            WHERE dataloggers.id  = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findByLocationId: async (locationId) => {
        const queryString = 
            `select dataloggers.*, dataloggers_x_ubicacion.ubicaciones_id as ubicacion_id
            from dataloggers
            inner join dataloggers_x_ubicacion on dataloggers.id = dataloggers_x_ubicacion.datalogger_id
            where dataloggers_x_ubicacion.ubicaciones_id = ? AND dataloggers.estado = 1`;
        const [rows] = await pool.query(queryString, [locationId]);            
        return rows;
      },
      findAll: async () => {
        const queryString =         
        `SELECT dataloggers.*, \
        dataloggers_x_ubicacion.ubicaciones_id as ubicacion_id\
        FROM dataloggers\
        INNER JOIN dataloggers_x_ubicacion\
        ON dataloggers_x_ubicacion.datalogger_id = dataloggers.id`
        const [rows] = await pool.query(queryString);    
        return rows;
      },
      create: async (dataloggerData) => {
        const { direccion_mac, nombre, descripcion, foto, nombre_tabla, ubicacion_id, estado } = dataloggerData;        
        const queryString = `
          INSERT INTO dataloggers
            (direccion_mac, nombre, descripcion, foto, nombre_tabla, estado, fecha_creacion)
          VALUES
            (?, ?, ?, ?, ?, ?, CURDATE());
        `;
    
        // Iniciar una transacción
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          
          //console.log(dataloggerData);
          // Insertar en la tabla dataloggers
          const [results] = await connection.query(queryString, [direccion_mac, nombre, descripcion, foto, nombre_tabla, estado]);
         // console.log('results', results);
          const dataloggerId = results.insertId;
          // Insertar en la tabla datalogger_x_ubicaciones
          const locationQuery = `
            INSERT INTO dataloggers_x_ubicacion
              (datalogger_id, ubicaciones_id, fecha_creacion)
            VALUES
              (?, ?, CURDATE());
          `;
          await connection.query(locationQuery, [dataloggerId, ubicacion_id]);
    
          // Confirmar la transacción
          await connection.commit();
          return dataloggerId;
        } catch (error) {
          // En caso de error, revertir la transacción
          await connection.rollback();
          // Verificar si el error es debido a la restricción única
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(error);
            throw new Error('El datalogger ya está asignado a una ubicación');
          } else {
            throw error;
        }
      } finally {
          connection.release();
        }
      },
      update: async (dataLoggerData) => {
        const { id, direccion_mac, nombre, descripcion, foto, nombre_tabla, estado } = dataLoggerData;
    
        const updateFields = [];
        const values = [];
    
        if (direccion_mac) { updateFields.push('direccion_mac = ?'); values.push(direccion_mac); }
        if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
        if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }
        if (foto) { updateFields.push('foto = ?'); values.push(foto); }
        if (nombre_tabla) { updateFields.push('nombre_tabla = ?'); values.push(nombre_tabla); }
        if (estado) { updateFields.push('estado = ?'); values.push(estado); }
    
        values.push(id);
    
        const query = `UPDATE dataloggers SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      // Método para eliminar un datalogger
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM dataloggers WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Datalogger;