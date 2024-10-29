import User from '../models/userModel.js';
import LocationUser from '../models/locationUserModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

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
    next(error); // Pasa el error al middleware de manejo de errores
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, password, telefono, estado, direcciones_id } = req.body;
    const userExists = await User.findByDni(dni);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userId = await User.create({ nombre_1, nombre_2, apellido_1, apellido_2, dni, foto, email, password, telefono, estado, direcciones_id });
    //const token = generateToken(userId);
    req.body.id = userId;
    res.status(201).json({ message: "User created", user: req.body });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
  }
};

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
       const locationsIdsByUser = locationsByUser.map(locationByUser => locationByUser.ubicaciones_id);

      // Usar Promise.all para esperar a que todas las promesas se resuelvan
      const users = await Promise.all(
        locationsIdsByUser.map(async (locationId) => {
          const currentUser = await LocationUser.findUsersByLocationId(locationId);
          console.log(currentUser)
          return currentUser;
        })
      );
      // Filtrar los valores que no existen
      const filteredUsers = users.filter(Boolean);
      //ponemos todos los usuarios al mismo nivel, lo sacamos del array de objetos
      const flattenedUsers = filteredUsers.flat();

        if (filteredUsers.length > 0) {
          res.status(200).json({ count : flattenedUsers.length, users: flattenedUsers });
        }else{
          return res.status(400).json({message: 'Users Not Found'});
        }
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
