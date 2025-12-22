import { Exam } from '../models/Exam.js';
import { Book } from '../models/Book.js';
import { Question } from '../models/Question.js';
import { Submission } from '../models/Submission.js';

// @desc    Get all exams
// @access  Public
export const getAllExams = async (req, res) => {
    try {
        const { bookId, status } = req.query;

        const filter = { isActive: true };
        if (bookId) filter.bookId = bookId;
        if (status) filter.status = status;

        const exams = await Exam.find(filter)
            .populate('bookId', 'title year imageUrl')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đề thi' });
    }
};

// @desc    Get a single exam
// @access  Public
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('bookId', 'title year imageUrl')
            .populate('createdBy', 'username');

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi' });
        }

        // Count questions
        const questionCount = await Question.countDocuments({ examId: exam._id });

        res.json({
            ...exam.toObject(),
            currentQuestionCount: questionCount,
            isComplete: questionCount === exam.totalQuestions
        });
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đề thi' });
    }
};

// @desc    Create a new exam
// @access  Private/Admin
export const createExam = async (req, res) => {
    try {
        const { title, bookId, duration } = req.body;

        // Validate data
        if (!title || !bookId) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        // Create exam
        const exam = await Exam.create({
            title,
            bookId,
            duration: duration || 120,
            createdBy: req.user._id
        });

        // Update book exam count
        await book.updateExamCount();

        res.status(201).json({
            message: 'Tạo đề thi thành công',
            exam
        });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Lỗi khi tạo đề thi' });
    }
};

// @desc    Update an exam
// @access  Private/Admin
export const updateExam = async (req, res) => {
    try {
        const { title, duration, status, isActive } = req.body;

        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi' });
        }

        // Update fields
        if (title) exam.title = title;
        if (duration) exam.duration = duration;
        if (status) exam.status = status;
        if (isActive !== undefined) exam.isActive = isActive;

        await exam.save();

        res.json({
            message: 'Cập nhật đề thi thành công',
            exam
        });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật đề thi' });
    }
};

// @desc    Delete an exam (soft delete)
// @access  Private/Admin
export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi' });
        }

        // Check if there are submissions
        const submissionCount = await Submission.countDocuments({ examId: exam._id });

        if (submissionCount > 0) {
            return res.status(400).json({ 
                message: 'Không thể xóa đề thi đã có người làm' 
            });
        }

        // Soft delete
        exam.isActive = false;
        await exam.save();

        // Update book exam count
        const book = await Book.findById(exam.bookId);
        if (book) {
            await book.updateExamCount();
        }

        res.json({ message: 'Xóa đề thi thành công' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ message: 'Lỗi khi xóa đề thi' });
    }
};

// @desc    Get question overview for an exam
// @access  Private/Admin
export const getQuestionsOverview = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi' });
        }

        // Count questions by part
        const partCounts = {};
        for (let i = 1; i <= 7; i++) {
            partCounts[`part${i}`] = await Question.countDocuments({ 
                examId: exam._id, 
                part: i 
            });
        }

        const totalQuestions = Object.values(partCounts).reduce((a, b) => a + b, 0);

        res.json({
            examId: exam._id,
            examTitle: exam.title,
            expectedQuestions: exam.partQuestions,
            currentQuestions: partCounts,
            totalCurrent: totalQuestions,
            totalExpected: exam.totalQuestions,
            isComplete: totalQuestions === exam.totalQuestions,
            missingQuestions: {
                part1: exam.partQuestions.part1 - partCounts.part1,
                part2: exam.partQuestions.part2 - partCounts.part2,
                part3: exam.partQuestions.part3 - partCounts.part3,
                part4: exam.partQuestions.part4 - partCounts.part4,
                part5: exam.partQuestions.part5 - partCounts.part5,
                part6: exam.partQuestions.part6 - partCounts.part6,
                part7: exam.partQuestions.part7 - partCounts.part7
            }
        });
    } catch (error) {
        console.error('Error fetching questions overview:', error);
        res.status(500).json({ message: 'Lỗi khi lấy tổng quan câu hỏi' });
    }
};

// @desc    Get exam statistics
// @access  Private/Admin
export const getExamStatistics = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi' });
        }

        // Get all completed submissions
        const submissions = await Submission.find({ 
            examId: exam._id, 
            status: 'completed' 
        });

        if (submissions.length === 0) {
            return res.json({
                examId: exam._id,
                attemptCount: 0,
                averageScore: 0,
                averageListeningScore: 0,
                averageReadingScore: 0,
                averageTimeSpent: 0,
                scoreDistribution: [],
                partAverages: {}
            });
        }

        // Calculate statistics
        const totalScore = submissions.reduce((sum, sub) => sum + sub.scores.total, 0);
        const totalListening = submissions.reduce((sum, sub) => sum + sub.scores.listening.scaled, 0);
        const totalReading = submissions.reduce((sum, sub) => sum + sub.scores.reading.scaled, 0);
        const totalTime = submissions.reduce((sum, sub) => sum + sub.timeSpent, 0);

        // Part averages
        const partAverages = {};
        for (let i = 1; i <= 7; i++) {
            const partKey = `part${i}`;
            const partTotal = submissions.reduce((sum, sub) => sum + sub.scores.parts[partKey], 0);
            partAverages[partKey] = (partTotal / submissions.length).toFixed(2);
        }

        // Score distribution
        const ranges = [
            { min: 0, max: 200, count: 0 },
            { min: 201, max: 400, count: 0 },
            { min: 401, max: 600, count: 0 },
            { min: 601, max: 800, count: 0 },
            { min: 801, max: 990, count: 0 }
        ];

        submissions.forEach(sub => {
            const range = ranges.find(r => sub.scores.total >= r.min && sub.scores.total <= r.max);
            if (range) range.count++;
        });

        res.json({
            examId: exam._id,
            attemptCount: submissions.length,
            averageScore: Math.round(totalScore / submissions.length),
            averageListeningScore: Math.round(totalListening / submissions.length),
            averageReadingScore: Math.round(totalReading / submissions.length),
            averageTimeSpent: Math.round(totalTime / submissions.length),
            scoreDistribution: ranges,
            partAverages
        });
    } catch (error) {
        console.error('Error fetching exam statistics:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê đề thi' });
    }
};
