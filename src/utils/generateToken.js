import jwt from 'jsonwebtoken';

const generateToken = (id, userName = '', dni='') => {
  return jwt.sign({ id , userName, dni}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateToken;
