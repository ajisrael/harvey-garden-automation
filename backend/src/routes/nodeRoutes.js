import express from 'express';
import { getConfig } from '../controllers/nodeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:nodeId/config').get(protect, getConfig);

export default router;
