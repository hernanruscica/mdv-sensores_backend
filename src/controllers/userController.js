import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findByEmail(email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userId = await User.create({ email, password, name });
    const token = generateToken(userId);

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
