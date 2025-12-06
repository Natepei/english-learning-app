import express from 'express';
import { Question, Part1Question, Part2Question, Part3Question, Part4Question, Part5Question, Part6Question, Part7Question } from '../models/Question.js';
import { Exam } from '../models/Exam.js';
import { protect, admin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';

const router = express.Router();

// Cấu hình multer cho audio và image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = file.fieldname === 'audio' ? 'audio' : file.fieldname === 'image' ? 'images' : 'temp';
        const dir = `./uploads/${type}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Preserve original filename for bulk upload (check query param or fieldname)
        // For bulk upload, we want to preserve filenames to match Excel references
        if (file.fieldname === 'audio' || file.fieldname === 'image') {
            // Preserve original filename for bulk upload
            cb(null, file.originalname);
        } else {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
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

// @route   POST /api/questions/bulk-upload
// @desc    Upload questions from Excel file with audio/images
// @access  Private/Admin
router.post('/bulk-upload', protect, admin, upload.fields([
    { name: 'excel', maxCount: 1 },
    { name: 'audio', maxCount: 200 },
    { name: 'image', maxCount: 200 }
]), async (req, res) => {
    try {
        const { examId } = req.body;

        if (!examId) {
            return res.status(400).json({ message: 'examId là bắt buộc' });
        }

        if (!req.files || !req.files.excel) {
            return res.status(400).json({ message: 'Vui lòng upload file Excel' });
        }

        // Verify exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi' });
        }

        // Parse Excel file
        const excelFile = req.files.excel[0];
        const workbook = xlsx.readFile(excelFile.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        console.log(`📊 Processing ${data.length} rows from Excel`);

        // Create file maps for quick lookup
        const audioMap = {};
        const imageMap = {};

        if (req.files.audio) {
            req.files.audio.forEach(file => {
                audioMap[file.originalname] = `/uploads/audio/${file.filename}`;
            });
        }

        if (req.files.image) {
            req.files.image.forEach(file => {
                imageMap[file.originalname] = `/uploads/images/${file.filename}`;
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Group questions by part and handle multi-question parts
        const questionsByPart = {};
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const part = parseInt(row.questionPart) || parseInt(row.part) || 1;
                const orderNumber = parseInt(row.orderNumber) || i + 1;

                if (!questionsByPart[part]) {
                    questionsByPart[part] = [];
                }

                questionsByPart[part].push({
                    row: i + 2, // Excel row number (1-indexed + header)
                    data: row,
                    orderNumber
                });
            } catch (error) {
                results.failed++;
                results.errors.push(`Row ${i + 2}: ${error.message}`);
            }
        }

        // Process each part
        for (const [partStr, rows] of Object.entries(questionsByPart)) {
            const part = parseInt(partStr);

            if (part === 1) {
                // Part 1: Individual questions with image and audio
                for (const { row, data: rowData } of rows) {
                    try {
                        const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                        const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                        const imageFile = rowData.questionImage || '';
                        const audioFile = rowData.questionAudio || '';

                        if (!questionNumber || !correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                            throw new Error('Missing or invalid questionNumber/correctAnswer');
                        }

                        const questionData = {
                            examId,
                            part: 1,
                            questionNumber,
                            correctAnswer,
                            explanation: rowData.questionExplanation || ''
                        };

                        if (imageFile && imageMap[imageFile]) {
                            questionData.imageUrl = imageMap[imageFile];
                        } else if (imageFile) {
                            throw new Error(`Image file not found: ${imageFile}`);
                        }

                        if (audioFile && audioMap[audioFile]) {
                            questionData.audioUrl = audioMap[audioFile];
                        } else if (audioFile) {
                            throw new Error(`Audio file not found: ${audioFile}`);
                        }

                        await Part1Question.create(questionData);
                        results.success++;
                    } catch (error) {
                        results.failed++;
                        results.errors.push(`Row ${row} (Part 1): ${error.message}`);
                    }
                }
            } else if (part === 2) {
                // Part 2: Individual questions with audio only
                for (const { row, data: rowData } of rows) {
                    try {
                        const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                        const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                        const audioFile = rowData.questionAudio || '';

                        if (!questionNumber || !correctAnswer || !['A', 'B', 'C'].includes(correctAnswer)) {
                            throw new Error('Missing or invalid questionNumber/correctAnswer');
                        }

                        const questionData = {
                            examId,
                            part: 2,
                            questionNumber,
                            correctAnswer,
                            explanation: rowData.questionExplanation || ''
                        };

                        if (audioFile && audioMap[audioFile]) {
                            questionData.audioUrl = audioMap[audioFile];
                        } else if (audioFile) {
                            throw new Error(`Audio file not found: ${audioFile}`);
                        }

                        await Part2Question.create(questionData);
                        results.success++;
                    } catch (error) {
                        results.failed++;
                        results.errors.push(`Row ${row} (Part 2): ${error.message}`);
                    }
                }
            } else if (part === 3) {
                // Part 3: Group by conversationNumber (3 questions per conversation)
                const conversations = {};
                for (const { row, data: rowData } of rows) {
                    const convNum = parseInt(rowData.questionPassage) || parseInt(rowData.conversationNumber) || Math.ceil((parseInt(rowData.orderNumber) || 1) / 3);
                    if (!conversations[convNum]) {
                        conversations[convNum] = [];
                    }
                    conversations[convNum].push({ row, data: rowData });
                }

                for (const [convNumStr, convRows] of Object.entries(conversations)) {
                    try {
                        if (convRows.length !== 3) {
                            throw new Error(`Conversation must have exactly 3 questions, found ${convRows.length}`);
                        }

                        const questions = convRows.map(({ data: rowData }, idx) => {
                            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                            const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                            
                            return {
                                questionNumber,
                                questionText: rowData.questionContent || rowData.questionScript || '',
                                options: {
                                    A: rowData.optionA || '',
                                    B: rowData.optionB || '',
                                    C: rowData.optionC || '',
                                    D: rowData.optionD || ''
                                },
                                correctAnswer
                            };
                        });

                        const firstRow = convRows[0].data;
                        const audioFile = firstRow.questionAudio || '';
                        const imageFile = firstRow.questionImage || '';

                        const questionData = {
                            examId,
                            part: 3,
                            conversationNumber: parseInt(convNumStr),
                            questionNumber: questions[0].questionNumber,
                            correctAnswer: questions[0].correctAnswer,
                            explanation: firstRow.questionExplanation || '',
                            questions
                        };

                        if (audioFile && audioMap[audioFile]) {
                            questionData.audioUrl = audioMap[audioFile];
                        } else if (audioFile) {
                            throw new Error(`Audio file not found: ${audioFile}`);
                        }

                        if (imageFile && imageMap[imageFile]) {
                            questionData.imageUrl = imageMap[imageFile];
                        }

                        await Part3Question.create(questionData);
                        results.success += 3;
                    } catch (error) {
                        results.failed += convRows.length;
                        results.errors.push(`Conversation ${convNumStr}: ${error.message}`);
                    }
                }
            } else if (part === 4) {
                // Part 4: Group by talkNumber (3 questions per talk)
                const talks = {};
                for (const { row, data: rowData } of rows) {
                    const talkNum = parseInt(rowData.questionPassage) || parseInt(rowData.talkNumber) || Math.ceil((parseInt(rowData.orderNumber) || 1) / 3);
                    if (!talks[talkNum]) {
                        talks[talkNum] = [];
                    }
                    talks[talkNum].push({ row, data: rowData });
                }

                for (const [talkNumStr, talkRows] of Object.entries(talks)) {
                    try {
                        if (talkRows.length !== 3) {
                            throw new Error(`Talk must have exactly 3 questions, found ${talkRows.length}`);
                        }

                        const questions = talkRows.map(({ data: rowData }) => {
                            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                            const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                            
                            return {
                                questionNumber,
                                questionText: rowData.questionContent || rowData.questionScript || '',
                                options: {
                                    A: rowData.optionA || '',
                                    B: rowData.optionB || '',
                                    C: rowData.optionC || '',
                                    D: rowData.optionD || ''
                                },
                                correctAnswer
                            };
                        });

                        const firstRow = talkRows[0].data;
                        const audioFile = firstRow.questionAudio || '';
                        const imageFile = firstRow.questionImage || '';

                        const questionData = {
                            examId,
                            part: 4,
                            talkNumber: parseInt(talkNumStr),
                            questionNumber: questions[0].questionNumber,
                            correctAnswer: questions[0].correctAnswer,
                            explanation: firstRow.questionExplanation || '',
                            questions
                        };

                        if (audioFile && audioMap[audioFile]) {
                            questionData.audioUrl = audioMap[audioFile];
                        } else if (audioFile) {
                            throw new Error(`Audio file not found: ${audioFile}`);
                        }

                        if (imageFile && imageMap[imageFile]) {
                            questionData.imageUrl = imageMap[imageFile];
                        }

                        await Part4Question.create(questionData);
                        results.success += 3;
                    } catch (error) {
                        results.failed += talkRows.length;
                        results.errors.push(`Talk ${talkNumStr}: ${error.message}`);
                    }
                }
            } else if (part === 5) {
                // Part 5: Individual questions
                for (const { row, data: rowData } of rows) {
                    try {
                        const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                        const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                        const sentence = rowData.questionContent || '';

                        if (!questionNumber || !correctAnswer || !sentence) {
                            throw new Error('Missing required fields');
                        }

                        const questionData = {
                            examId,
                            part: 5,
                            questionNumber,
                            sentence,
                            options: {
                                A: rowData.optionA || '',
                                B: rowData.optionB || '',
                                C: rowData.optionC || '',
                                D: rowData.optionD || ''
                            },
                            correctAnswer,
                            explanation: rowData.questionExplanation || ''
                        };

                        await Part5Question.create(questionData);
                        results.success++;
                    } catch (error) {
                        results.failed++;
                        results.errors.push(`Row ${row} (Part 5): ${error.message}`);
                    }
                }
            } else if (part === 6) {
                // Part 6: Group by passageNumber (4 questions per passage)
                const passages = {};
                for (const { row, data: rowData } of rows) {
                    const passageNum = parseInt(rowData.questionPassage) || parseInt(rowData.passageNumber) || Math.ceil((parseInt(rowData.orderNumber) || 1) / 4);
                    if (!passages[passageNum]) {
                        passages[passageNum] = [];
                    }
                    passages[passageNum].push({ row, data: rowData });
                }

                for (const [passageNumStr, passageRows] of Object.entries(passages)) {
                    try {
                        if (passageRows.length !== 4) {
                            throw new Error(`Passage must have exactly 4 questions, found ${passageRows.length}`);
                        }

                        const firstRow = passageRows[0].data;
                        const passageText = firstRow.questionContent || firstRow.questionPassage || '';

                        const questions = passageRows.map(({ data: rowData }, idx) => {
                            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                            const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                            
                            return {
                                questionNumber,
                                blankPosition: idx + 1,
                                options: {
                                    A: rowData.optionA || '',
                                    B: rowData.optionB || '',
                                    C: rowData.optionC || '',
                                    D: rowData.optionD || ''
                                },
                                correctAnswer
                            };
                        });

                        const questionData = {
                            examId,
                            part: 6,
                            passageNumber: parseInt(passageNumStr),
                            passageText,
                            questionNumber: questions[0].questionNumber,
                            correctAnswer: questions[0].correctAnswer,
                            explanation: firstRow.questionExplanation || '',
                            questions
                        };

                        await Part6Question.create(questionData);
                        results.success += 4;
                    } catch (error) {
                        results.failed += passageRows.length;
                        results.errors.push(`Passage ${passageNumStr}: ${error.message}`);
                    }
                }
            } else if (part === 7) {
                // Part 7: Group by passageNumber (variable questions per passage)
                const passages = {};
                for (const { row, data: rowData } of rows) {
                    const passageNum = parseInt(rowData.questionPassage) || parseInt(rowData.passageNumber) || 1;
                    if (!passages[passageNum]) {
                        passages[passageNum] = {
                            questions: [],
                            passages: []
                        };
                    }
                    passages[passageNum].questions.push({ row, data: rowData });
                }

                for (const [passageNumStr, passageData] of Object.entries(passages)) {
                    try {
                        const questions = passageData.questions.map(({ data: rowData }) => {
                            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                            const correctAnswer = (rowData.correctOption || rowData.correctAnswer || '').toString().trim().toUpperCase().replace(/[()]/g, '');
                            
                            return {
                                questionNumber,
                                questionText: rowData.questionContent || '',
                                options: {
                                    A: rowData.optionA || '',
                                    B: rowData.optionB || '',
                                    C: rowData.optionC || '',
                                    D: rowData.optionD || ''
                                },
                                correctAnswer
                            };
                        });

                        if (questions.length < 2 || questions.length > 5) {
                            throw new Error(`Part 7 must have 2-5 questions per passage, found ${questions.length}`);
                        }

                        // Determine passage type and create passages
                        const firstRow = passageData.questions[0].data;
                        const passageContent = firstRow.questionContent || firstRow.questionPassage || '';
                        
                        // For now, assume single passage unless specified
                        const passageType = firstRow.passageType || 'single';
                        const passageArray = [{
                            title: '',
                            content: passageContent,
                            type: ''
                        }];

                        const questionData = {
                            examId,
                            part: 7,
                            passageNumber: parseInt(passageNumStr),
                            passageType,
                            passages: passageArray,
                            questionNumber: questions[0].questionNumber,
                            correctAnswer: questions[0].correctAnswer,
                            explanation: firstRow.questionExplanation || '',
                            questions
                        };

                        await Part7Question.create(questionData);
                        results.success += questions.length;
                    } catch (error) {
                        results.failed += passageData.questions.length;
                        results.errors.push(`Passage ${passageNumStr}: ${error.message}`);
                    }
                }
            }
        }

        // Clean up Excel file
        fs.unlinkSync(excelFile.path);

        res.status(200).json({
            message: `Upload hoàn tất: ${results.success} câu hỏi thành công, ${results.failed} câu hỏi thất bại`,
            results
        });
    } catch (error) {
        console.error('Error in bulk upload:', error);
        res.status(500).json({ 
            message: 'Lỗi khi upload Excel', 
            error: error.message 
        });
    }
});

export default router;