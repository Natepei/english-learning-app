import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

// @desc    Get all courses with lessons count and progress
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({
                path: 'lessons',
                select: 'title content'
            });

        // Transform data to include lesson count
        const transformedCourses = courses.map(course => ({
            _id: course._id,
            title: course.title,
            description: course.description,
            language: course.language,
            level: course.level,
            lessonCount: course.lessons.length,
            lessons: course.lessons,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        }));

        res.json(transformedCourses);
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách khóa học',
            error: error.message
        });
    }
};

// @desc    Get single course with lessons
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate({
                path: 'lessons',
                select: 'title content'
            });

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        res.json(course);
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin khóa học',
            error: error.message
        });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
    try {
        const { title, description, language, level } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({ message: 'Vui lòng nhập tiêu đề khóa học' });
        }

        // Kiểm tra khóa học đã tồn tại
        const courseExists = await Course.findOne({ title });
        if (courseExists) {
            return res.status(400).json({ message: 'Khóa học này đã tồn tại' });
        }

        const course = await Course.create({
            title,
            description: description || '',
            language: language || 'English',
            level: level || 'basic'
        });

        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            message: 'Lỗi khi tạo khóa học',
            error: error.message
        });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
    try {
        const { title, description, language, level } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Update fields
        course.title = title || course.title;
        course.description = description || course.description;
        course.language = language || course.language;
        course.level = level || course.level;

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            message: 'Lỗi khi cập nhật khóa học',
            error: error.message
        });
    }
};

// @desc    Delete a course and its lessons
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Delete all lessons associated with this course
        await Lesson.deleteMany({ courseId: course._id });

        // Thay đổi từ course.remove() sang Course.deleteOne()
        await Course.deleteOne({ _id: course._id });

        res.json({ message: 'Đã xóa khóa học và các bài học liên quan' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            message: 'Lỗi khi xóa khóa học',
            error: error.message
        });
    }
};