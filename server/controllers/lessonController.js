import Lesson from '../models/Lesson.js';

export const getLessonsByCourse = async (req, res) => {
    try {
        const lessons = await Lesson.find({ courseId: req.params.courseId });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createLesson = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;
        const lesson = new Lesson({ courseId, title, content });
        await lesson.save();
        res.status(201).json(lesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateLesson = async (req, res) => {
    try {
        const { title, content } = req.body;
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }

        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;

        const updatedLesson = await lesson.save();
        res.json(updatedLesson);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật bài học', error: error.message });
    }
};

export const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }

        await lesson.deleteOne();
        res.json({ message: 'Đã xóa bài học thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bài học', error: error.message });
    }
};
