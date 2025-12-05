import express from 'express';
import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse
} from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, createCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);

export default router;