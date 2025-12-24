import { Submission } from '../models/Submission.js';
import { Exam } from '../models/Exam.js';
import { Question } from '../models/Question.js';

// @desc    Start a new test submission
// @access  Private
export const startSubmission = async (req, res) => {
    try {
        const { examId, mode } = req.body;
        console.log('🎯 Starting submission - examId:', examId, 'mode:', mode);

        if (!examId) {
            return res.status(400).json({ message: 'Vui lòng chọn đề thi' });
        }

        // Kiểm tra exam có tồn tại không
        const exam = await Exam.findById(examId).populate('bookId');
        console.log('📋 Exam found:', exam ? exam.title : 'NOT FOUND');
        
        if (!exam || !exam.isActive) {
            return res.status(404).json({ message: 'Đề thi không khả dụng' });
        }

        // Allow both draft and published exams (draft for testing)
        if (exam.status !== 'published' && exam.status !== 'draft') {
            return res.status(404).json({ message: 'Đề thi không khả dụng' });
        }

        // Kiểm tra xem user có bài test đang làm dở không
        const existingSubmission = await Submission.findOne({
            userId: req.user._id,
            examId,
            status: 'in_progress'
        });

        if (existingSubmission) {
            return res.json({
                message: 'Bạn đang có bài test chưa hoàn thành',
                submission: existingSubmission
            });
        }

        // Tạo submission mới
        const submission = await Submission.create({
            userId: req.user._id,
            examId,
            mode: mode || 'practice',
            startedAt: new Date(),
            status: 'in_progress',
            progress: {
                answeredQuestions: 0,
                totalQuestions: exam.totalQuestions,
                completedParts: []
            }
        });

        console.log('✅ Submission created:', submission._id);
        res.status(201).json({
            message: 'Bắt đầu làm bài test',
            submission
        });
    } catch (error) {
        console.error('❌ Error starting submission:', error.message);
        res.status(500).json({ message: 'Lỗi khi bắt đầu làm bài: ' + error.message });
    }
};

// @desc    Save an answer (auto-save)
// @access  Private
export const saveAnswer = async (req, res) => {
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
        const correctAnswer = question.correctAnswer;

        // Find and update or add new answer
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

        // Update progress
        submission.updateProgress();

        await submission.save();

        res.json({
            message: 'Lưu câu trả lời thành công',
            progress: submission.progress
        });
    } catch (error) {
        console.error('❌ Error saving answer:', error.message);
        res.status(500).json({ message: 'Lỗi khi lưu câu trả lời: ' + error.message });
    }
};

// @desc    Submit (complete) a test
// @access  Private
export const submitTest = async (req, res) => {
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

        // Complete the test
        submission.complete();
        await submission.save();
        console.log('✅ Submission completed:', { submissionId: submission._id, scores: submission.scores });

        // Update exam stats (wrap in try-catch to not block submission)
        try {
            const exam = await Exam.findById(submission.examId);
            if (exam) {
                await exam.updateAttemptCount();
                await exam.updateAverageScore();
            }
        } catch (examError) {
            console.warn('⚠️ Could not update exam stats:', examError.message);
        }

        res.json({
            message: 'Nộp bài thành công',
            submission,
            scores: submission.scores
        });
    } catch (error) {
        console.error('❌ Error submitting test:', error.message);
        res.status(500).json({ message: 'Lỗi khi nộp bài: ' + error.message });
    }
};

// @desc    Get submission details
// @access  Private
export const getSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('examId', 'title bookId duration')
            .populate('userId', 'username email');

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Check access permission (user or admin)
        if (submission.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Lỗi khi lấy kết quả' });
    }
};

// @desc    Get user's test history
// @access  Private
export const getUserSubmissions = async (req, res) => {
    try {
        // Check permission (view own or admin)
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
};

// @desc    Get all submissions for an exam (admin)
// @access  Private/Admin
export const getExamSubmissions = async (req, res) => {
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
};

// @desc    Get detailed answer review
// @access  Private
export const getReview = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('examId');

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Check permission
        if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        if (submission.status !== 'completed') {
            return res.status(400).json({ message: 'Bài test chưa hoàn thành' });
        }

        // Get all questions
        const questions = await Question.find({ examId: submission.examId._id })
            .sort({ part: 1, questionNumber: 1 });

        // Map answers with questions
        const reviewData = questions.map(question => {
            const userAnswer = submission.answers.find(
                a => a.questionNumber === question.questionNumber
            );

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
};

// @desc    Delete a submission
// @access  Private
export const deleteSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy bài làm' });
        }

        // Check delete permission
        const isOwner = submission.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Không có quyền xóa' });
        }

        // User can only delete incomplete tests
        if (!isAdmin && submission.status === 'completed') {
            return res.status(400).json({ message: 'Không thể xóa bài đã hoàn thành' });
        }

        await submission.deleteOne();

        res.json({ message: 'Xóa bài làm thành công' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài làm' });
    }
};

// @desc    Get user statistics
// @access  Private
export const getUserStats = async (req, res) => {
    try {
        // Check permission
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

        // Calculate statistics
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
};

// @desc    Delete all submissions for an exam (Admin only)
// @access  Private/Admin
export const deleteExamSubmissions = async (req, res) => {
    try {
        const examId = req.params.examId;

        // Find and delete all submissions for this exam
        const result = await Submission.deleteMany({ examId });

        res.json({ 
            message: `Xóa ${result.deletedCount} bài làm thành công`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting exam submissions:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài làm' });
    }
};

