import express from 'express';
import { validateGardenBedData } from '../middleware/gardenBedValidator.js';
import { checkMoistureLevels } from '../middleware/checkMoistureLevels.js';
import { getData, postData } from '../controllers/gardenBedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/data')
  .get(protect, getData)
  .post(protect, validateGardenBedData, checkMoistureLevels, postData);

export default router;
