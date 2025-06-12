import {pool} from '../config/database.js';
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
      'SELECT usuarios.* \
      FROM usuarios \
      WHERE dni = ?';
    const [rows] = await pool.query(queryString, [dni]);    
    return rows[0];
  },
  findByEmail: async (email) => {
    const queryString = 
      'SELECT * \
      FROM usuarios \
      WHERE email = ?';
    const [rows] = await pool.query(queryString, [email]);    
    return rows[0];
  },
  findAll: async () => {
    const queryString = 
      `SELECT usuarios.id as id, 
            usuarios.nombre_1, 
            usuarios.nombre_2, 
            usuarios.apellido_1, 
            usuarios.apellido_2, 
            concat(usuarios.nombre_1, " ", usuarios.apellido_1) AS usuario_nom_apell,
            usuarios.email, 
            usuarios.telefono, 
            usuarios.estado, 
            usuarios.dni, 
            usuarios.foto, 
            usuarios.espropietario, 
            usuarios.fecha_creacion, 
            usuarios.direcciones_id,
            ubicaciones.id as ubicaciones_id,
            ubicaciones.nombre as ubicaciones_nombre, 
            ubicaciones.descripcion as ubicaciones_descripcion,
            ubicaciones.foto as ubicaciones_foto, 
            ubicaciones.telefono as ubicaciones_tel,
            usuarios_x_ubicaciones_x_roles.roles_id AS usuarios_roles_id,
            roles.nombre AS usuarios_nombre_rol            
      FROM usuarios
      INNER JOIN usuarios_x_ubicaciones_x_roles 
            ON usuarios.id = usuarios_x_ubicaciones_x_roles.usuarios_id
      INNER JOIN ubicaciones 
            ON ubicaciones.id = usuarios_x_ubicaciones_x_roles.ubicaciones_id
      INNER JOIN roles 
            ON roles.id = usuarios_x_ubicaciones_x_roles.roles_id`;
            
    const [rows] = await pool.query(queryString);    
    return rows;
  },

  create: async (userData) => {    
    try {
        const { nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, telefono, direcciones_id = 1 } = userData;    
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const queryString = 'INSERT INTO usuarios (nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, password, telefono, estado, fecha_creacion, direcciones_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURDATE(), ?)';
        
        const [result] = await pool.query(queryString, [
            nombre_1, nombre_2, apellido_1, apellido_2, 
            dni, foto, email, hashedPassword, telefono, direcciones_id
        ]);

        return {
            success: true,
            userId: result.insertId,
            message: 'Usuario creado exitosamente'
        };

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            // Verificar si el error es por email duplicado
            if (error.message.includes('email')) {
                return {
                    success: false,
                    error: 'DUPLICATE_EMAIL',
                    message: 'El email ya está registrado'
                };
            }
            // Otros casos de duplicación (por ejemplo, DNI)
            return {
                success: false,
                error: 'DUPLICATE_ENTRY',
                message: 'Datos duplicados'
            };
        }
        // Cualquier otro error
        throw error;
    }
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
