import User from '../models/userModel.js';
import LocationUser from '../models/locationUserModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { sendActivation } from '../utils/mail.js';
import jwt from 'jsonwebtoken';
import generateTokenAlarmLog from "../utils/generateTokenAlarmLog.js";

export const loginUser = async (req, res, next) => {
  try {
    const { dni, password } = req.body;
    console.log('loginUser controller', dni, password);
    const user = await User.findByDni(dni);    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(200).json({ message: 'DNI o contraseña incorrectos!' });
    }
    delete user.password;
    const token = generateToken(user.id);
    res.status(200).json({user, token });
  } catch (error) {
    next(error); 
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const userData = req.body;    
    const userExists = await User.findByDni(userData.dni);

    if (userExists) {
      return res.status(200).json({ 
        message: 'Ya existe un usuario con ese DNI', 
        success: false 
      });
    }  

    // Verificar que vengan los datos necesarios para la relación
    if (!userData.ubicaciones_id || !userData.roles_id) {
      return res.status(200).json({
        message: 'Faltan datos de ubicación o rol',
        success: false
      });
    }

    // 1. Crear el usuario
    const result = await User.create(userData);

    if (!result.success) {
      return res.status(200).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

    // 2. Crear la relación usuario-ubicación-rol
    const locationUserResult = await LocationUser.create({
      usuarios_id: result.userId,
      ubicaciones_id: userData.ubicaciones_id,
      roles_id: userData.roles_id
    });

    // Si locationUserResult es -1, significa que la relación ya existe
    if (locationUserResult === -1) {
      // Eliminar el usuario creado para mantener consistencia
      await User.delete(result.userId);
      return res.status(200).json({
        message: 'Relación usuario-ubicación-rol ya existe',
        success: false
      });
    }

    if (!locationUserResult) {
      // Eliminar el usuario creado para mantener consistencia
      await User.delete(result.userId);
      return res.status(200).json({
        message: 'Error al crear la relación usuario-ubicación-rol',
        success: false
      });
    }

    // 3. Si todo salió bien, generar token y enviar email
    req.body.id = result.userId;
    const token = generateToken(result.userId, `${req.body.nombre_1} ${req.body.apellido_1}`, req.body.dni);
    req.body.token = token;    
    await sendActivation(token, userData);
    
    res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      success: true, 
      user: {
        ...req.body,
        locationUser: locationUserResult
      }
    });

  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ 
      success: false,
      message: 'Token de activación no proporcionado'
    });
  }

  try {
    // Verificar si el token es válido
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'El token de activación ha expirado'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token de activación inválido'
      });
    }

    const { id, userName, dni } = decodedToken;

    // Verificar si el usuario existe y no está ya activado
    /*const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (existingUser.estado === 1) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está activado'
      });
    }
*/
    // Actualizar estado del usuario
    const response = await User.update({ id, estado: 1 });
    console.log("userControler, response del update, dentro de activated", response);
    
    if (response !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Error al activar el usuario'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario activado exitosamente',
      data: {
        userId: id,
        userName,
        dni
      }
    });

  } catch (error) {
    console.error('Error en activación de usuario:', error);
    next(error);
  }
};

