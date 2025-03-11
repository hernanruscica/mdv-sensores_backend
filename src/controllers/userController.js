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
      return res.status(401).json({ message: 'Invalid email or password' });
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
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const {id, userName, dni} = decodedToken;
    
    const response = await User.update({id, estado: 1});    
    if (response == 1){
      res.status(201).json({ message: "User activated", userId: id, userName: userName, dni: dni });
    }
  } catch (error) {
    next(error);
  }
}

export const sendActivationEmail = async (req, res, next) => {
  const { email }  = req.params;
  console.log(`send activation email to ${email}`);
  try {
    const response = await User.findByEmail(email);    
    if (response !== undefined){
      const userData = response;      
      const token = generateToken(userData.id, `${userData.nombre_1} ${userData.apellido_1}`, userData.dni);      
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
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
