import express from 'express';
import { Question, Part1Question, Part2Question, Part3Question, Part4Question, Part5Question, Part6Question, Part7Question } from '../models/Question.js';
import { Exam } from '../models/Exam.js';
import { protect, admin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Cấu hình multer cho audio và image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = file.fieldname === 'audio' ? 'audio' : 'images';
        const dir = `./uploads/${type}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cho audio
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'audio') {
            const allowedTypes = /mp3|wav|m4a/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            if (extname) return cb(null, true);
            cb(new Error('Chỉ chấp nhận file audio (mp3, wav, m4a)'));
        } else if (file.fieldname === 'image') {
            const allowedTypes = /jpeg|jpg|png|gif/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            if (extname) return cb(null, true);
            cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)'));
        } else {
            cb(null, true);
        }
    }
});

// @route   GET /api/questions/exam/:examId
// @desc    Lấy tất cả câu hỏi của một exam
// @access  Public (để làm bài test)
router.get('/exam/:examId', async (req, res) => {
    try {
        const { part } = req.query;

        const filter = { examId: req.params.examId };
        if (part) filter.part = parseInt(part);

        const questions = await Question.find(filter).sort({ part: 1, questionNumber: 1 });

        console.log('📚 Fetching questions for exam:', req.params.examId);
        console.log('   Filter:', filter);
        console.log('   Found:', questions.length, 'questions');
        
        if (questions.length > 0) {
            console.log('   First question:', {
                _id: questions[0]._id,
                part: questions[0].part,
                questionNumber: questions[0].questionNumber,
                type: questions[0].questionType,
                audioUrl: questions[0].audioUrl,
                imageUrl: questions[0].imageUrl
            });
        }

        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách câu hỏi' });
    }
});

// @route   GET /api/questions/exam/:examId/part/:partNumber
// @desc    Lấy câu hỏi theo part
// @access  Public
router.get('/exam/:examId/part/:partNumber', async (req, res) => {
    try {
        const { examId, partNumber } = req.params;

        const questions = await Question.find({ 
            examId, 
            part: parseInt(partNumber) 
        }).sort({ questionNumber: 1 });

        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions by part:', error);
        res.status(500).json({ message: 'Lỗi khi lấy câu hỏi theo part' });
    }
});

// @route   GET /api/questions/:id
// @desc    Lấy chi tiết một câu hỏi
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('examId', 'title');

        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        }

        res.json(question);
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Lỗi khi lấy câu hỏi' });
    }
});

// @route   POST /api/questions/part1
// @desc    Tạo câu hỏi Part 1
// @access  Private/Admin
router.post('/part1', protect, admin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const { examId, questionNumber, correctAnswer, explanation } = req.body;

        if (!examId || !questionNumber || !correctAnswer) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (!req.files || !req.files.audio || !req.files.image) {
            return res.status(400).json({ message: 'Part 1 yêu cầu cả audio và image' });
        }

        const question = await Part1Question.create({
            examId,
            part: 1,
            questionNumber: parseInt(questionNumber),
            correctAnswer: correctAnswer.toUpperCase(),
            explanation,
            audioUrl: `/uploads/audio/${req.files.audio[0].filename}`,
            imageUrl: `/uploads/images/${req.files.image[0].filename}`
        });

        res.status(201).json({
            message: 'Tạo câu hỏi Part 1 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 1 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 1' });
    }
});

// @route   POST /api/questions/part2
// @desc    Tạo câu hỏi Part 2
// @access  Private/Admin
router.post('/part2', protect, admin, upload.single('audio'), async (req, res) => {
    try {
        const { examId, questionNumber, correctAnswer, explanation } = req.body;

        if (!examId || !questionNumber || !correctAnswer) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Part 2 yêu cầu audio' });
        }

        const question = await Part2Question.create({
            examId,
            part: 2,
            questionNumber: parseInt(questionNumber),
            correctAnswer: correctAnswer.toUpperCase(),
            explanation,
            audioUrl: `/uploads/audio/${req.file.filename}`
        });

        res.status(201).json({
            message: 'Tạo câu hỏi Part 2 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 2 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 2' });
    }
});

// @route   POST /api/questions/part3
// @desc    Tạo câu hỏi Part 3 (conversation với 3 câu hỏi)
// @access  Private/Admin
router.post('/part3', protect, admin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const { examId, conversationNumber, questions, explanation } = req.body;

        if (!examId || !conversationNumber || !questions) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (!req.files || !req.files.audio) {
            return res.status(400).json({ message: 'Part 3 yêu cầu audio' });
        }

        // Parse questions từ JSON string
        const parsedQuestions = JSON.parse(questions);

        if (parsedQuestions.length !== 3) {
            return res.status(400).json({ message: 'Part 3 phải có đúng 3 câu hỏi' });
        }

        const questionData = {
            examId,
            part: 3,
            conversationNumber: parseInt(conversationNumber),
            questionNumber: parsedQuestions[0].questionNumber, // Lấy số câu đầu tiên
            correctAnswer: parsedQuestions[0].correctAnswer, // Đáp án câu đầu
            explanation,
            audioUrl: `/uploads/audio/${req.files.audio[0].filename}`,
            questions: parsedQuestions
        };

        if (req.files.image) {
            questionData.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
        }

        const question = await Part3Question.create(questionData);

        res.status(201).json({
            message: 'Tạo câu hỏi Part 3 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 3 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 3' });
    }
});

// @route   POST /api/questions/part4
// @desc    Tạo câu hỏi Part 4 (talk với 3 câu hỏi)
// @access  Private/Admin
router.post('/part4', protect, admin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const { examId, talkNumber, questions, explanation } = req.body;

        if (!examId || !talkNumber || !questions) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (!req.files || !req.files.audio) {
            return res.status(400).json({ message: 'Part 4 yêu cầu audio' });
        }

        const parsedQuestions = JSON.parse(questions);

        if (parsedQuestions.length !== 3) {
            return res.status(400).json({ message: 'Part 4 phải có đúng 3 câu hỏi' });
        }

        const questionData = {
            examId,
            part: 4,
            talkNumber: parseInt(talkNumber),
            questionNumber: parsedQuestions[0].questionNumber,
            correctAnswer: parsedQuestions[0].correctAnswer,
            explanation,
            audioUrl: `/uploads/audio/${req.files.audio[0].filename}`,
            questions: parsedQuestions
        };

        if (req.files.image) {
            questionData.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
        }

        const question = await Part4Question.create(questionData);

        res.status(201).json({
            message: 'Tạo câu hỏi Part 4 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 4 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 4' });
    }
});

// @route   POST /api/questions/part5
// @desc    Tạo câu hỏi Part 5
// @access  Private/Admin
router.post('/part5', protect, admin, async (req, res) => {
    try {
        const { examId, questionNumber, sentence, options, correctAnswer, grammarPoint, explanation } = req.body;

        if (!examId || !questionNumber || !sentence || !options || !correctAnswer) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;

        const question = await Part5Question.create({
            examId,
            part: 5,
            questionNumber: parseInt(questionNumber),
            sentence,
            options: parsedOptions,
            correctAnswer: correctAnswer.toUpperCase(),
            grammarPoint,
            explanation
        });

        res.status(201).json({
            message: 'Tạo câu hỏi Part 5 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 5 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 5' });
    }
});

// @route   POST /api/questions/part6
// @desc    Tạo câu hỏi Part 6
// @access  Private/Admin
router.post('/part6', protect, admin, async (req, res) => {
    try {
        const { examId, passageNumber, passageText, questions, explanation } = req.body;

        if (!examId || !passageNumber || !passageText || !questions) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const parsedQuestions = JSON.parse(questions);

        if (parsedQuestions.length !== 4) {
            return res.status(400).json({ message: 'Part 6 phải có đúng 4 câu hỏi' });
        }

        const question = await Part6Question.create({
            examId,
            part: 6,
            passageNumber: parseInt(passageNumber),
            questionNumber: parsedQuestions[0].questionNumber,
            correctAnswer: parsedQuestions[0].correctAnswer,
            passageText,
            questions: parsedQuestions,
            explanation
        });

        res.status(201).json({
            message: 'Tạo câu hỏi Part 6 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 6 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 6' });
    }
});

// @route   POST /api/questions/part7
// @desc    Tạo câu hỏi Part 7
// @access  Private/Admin
router.post('/part7', protect, admin, async (req, res) => {
    try {
        const { examId, passageNumber, passageType, passages, questions, explanation } = req.body;

        if (!examId || !passageNumber || !passageType || !passages || !questions) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const parsedPassages = JSON.parse(passages);
        const parsedQuestions = JSON.parse(questions);

        if (parsedQuestions.length < 2 || parsedQuestions.length > 5) {
            return res.status(400).json({ message: 'Part 7 phải có từ 2-5 câu hỏi' });
        }

        const question = await Part7Question.create({
            examId,
            part: 7,
            passageNumber: parseInt(passageNumber),
            questionNumber: parsedQuestions[0].questionNumber,
            correctAnswer: parsedQuestions[0].correctAnswer,
            passageType,
            passages: parsedPassages,
            questions: parsedQuestions,
            explanation
        });

        res.status(201).json({
            message: 'Tạo câu hỏi Part 7 thành công',
            question
        });
    } catch (error) {
        console.error('Error creating Part 7 question:', error);
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi Part 7' });
    }
});

// @route   PUT /api/questions/:id
// @desc    Cập nhật câu hỏi
// @access  Private/Admin
router.put('/:id', protect, admin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        }

        // Update common fields
        const { correctAnswer, explanation } = req.body;
        if (correctAnswer) question.correctAnswer = correctAnswer.toUpperCase();
        if (explanation !== undefined) question.explanation = explanation;

        // Update files if provided
        if (req.files) {
            if (req.files.audio && question.audioUrl) {
                // Delete old audio
                const oldAudioPath = `.${question.audioUrl}`;
                if (fs.existsSync(oldAudioPath)) {
                    fs.unlinkSync(oldAudioPath);
                }
                question.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
            }

            if (req.files.image && question.imageUrl) {
                // Delete old image
                const oldImagePath = `.${question.imageUrl}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                question.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
            }
        }

        // Update part-specific fields based on questionType
        // (Add more specific updates based on part type)

        await question.save();

        res.json({
            message: 'Cập nhật câu hỏi thành công',
            question
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật câu hỏi' });
    }
});

// @route   DELETE /api/questions/:id
// @desc    Xóa câu hỏi
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
        }

        // Delete associated files
        if (question.audioUrl) {
            const audioPath = `.${question.audioUrl}`;
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }
        }

        if (question.imageUrl) {
            const imagePath = `.${question.imageUrl}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await question.deleteOne();

        res.json({ message: 'Xóa câu hỏi thành công' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Lỗi khi xóa câu hỏi' });
    }
});

export default router;