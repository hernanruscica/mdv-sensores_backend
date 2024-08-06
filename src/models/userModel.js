import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
  findById: async (id) => {
    const queryString = 
      'SELECT * \
      FROM usuarios \
      WHERE id = ?';
    const [rows] = await pool.query(queryString, [id]);    
    return rows[0];
  },
  findByDni: async (dni) => {
    const queryString = 
      'SELECT * \
      FROM usuarios \
      WHERE dni = ?';
    const [rows] = await pool.query(queryString, [dni]);    
    return rows[0];
  },
  findAll: async () => {
    const queryString = 
      'SELECT * \
      FROM usuarios';
    const [rows] = await pool.query(queryString);    
    return rows;
  },

  create: async (userData) => {
    const { nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, password, telefono, estado, direcciones_id } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const queryString = 
      'INSERT INTO usuarios \
      (nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, password, telefono, estado, fecha_creacion, direcciones_id)\
       VALUES\
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  CURDATE(), ?)'
    const [result] = await pool.query(queryString, [nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, hashedPassword, telefono, estado, direcciones_id]);
    return result.insertId;
  },

  update: async (userData) => {
    const { id, nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, telefono, estado, espropietario, password, direcciones_id } = userData;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const updateFields = [];
    const values = [];

    if (nombre_1) { updateFields.push('nombre_1 = ?'); values.push(nombre_1); }
    if (nombre_2) { updateFields.push('nombre_2 = ?'); values.push(nombre_2); }
    if (apellido_1) { updateFields.push('apellido_1 = ?'); values.push(apellido_1); }
    if (apellido_2) { updateFields.push('apellido_2 = ?'); values.push(apellido_2); }
    if (dni) { updateFields.push('dni = ?'); values.push(dni); }
    if (foto) { updateFields.push('foto = ?'); values.push(foto); }
    if (email) { updateFields.push('email = ?'); values.push(email); }
    if (telefono) { updateFields.push('telefono = ?'); values.push(telefono); }
    if (estado !== undefined) { updateFields.push('estado = ?'); values.push(estado); }
    if (espropietario !== undefined) { updateFields.push('espropietario = ?'); values.push(espropietario); }
    if (hashedPassword) { updateFields.push('password = ?'); values.push(hashedPassword); }
    if (direcciones_id) { updateFields.push('direcciones_id = ?'); values.push(direcciones_id); }

    values.push(id);

    const query = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, values);
    
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

export default User;
