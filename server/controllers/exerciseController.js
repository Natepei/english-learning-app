import Exercise from '../models/Exercise.js';

export const getExercisesByLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        // Thêm log để debug
        // console.log('Fetching exercises for lessonId:', lessonId);

        const exercises = await Exercise.find({ lessonId: lessonId });
        // Log số lượng bài tập tìm được
        // console.log('Found exercises:', exercises.length);

        res.json(exercises);
    } catch (error) {
        console.error('Error in getExercisesByLesson:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createExercise = async (req, res) => {
    try {
        const { lessonId, question, options, answer, type } = req.body;
        const exercise = new Exercise({ lessonId, question, options, answer, type });
        await exercise.save();
        res.status(201).json(exercise);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateExercise = async (req, res) => {
    try {
        const { question, options, answer, type } = req.body;
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập' });
        }

        exercise.question = question || exercise.question;
        exercise.options = options || exercise.options;
        exercise.answer = answer || exercise.answer;
        exercise.type = type || exercise.type;

        const updatedExercise = await exercise.save();
        res.json(updatedExercise);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật bài tập', error: error.message });
    }
};

export const deleteExercise = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập' });
        }

        await exercise.deleteOne();
        res.json({ message: 'Đã xóa bài tập thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bài tập', error: error.message });
    }
};
