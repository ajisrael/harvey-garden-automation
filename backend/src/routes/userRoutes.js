import express from 'express';
import {
  validateLoginData,
  validateRegistrationData,
} from '../middleware/userValidator.js';
import { loginUser, registerUser } from '../controllers/userController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/login').post(validateLoginData, loginUser);

router.route('/').post(protect, admin, validateRegistrationData, registerUser);

export default router;
