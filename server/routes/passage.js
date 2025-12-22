// routes/passages.js
import express from 'express';
import { getPassagesByExam } from '../controllers/passagesController.js';

const router = express.Router();

// @route   GET /api/passages/exam/:examId
// @desc    Lấy tất cả passages của một exam (dùng cho test page)
// @access  Public (vì test page cần load)
router.get('/exam/:examId', getPassagesByExam);

export default router;