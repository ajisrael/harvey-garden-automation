import express from 'express';
import {
  validateActionGet,
  validateActionPost,
} from '../middleware/actionsValidator.js';
import { getData, postData } from '../controllers/actionsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/data')
  .get(protect, validateActionGet, getData)
  .post(protect, validateActionPost, postData);

export default router;