export const sendActivationEmail = async (req, res, next) => {
  const { email }  = req.params;
  //console.log(`Try sending activation email to ${email}`);
  try {
    const response = await User.findByEmail(email);    
    console.log('findByEmail', response);
    if (response !== undefined){
      const userData = response;      
      console.log('userData', userData);
      const token = generateToken(userData.id, `${userData.nombre_1} ${userData.apellido_1}`, userData.dni);  
      console.log('token', token);    
      const emailSended = await sendActivation(token, userData);
      return res.status(200).json({message: (emailSended) ? "Email sended" : "Error sending email", emailExists: true});
    }else{
      return res.status(200).json({message:"Email doesn't exists", emailExists: false});
    }
  } catch (error) {
    next(error);
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const userData = req.body;
    //console.log('updateUser controller',userData);
    const { id } = req.params;
    userData.id = id;
    const updatedRows = await User.update(userData);

    if (updatedRows === 0) {
      return res.status(200).json({ message: 'Usuario no encontrado', success: true });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente', user: userData, success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await User.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    
    if (users.length === 0) {
      return res.status(400).json({message: 'Users Not Found'});
    }

    // Crear un Map para agrupar por usuario
    const usersMap = new Map();

    users.forEach(user => {
      // Extraer los datos de ubicación
      const ubicacion = {
        ubicaciones_id: user.ubicaciones_id,
        ubicaciones_nombre: user.ubicaciones_nombre,
        ubicaciones_descripcion: user.ubicaciones_descripcion,
        ubicaciones_foto: user.ubicaciones_foto,
        ubicaciones_tel: user.ubicaciones_tel,
        usuarios_roles_id: user.usuarios_roles_id,
        usuarios_nombre_rol: user.usuarios_nombre_rol
      };

      // Extraer datos base del usuario (sin las ubicaciones)
      const userData = {
        id: user.id,
        nombre_1: user.nombre_1,
        nombre_2: user.nombre_2,
        apellido_1: user.apellido_1,
        apellido_2: user.apellido_2,
        usuario_nom_apell: user.usuario_nom_apell,
        email: user.email,
        telefono: user.telefono,
        estado: user.estado,
        dni: user.dni,
        foto: user.foto,
        espropietario: user.espropietario,
        fecha_creacion: user.fecha_creacion,
        direcciones_id: user.direcciones_id,
        ubicaciones: []
      };

      // Si el usuario ya existe en el Map, solo agregamos la ubicación
      if (usersMap.has(user.id)) {
        usersMap.get(user.id).ubicaciones.push(ubicacion);
      } else {
        // Si es la primera vez que vemos este usuario, lo agregamos con su primera ubicación
        userData.ubicaciones.push(ubicacion);
        usersMap.set(user.id, userData);
      }
    });

    // Convertir el Map a un array de usuarios
    const uniqueUsers = Array.from(usersMap.values());

    res.status(200).json({ 
      count: uniqueUsers.length, 
      users: uniqueUsers 
    });

  } catch (error) {
    next(error);
  }
};

// GET {{baseUrl}}/api/locationsusers/usersbylocation/36
export const getAllUsersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const locationsByUser = await LocationUser.findLocationsByUserId(userId);
    const locationsIdsByUser = locationsByUser.map(locationByUser => locationByUser.ubicaciones_id);

    // Usar Promise.all para esperar a que todas las promesas se resuelvan
    const users = await Promise.all(
      locationsIdsByUser.map(async (locationId) => {
        const currentUser = await LocationUser.findUsersByLocationId(locationId);
        return currentUser.filter(user => user.espropietario == 0);
      })
    );

    // Filtrar los valores que no existen y aplanar el array
    const flattenedUsers = users.filter(Boolean).flat();

    // Crear un Map para agrupar por usuario
    const usersMap = new Map();

    flattenedUsers.forEach(user => {
      // Extraer solo los datos de ubicación requeridos
      const ubicacion = {
        ubicaciones_id: user.ubicaciones_id,
        ubicaciones_nombre: user.ubicaciones_nombre
      };

      // Si el usuario ya existe en el Map, solo agregamos la ubicación
      if (usersMap.has(user.usuarios_id)) {
        usersMap.get(user.usuarios_id).ubicaciones.push(ubicacion);
      } else {
        // Si es la primera vez que vemos este usuario, lo agregamos con su primera ubicación
        const userData = {
          id: user.usuarios_id,
          nombre_1: user.nombre_1,
          nombre_2: user.nombre_2,
          apellido_1: user.apellido_1,
          apellido_2: user.apellido_2,
          usuario_nom_apell: user.usuario_nom_apell,
          email: user.email,
          telefono: user.telefono,
          estado: user.estado,
          dni: user.dni,
          foto: user.foto,
          espropietario: user.espropietario,
          fecha_creacion: user.fecha_creacion,
          ubicaciones: [ubicacion]
        };
        usersMap.set(user.usuarios_id, userData);
      }
    });

    // Convertir el Map a un array de usuarios
    const uniqueUsers = Array.from(usersMap.values());

    res.status(200).json({ 
      count: uniqueUsers.length, 
      users: uniqueUsers 
    });

  } catch (error) {
    next(error);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);    
    if (!user) {
      return res.status(400).json({message: 'User Not Found'});
    }
    res.status(200).json({message: "User Founded", user });
  } catch (error) {
    next(error);
  }
};
