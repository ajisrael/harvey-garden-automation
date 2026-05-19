import jwt from 'jsonwebtoken';
import { getUserDataById, isUserAdmin } from '../services/userHelper.js';

const protect = (req, res, next) => {
  let token;
  let user;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      user = getUserDataById(decoded.id);
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }

    if (typeof user === 'undefined') {
      res.status(401);
      throw new Error('Unable to find user, token failed');
    }

    req.user = user;
    next();
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const admin = (req, res, next) => {
  if (isUserAdmin(req.user)) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized, not an admin');
  }
};

export { protect, admin };
