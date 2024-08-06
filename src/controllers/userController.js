import User from '../models/userModel.js';
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
    res.status(201).json({ user: req.body });
  } catch (error) {
    next(error); // Pasa el error al middleware de manejo de errores
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

export const getUserByDni = async (req, res, next) => {
  try {
    const { dni } = req.params;
    const user = await User.findByDni(dni);    
    if (!user) {
      return res.status(400).json({message: 'User Not Found'});
    }
    res.status(200).json({message: "User Founded", user });
  } catch (error) {
    next(error);
  }
};
