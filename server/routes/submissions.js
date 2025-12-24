import express from 'express';
import {
    startSubmission,
    saveAnswer,
    submitTest,
    getSubmission,
    getUserSubmissions,
    getExamSubmissions,
    getReview,
    deleteSubmission,
    deleteExamSubmissions,
    getUserStats
} from '../controllers/submissionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/submissions/start
// @desc    Start a new test submission
// @access  Private
router.post('/start', protect, startSubmission);

// @route   PUT /api/submissions/:id/answer
// @desc    Save an answer (auto-save)
// @access  Private
router.put('/:id/answer', protect, saveAnswer);

// @route   PUT /api/submissions/:id/submit
// @desc    Submit (complete) a test
// @access  Private
router.put('/:id/submit', protect, submitTest);

// @route   GET /api/submissions/:id
// @desc    Get submission details
// @access  Private
router.get('/:id', protect, getSubmission);

// @route   GET /api/submissions/user/:userId
// @desc    Get user's test history
// @access  Private
router.get('/user/:userId', protect, getUserSubmissions);

// @route   GET /api/submissions/exam/:examId
// @desc    Get all submissions for an exam (admin)
// @access  Private/Admin
router.get('/exam/:examId', protect, admin, getExamSubmissions);

// @route   GET /api/submissions/:id/review
// @desc    Get detailed answer review
// @access  Private
router.get('/:id/review', protect, getReview);

// @route   DELETE /api/submissions/:id
// @desc    Delete a submission
// @access  Private
router.delete('/:id', protect, deleteSubmission);

// @route   DELETE /api/submissions/exam/:examId
// @desc    Delete all submissions for an exam (Admin only)
// @access  Private/Admin
router.delete('/exam/:examId', protect, admin, deleteExamSubmissions);

// @route   GET /api/submissions/stats/user/:userId
// @desc    Get user statistics
// @access  Private
router.get('/stats/user/:userId', protect, getUserStats);

// @route   PUT /api/submissions/:id/answer
// @desc    Lưu câu trả lời (auto-save)
// @access  Private
router.put('/:id/answer', protect, async (req, res) => {
    try {
        const { questionNumber, part, userAnswer } = req.body;
        console.log('💾 Saving answer:', { submissionId: req.params.id, questionNumber, part, userAnswer });

        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Kiểm tra quyền sở hữu
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        if (submission.status !== 'in_progress') {
            return res.status(400).json({ message: 'Bài test đã hoàn thành' });
        }

        // Lấy đáp án đúng từ question
        // Build query - part is optional, we'll find by examId and questionNumber first
        let questionQuery = {
            examId: submission.examId,
            questionNumber: parseInt(questionNumber)
        };
        
        // Add part to query only if it's provided and valid
        if (part && !isNaN(parseInt(part))) {
            questionQuery.part = parseInt(part);
        }

        const question = await Question.findOne(questionQuery);

        if (!question) {
            console.warn('⚠️ Question not found:', questionQuery);
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        }

        console.log('✅ Question found:', { type: question.questionType, correctAnswer: question.correctAnswer });

        // Get correct answer directly from question
        // All questions now have a flat structure with correctAnswer field
        const correctAnswer = question.correctAnswer;

        // Tìm và cập nhật hoặc thêm mới câu trả lời
        const existingAnswerIndex = submission.answers.findIndex(
            a => a.questionNumber === parseInt(questionNumber)
        );

        const answerData = {
            questionNumber: parseInt(questionNumber),
            part: question.part,
            userAnswer: userAnswer ? userAnswer.toUpperCase() : null,
            correctAnswer: correctAnswer.toUpperCase(),
            isCorrect: userAnswer ? userAnswer.toUpperCase() === correctAnswer.toUpperCase() : false
        };

        if (existingAnswerIndex !== -1) {
            submission.answers[existingAnswerIndex] = answerData;
        } else {
            submission.answers.push(answerData);
        }

        // Cập nhật progress
        submission.updateProgress();

        await submission.save();

        res.json({
            message: 'Lưu câu trả lời thành công',
            progress: submission.progress
        });
    } catch (error) {
        console.error('❌ Error saving answer:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: 'Lỗi khi lưu câu trả lời: ' + error.message });
    }
});

// @route   PUT /api/submissions/:id/submit
// @desc    Nộp bài test
// @access  Private
router.put('/:id/submit', protect, async (req, res) => {
    try {
        console.log('📤 Submitting test:', req.params.id);
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Kiểm tra quyền sở hữu
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        if (submission.status !== 'in_progress') {
            return res.status(400).json({ message: 'Bài test đã hoàn thành' });
        }

        // Hoàn thành bài test
        submission.complete();
        await submission.save();
        console.log('✅ Submission completed:', { submissionId: submission._id, scores: submission.scores });

        // Cập nhật thống kê exam (wrap in try-catch to not block submission)
        try {
            const exam = await Exam.findById(submission.examId);
            if (exam) {
                await exam.updateAttemptCount();
                await exam.updateAverageScore();
            }
        } catch (examError) {
            console.warn('⚠️ Could not update exam stats:', examError.message);
            // Don't fail the submission if exam stats update fails
        }

        res.json({
            message: 'Nộp bài thành công',
            submission,
            scores: submission.scores
        });
    } catch (error) {
        console.error('❌ Error submitting test:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: 'Lỗi khi nộp bài: ' + error.message });
    }
});

// @route   GET /api/submissions/:id
// @desc    Lấy chi tiết một submission (kết quả)
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('examId', 'title bookId duration')
            .populate('userId', 'username email');

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Kiểm tra quyền xem (user hoặc admin)
        if (submission.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Lỗi khi lấy kết quả' });
    }
});

