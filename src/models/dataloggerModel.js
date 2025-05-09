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
        const connection = await pool.getConnection();
        
        try {
          await connection.beginTransaction();
          
          // Verificar si el datalogger ya existe
          const [existing] = await connection.query(
            'SELECT id FROM dataloggers WHERE direccion_mac = ?',
            [direccion_mac]
          );
    
          if (existing.length > 0) {
            await connection.rollback();
            return {
              success: false,
              message: 'El datalogger ya está registrado',
              error: 'DUPLICATE_ENTRY',
              datalogger: null
            };
          }
    
          // Insertar en la tabla dataloggers
          const [results] = await connection.query(
            `INSERT INTO dataloggers
              (direccion_mac, nombre, descripcion, foto, nombre_tabla, estado, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, '1', CURDATE())`,
            [direccion_mac, nombre, descripcion, foto, nombre_tabla]
          );
    
          const dataloggerId = results.insertId;
    
          // Insertar en la tabla datalogger_x_ubicaciones
          await connection.query(
            `INSERT INTO dataloggers_x_ubicacion
              (datalogger_id, ubicaciones_id, fecha_creacion)
            VALUES (?, ?, CURDATE())`,
            [dataloggerId, ubicacion_id]
          );
    
          await connection.commit();
    
          // Obtener el datalogger recién creado
          const [newDatalogger] = await connection.query(
            `SELECT d.*, dx.ubicaciones_id as ubicacion_id
             FROM dataloggers d
             JOIN dataloggers_x_ubicacion dx ON d.id = dx.datalogger_id
             WHERE d.id = ?`,
            [dataloggerId]
          );
    
          return {
            success: true,
            message: 'Datalogger creado exitosamente',
            datalogger: newDatalogger[0]
          };
    
        } catch (error) {
          await connection.rollback();
          if (error.code === 'ER_DUP_ENTRY') {
            return {
              success: false,
              message: 'El datalogger ya está asignado a una ubicación',
              error: 'DUPLICATE_LOCATION',
              datalogger: null
            };
          }
          throw error;
        } finally {
          connection.release();
        }
      },
      update: async (dataLoggerData) => {
        const { id, direccion_mac, nombre, descripcion, foto, nombre_tabla, ubicacion_id, estado } = dataLoggerData;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Verificar si el datalogger existe
            const [existing] = await connection.query(
                'SELECT * FROM dataloggers WHERE id = ?',
                [id]
            );

            if (existing.length === 0) {
                await connection.rollback();
                return {
                    success: false,
                    message: 'Datalogger no encontrado',
                    error: 'NOT_FOUND',
                    datalogger: null
                };
            }

            // Si se proporciona ubicacion_id, manejar la actualización de ubicación
            if (ubicacion_id) {
                // Verificar si ya existe una asociación para este datalogger
                const [currentLocation] = await connection.query(
                    'SELECT id, ubicaciones_id FROM dataloggers_x_ubicacion WHERE datalogger_id = ?',
                    [id]
                );

                if (currentLocation.length > 0) {
                    if (currentLocation[0].ubicaciones_id === ubicacion_id) {
                        // Si es la misma ubicación, no hacer nada
                    } else {
                        // Actualizar la ubicación existente
                        await connection.query(
                            'UPDATE dataloggers_x_ubicacion SET ubicaciones_id = ? WHERE datalogger_id = ?',
                            [ubicacion_id, id]
                        );
                    }
                } else {
                    // Crear nueva asociación
                    await connection.query(
                        'INSERT INTO dataloggers_x_ubicacion (datalogger_id, ubicaciones_id, fecha_creacion) VALUES (?, ?, CURDATE())',
                        [id, ubicacion_id]
                    );
                }
            }

            const updateFields = [];
            const values = [];

            if (direccion_mac) {
                const [macExists] = await connection.query(
                    'SELECT id FROM dataloggers WHERE direccion_mac = ? AND id != ?',
                    [direccion_mac, id]
                );

                if (macExists.length > 0) {
                    await connection.rollback();
                    return {
                        success: false,
                        message: 'La dirección MAC ya está registrada en otro datalogger',
                        error: 'DUPLICATE_MAC',
                        datalogger: null
                    };
                }
                updateFields.push('direccion_mac = ?');
                values.push(direccion_mac);
            }

            if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
            if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }
            if (foto) { updateFields.push('foto = ?'); values.push(foto); }
            if (nombre_tabla) { updateFields.push('nombre_tabla = ?'); values.push(nombre_tabla); }            
            if (estado !== undefined) { updateFields.push('estado = ?'); values.push(estado); }

            values.push(id);

            if (updateFields.length === 0 && !ubicacion_id) {
                await connection.rollback();
                return {
                    success: false,
                    message: 'No se proporcionaron campos para actualizar',
                    error: 'NO_FIELDS',
                    datalogger: existing[0]
                };
            }

            if (updateFields.length > 0) {
                const query = `UPDATE dataloggers SET ${updateFields.join(', ')} WHERE id = ?`;
                await connection.query(query, values);
            }

            // Obtener el datalogger actualizado con su ubicación
            const [updatedDatalogger] = await connection.query(
                `SELECT d.*, dx.ubicaciones_id as ubicacion_id
                 FROM dataloggers d
                 JOIN dataloggers_x_ubicacion dx ON d.id = dx.datalogger_id
                 WHERE d.id = ?`,
                [id]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Datalogger actualizado exitosamente',
                datalogger: updatedDatalogger[0]
            };

        } catch (error) {
            await connection.rollback();
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'Error de duplicación en la actualización',
                    error: 'DUPLICATE_ENTRY',
                    datalogger: null
                };
            }
            throw error;
        } finally {
            connection.release();
        }
      },
    
      // Método para eliminar un datalogger
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM dataloggers WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Datalogger;