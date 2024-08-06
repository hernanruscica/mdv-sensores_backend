import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
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
  }
};

export default User;