// @route   GET /api/submissions/user/:userId
// @desc    Lấy lịch sử làm bài của user
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
    try {
        // Kiểm tra quyền xem (chỉ xem của mình hoặc admin)
        if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const { status, limit } = req.query;

        const filter = { userId: req.params.userId };
        if (status) filter.status = status;

        let query = Submission.find(filter)
            .populate('examId', 'title bookId')
            .sort({ createdAt: -1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const submissions = await query;

        res.json(submissions);
    } catch (error) {
        console.error('Error fetching user submissions:', error);
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử làm bài' });
    }
});

// @route   GET /api/submissions/exam/:examId
// @desc    Lấy tất cả submissions của một exam (admin)
// @access  Private/Admin
router.get('/exam/:examId', protect, admin, async (req, res) => {
    try {
        const submissions = await Submission.find({ 
            examId: req.params.examId,
            status: 'completed'
        })
        .populate('userId', 'username email')
        .sort({ completedAt: -1 });

        res.json(submissions);
    } catch (error) {
        console.error('Error fetching exam submissions:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài làm' });
    }
});

// @route   GET /api/submissions/:id/review
// @desc    Xem lại đáp án chi tiết
// @access  Private
router.get('/:id/review', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('examId');

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Kiểm tra quyền
        if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        if (submission.status !== 'completed') {
            return res.status(400).json({ message: 'Bài test chưa hoàn thành' });
        }

        // Lấy tất cả questions để show chi tiết
        const questions = await Question.find({ examId: submission.examId._id })
            .sort({ part: 1, questionNumber: 1 });

        // Map answers với questions
        const reviewData = questions.map(question => {
            // Tìm answer của user
            const userAnswer = submission.answers.find(
                a => a.questionNumber === question.questionNumber
            );

            // All questions are now flat - return with user answer and correctness
            return {
                ...question.toObject(),
                userAnswer: userAnswer?.userAnswer || null,
                isCorrect: userAnswer?.isCorrect || false
            };
        });

        res.json({
            submission,
            questions: reviewData
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ message: 'Lỗi khi xem lại đáp án' });
    }
});

// @route   DELETE /api/submissions/:id
// @desc    Xóa submission (admin hoặc user nếu chưa hoàn thành)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Kiểm tra quyền xóa
        const isOwner = submission.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Không có quyền xóa' });
        }

        // User chỉ được xóa bài chưa hoàn thành
        if (!isAdmin && submission.status === 'completed') {
            return res.status(400).json({ message: 'Không thể xóa bài đã hoàn thành' });
        }

        await submission.deleteOne();

        res.json({ message: 'Xóa bài làm thành công' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài làm' });
    }
});

// @route   GET /api/submissions/stats/user/:userId
// @desc    Thống kê tổng quan của user
// @access  Private
router.get('/stats/user/:userId', protect, async (req, res) => {
    try {
        // Kiểm tra quyền
        if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const completedSubmissions = await Submission.find({
            userId: req.params.userId,
            status: 'completed'
        });

        if (completedSubmissions.length === 0) {
            return res.json({
                totalTests: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                totalTimeSpent: 0,
                averageListening: 0,
                averageReading: 0
            });
        }

        // Tính toán thống kê
        const totalScore = completedSubmissions.reduce((sum, sub) => sum + sub.scores.total, 0);
        const totalListening = completedSubmissions.reduce((sum, sub) => sum + sub.scores.listening.scaled, 0);
        const totalReading = completedSubmissions.reduce((sum, sub) => sum + sub.scores.reading.scaled, 0);
        const totalTime = completedSubmissions.reduce((sum, sub) => sum + sub.timeSpent, 0);
        const scores = completedSubmissions.map(sub => sub.scores.total);

        res.json({
            totalTests: completedSubmissions.length,
            averageScore: Math.round(totalScore / completedSubmissions.length),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            totalTimeSpent: totalTime,
            averageListening: Math.round(totalListening / completedSubmissions.length),
            averageReading: Math.round(totalReading / completedSubmissions.length),
            recentTests: completedSubmissions.slice(0, 5).map(sub => ({
                examTitle: sub.examId?.title || 'Unknown',
                score: sub.scores.total,
                completedAt: sub.completedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê' });
    }
});

export default router;