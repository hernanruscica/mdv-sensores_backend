import pool from '../config/database.js';

const LocationUser = {
     findById: async (id) => {
         const queryString = 
           `SELECT usuarios_x_ubicaciones_x_roles.id,\
            ubicaciones.id as ubicaciones_id,ubicaciones.nombre as ubicaciones_nombre, ubicaciones.descripcion as ubicaciones_descripcion,\
            ubicaciones.foto as ubicaciones_foto, ubicaciones.telefono as ubicaciones_tel,\
            usuarios_x_ubicaciones_x_roles.usuarios_id AS usuarios_id, usuarios_x_ubicaciones_x_roles.roles_id AS usuarios_roles_id,\
            roles.nombre AS usuarios_nombre_rol\
            FROM ubicaciones\
            INNER JOIN usuarios_x_ubicaciones_x_roles ON ubicaciones.id = usuarios_x_ubicaciones_x_roles.ubicaciones_id\ 
            INNER JOIN roles ON roles_id = roles.id\
            WHERE usuarios_x_ubicaciones_x_roles.id = ?;`;
         const [rows] = await pool.query(queryString, [id]);    
         return rows[0];
       },
       findAll: async () => {
         const queryString =         
         `SELECT usuarios_x_ubicaciones_x_roles.id,\
            ubicaciones.id as ubicaciones_id,ubicaciones.nombre as ubicaciones_nombre, ubicaciones.descripcion as ubicaciones_descripcion,\
            ubicaciones.foto as ubicaciones_foto, ubicaciones.telefono as ubicaciones_tel,\
            usuarios_x_ubicaciones_x_roles.usuarios_id AS usuarios_id, usuarios_x_ubicaciones_x_roles.roles_id AS usuarios_roles_id,\
            roles.nombre AS usuarios_nombre_rol\
            FROM ubicaciones\
            INNER JOIN usuarios_x_ubicaciones_x_roles ON ubicaciones.id = usuarios_x_ubicaciones_x_roles.ubicaciones_id\ 
            INNER JOIN roles ON roles_id = roles.id`
         const [rows] = await pool.query(queryString);    
         return rows;
       },      
      findLocationsByUserId: async (userId) => {
        const queryString =         
          /*Find all locations and roles for a certain user*/
          `SELECT usuarios_x_ubicaciones_x_roles.id,\
            ubicaciones.id as ubicaciones_id,ubicaciones.nombre as ubicaciones_nombre, ubicaciones.descripcion as ubicaciones_descripcion,\
            ubicaciones.foto as ubicaciones_foto, ubicaciones.telefono as ubicaciones_tel,\
            usuarios_x_ubicaciones_x_roles.usuarios_id AS usuarios_id, usuarios_x_ubicaciones_x_roles.roles_id AS usuarios_roles_id,\
            roles.nombre AS usuarios_nombre_rol\
            FROM ubicaciones\
            INNER JOIN usuarios_x_ubicaciones_x_roles ON ubicaciones.id = usuarios_x_ubicaciones_x_roles.ubicaciones_id\ 
            INNER JOIN roles ON roles_id = roles.id\
            WHERE usuarios_id = ?;`
        const [rows] = await pool.query(queryString, userId);    
        return rows;
      },
      findUsersByLocationId: async (locationId) => {
        const queryString = 
          /* Find all users that have a rol on the location */
          `SELECT  usuarios_x_ubicaciones_x_roles.id,\
            usuarios_x_ubicaciones_x_roles.usuarios_id AS usuarios_id, 
            usuarios_x_ubicaciones_x_roles.roles_id AS usuarios_roles_id,
            roles.nombre AS usuarios_nombre_rol,
            usuarios.nombre_1  as usuario_nom_apell,
            usuarios_x_ubicaciones_x_roles.ubicaciones_id as ubicaciones_id
          FROM usuarios
          INNER JOIN usuarios_x_ubicaciones_x_roles ON usuarios.id = usuarios_x_ubicaciones_x_roles.usuarios_id 
          INNER JOIN roles ON roles_id = roles.id
          WHERE ubicaciones_id = ?;`;
          const [rows] = await pool.query(queryString, locationId);    
        return rows;
      },
      create: async (locationUserData) => {
        const { usuarios_id, ubicaciones_id, roles_id } = locationUserData;  
        const queryStringIfExist = 
        `SELECT EXISTS (
              SELECT 1
              FROM usuarios_x_ubicaciones_x_roles
              WHERE usuarios_id = ?
              AND ubicaciones_id = ?
          ) AS existe_relacion;`;
        const [rows] = await pool.query(queryStringIfExist, [usuarios_id, ubicaciones_id]);
        console.log(rows[0].existe_relacion);
        if (rows[0].existe_relacion == 1){
          return -1;
        }
        const queryString = 
          `insert into usuarios_x_ubicaciones_x_roles
            (usuarios_id, ubicaciones_id, roles_id, fecha_creacion)
            values
            (?, ?, ?, curdate());`
        const [result] = await pool.query(queryString, [usuarios_id, ubicaciones_id, roles_id]);
        return result.insertId;
      },

      //hacer algun cambio para contemplar el la misma ubicacion, mismo usuario, pero un cambio de roles.
      update: async (locationUserData) => {
        const { id, usuarios_id, ubicaciones_id, roles_id  } = locationUserData;
        const queryStringIfExist = 
        `SELECT EXISTS (\
              SELECT 1\
              FROM usuarios_x_ubicaciones_x_roles\
              WHERE usuarios_id = ?\
              AND ubicaciones_id = ?    \          
          ) AS existe_relacion;`;
        const [rows] = await pool.query(queryStringIfExist, [usuarios_id, ubicaciones_id]);
        const userExistOnLocation = rows[0].existe_relacion == 1;
        
        if (userExistOnLocation){          
            // const queryGetRole = 
            // ` SELECT roles_id\
            //   FROM usuarios_x_ubicaciones_x_roles\
            //   WHERE usuarios_id = ?\
            //   AND ubicaciones_id = ? `;
            //   const [rows] = await pool.query(queryGetRole, [usuarios_id, ubicaciones_id]);
            //   //const userExistOnLocation = rows[0].existe_relacion == 1;
            //   console.log(rows);
            return -1;          
        }        
        const updateFields = [];
        const values = [];
    
        if (usuarios_id) { updateFields.push('usuarios_id = ?'); values.push(usuarios_id); }
        if (ubicaciones_id) { updateFields.push('ubicaciones_id = ?'); values.push(ubicaciones_id); }
        if (roles_id) { updateFields.push('roles_id = ?'); values.push(roles_id); }
       
        values.push(id);
    
        const query = `UPDATE usuarios_x_ubicaciones_x_roles SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        
        return result.affectedRows;
      },
      delete: async (id) => {
        const [result] = await pool.query('DELETE FROM usuarios_x_ubicaciones_x_roles WHERE id = ?', [id]);
        return result.affectedRows;
      }
}
export default LocationUser;