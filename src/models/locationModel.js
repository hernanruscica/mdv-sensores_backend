import {pool} from '../config/database.js';

const Location = {
    findById: async (id) => {
        const queryString = 
          `SELECT ubicaciones.id, ubicaciones.nombre, ubicaciones.descripcion, ubicaciones.telefono, ubicaciones.email, ubicaciones.foto, ubicaciones.direcciones_id,\ 
            direcciones.calle, direcciones.numero, direcciones.localidad, direcciones.partido, direcciones.provincia\
            FROM ubicaciones 
            INNER JOIN direcciones ON ubicaciones.direcciones_id = direcciones.id
            WHERE ubicaciones.id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT * \
        FROM ubicaciones\
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },
      create: async (locationData) => {
        const { nombre, descripcion, foto, telefono, email, direcciones_id } = locationData;        
        const queryString = `
          INSERT INTO ubicaciones
            (nombre, descripcion, foto, telefono, email, fecha_creacion, direcciones_id)
          VALUES
            (?, ?, ?, ?, ?, CURDATE(), ?);
        `;
        const [result] = await pool.query(queryString, [nombre, descripcion, foto, telefono, email, direcciones_id]);
        return result.insertId;
      },
      update: async (locationData) => {
        const { nombre, descripcion, telefono, foto, email, id } = locationData;
    
        const updateFields = [];
        const values = [];
    
        if (nombre) { updateFields.push('nombre = ?'); values.push(nombre); }
        if (descripcion) { updateFields.push('descripcion = ?'); values.push(descripcion); }
        if (telefono) { updateFields.push('telefono = ?'); values.push(telefono); }
        if (foto) { updateFields.push('foto = ?'); values.push(foto); }
        if (email) { updateFields.push('email = ?'); values.push(email); }
    
        values.push(id);
    
        const query = `UPDATE ubicaciones SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      // Método para eliminar una ubicacion
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM ubicaciones WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Location;