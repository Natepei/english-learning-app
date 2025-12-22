import express from 'express';
import {
    getPassagesByExam,
    getPassageById,
    createPassage,
    updatePassage,
    deletePassage
} from '../controllers/passageController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/passages/exam/:examId
// @desc    Get all passages for an exam
// @access  Public
router.get('/exam/:examId', getPassagesByExam);

// @route   GET /api/passages/:id
// @desc    Get a single passage
// @access  Public
router.get('/:id', getPassageById);

// @route   POST /api/passages
// @desc    Create a new passage
// @access  Private/Admin
router.post('/', protect, admin, createPassage);

// @route   PUT /api/passages/:id
// @desc    Update a passage
// @access  Private/Admin
router.put('/:id', protect, admin, updatePassage);

// @route   DELETE /api/passages/:id
// @desc    Delete a passage
// @access  Private/Admin
router.delete('/:id', protect, admin, deletePassage);

export default router;