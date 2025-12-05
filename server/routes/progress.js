import express from 'express';
import { saveProgress, getProgressByUser } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, saveProgress);
router.get('/:userId', getProgressByUser);

export default router;
