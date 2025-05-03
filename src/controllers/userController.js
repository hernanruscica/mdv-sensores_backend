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
      return res.status(400).json({ message: 'User already exists' });
    }  

    const userId = await User.create(userData);
    req.body.id = userId;
    const token = generateToken(userId, `${req.body.nombre_1} ${req.body.apellido_1}`, req.body.dni);
    req.body.token = token;    
    sendActivation(token, userData);
    
    res.status(201).json({ message: "User created", user: req.body });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
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
    //console.log('findByEmail', response);
    if (response !== undefined){
      const userData = response;      
      //console.log('userData', userData);
      const token = generateToken(userData.id, `${userData.nombre_1} ${userData.apellido_1}`, userData.dni);  
      //console.log('token', token);    
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
      return res.status(404).json({ message: 'User not found', success: true });
    }

    res.status(200).json({ message: 'User updated successfully', user: userData, success: true });
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
    if (users.length == 0) {
      return res.status(400).json({message: 'Users Not Found'});
    }
    res.status(200).json({ count : users.length, users });
  } catch (error) {
    next(error);
  }
};

// GET {{baseUrl}}/api/locationsusers/usersbylocation/36
export const getAllUsersByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const locationsByUser = await LocationUser.findLocationsByUserId(userId);
    //console.log(locationsByUser);
    const locationsIdsByUser = locationsByUser.map(locationByUser => locationByUser.ubicaciones_id);

    // Usar Promise.all para esperar a que todas las promesas se resuelvan
    const users = await Promise.all(
      locationsIdsByUser.map(async (locationId) => {
        const currentUser = await LocationUser.findUsersByLocationId(locationId);
        return currentUser;
      })
    );

    // Filtrar los valores que no existen
    const filteredUsers = users.filter(Boolean);

    // Poner todos los usuarios al mismo nivel
    const flattenedUsers = filteredUsers.flat();

    // Eliminar duplicados basados en usuarios_id
    const uniqueUsers = flattenedUsers.filter((user, index, self) =>
      self.findIndex(u => u.usuarios_id === user.usuarios_id) === index
    );

    /*
    if (uniqueUsers.length > 0) {
      res.status(200).json({ count: uniqueUsers.length, users: uniqueUsers });
    } else {
      return res.status(400).json({ message: 'Users Not Found' });
    }
      */
    res.status(200).json({ count: uniqueUsers.length, users: uniqueUsers }); 
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
