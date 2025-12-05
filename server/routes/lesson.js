import express from 'express';
import {
    getLessonsByCourse,
    createLesson,
    updateLesson,
    deleteLesson
} from '../controllers/lessonController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId', getLessonsByCourse);
router.post('/', protect, createLesson);
router.put('/:id', protect, updateLesson);
router.delete('/:id', protect, deleteLesson);

export default router;
