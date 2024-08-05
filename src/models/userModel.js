import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    return rows[0];
  },

  create: async (userData) => {
    const { email, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
    return result.insertId;
  }
};

export default User;
