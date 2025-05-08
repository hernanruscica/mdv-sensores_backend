import {pool} from '../config/database.js';

const Address = {
  create: async (addressData) => {
    const { calle, numero, localidad, partido, provincia, codigo_postal, latitud, longitud } = addressData;        
    const queryString = `
      INSERT INTO direcciones\
        (calle, numero, localidad, partido, provincia, codigo_postal, latitud, longitud, fecha_creacion)\
      VALUES\
        (?, ?, ?, ?, ?, ?, ?, ?, CURDATE());`;
    const [result] = await pool.query(queryString, [calle, numero, localidad, partido, provincia, codigo_postal, latitud, longitud]);
    return result.insertId;
  },
    findById: async (id) => {
        const queryString = 
          `SELECT *\             
            FROM direcciones\            
            WHERE direcciones.id = ?`;
        const [rows] = await pool.query(queryString, [id]);    
        return rows[0];
      },
      findAll: async () => {
        const queryString =         
        `SELECT * \
        FROM direcciones\
        `
        const [rows] = await pool.query(queryString);    
        return rows;
      },
      update: async (addressData) => {
        const { id, calle, numero, localidad, partido, provincia, codigo_postal, latitud, longitud } = addressData;
        
        const updateFields = [];
        const values = [];
    
        if (calle) { updateFields.push('calle = ?'); values.push(calle); }
        if (numero) { updateFields.push('numero = ?'); values.push(numero); }
        if (localidad) { updateFields.push('localidad = ?'); values.push(localidad); }
        if (partido) { updateFields.push('partido = ?'); values.push(partido); }
        if (provincia) { updateFields.push('provincia = ?'); values.push(provincia); }
        if (codigo_postal) { updateFields.push('codigo_postal = ?'); values.push(codigo_postal); }
        if (latitud) { updateFields.push('latitud = ?'); values.push(latitud); }
        if (longitud) { updateFields.push('longitud = ?'); values.push(longitud); }
    
        values.push(id);
    
        const query = `UPDATE direcciones SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
    
      // Método para eliminar una ubicacion
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM direcciones WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default Address;