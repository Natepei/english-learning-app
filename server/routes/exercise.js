import express from 'express';
import {
    getExercisesByLesson,
    createExercise,
    updateExercise,
    deleteExercise
} from '../controllers/exerciseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:lessonId', getExercisesByLesson); 
router.post('/', protect, createExercise); 
router.put('/:id', protect, updateExercise); 
router.delete('/:id', protect, deleteExercise);

export default router;
