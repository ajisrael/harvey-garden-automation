import jwt from 'jsonwebtoken';
import serverConfig from '../config/serverConfig.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: serverConfig.jwtExpiration,
  });
};

export default generateToken;
