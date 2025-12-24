// server/controllers/questionsController.js
import xlsx from 'xlsx';
import fs from 'fs';
import mongoose from 'mongoose';
import { 
    Question,
    Part1Question, 
    Part2Question, 
    Part3Question, 
    Part4Question, 
    Part5Question, 
    Part6Question, 
    Part7Question 
} from '../models/Question.js';
import { Passage } from '../models/Passage.js'; // Import the new Passage model
import { Exam } from '../models/Exam.js';

// ===== HELPER FUNCTIONS =====
const extractCorrectAnswer = (value) => {
    if (!value || value === undefined || value === null) {
        return null;
    }
    
    const str = value.toString().trim().toUpperCase();
    if (!str) return null;
    
    // Remove ALL spaces and try to match letter
    const noSpaces = str.replace(/\s/g, '');
    const match = noSpaces.match(/^\(?([A-D])\)?/);
    if (match) return match[1];
    
    // Fallback: find first A-D letter
    const anyMatch = str.match(/([A-D])/);
    return anyMatch ? anyMatch[1] : null;
};

const ensureValidOptions = (rowData) => {
    return {
        A: String(rowData.optionA || '').trim() || '(Empty)',
        B: String(rowData.optionB || '').trim() || '(Empty)',
        C: String(rowData.optionC || '').trim() || '(Empty)',
        D: String(rowData.optionD || '').trim() || '(Empty)'
    };
};

const findFile = (filename, fileMap) => {
    if (!filename) return null;
    const normalized = filename.toLowerCase().trim();
    return fileMap.get(normalized) || null;
};

const groupByPassageOrOrder = (rows, expectedSize = null) => {
    const groups = [];
    let currentGroup = [];
    let currentPassage = null;
    for (const row of rows) {
        const passage = (row.data.questionPassage || '').trim();
        if (passage && passage !== currentPassage) {
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
            }
            currentGroup = [row];
            currentPassage = passage;
        } else {
            currentGroup.push(row);
        }
        if (expectedSize && currentGroup.length === expectedSize) {
            groups.push(currentGroup);
            currentGroup = [];
            currentPassage = null;
        }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
};

const parsePassagesFromGroup = (group) => {
    const passageContent = group.find(g => (g.data.questionPassage || '').trim())?.data.questionPassage || '';
    return [{
        title: '',
        content: passageContent,
        type: ''
    }];
};

// ===== PART PROCESSORS =====
const processPart1 = async (rows, examId, audioMap, imageMap, results) => {
    for (const { row: rowNum, data: rowData } of rows) {
        try {
            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
            const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
            
            if (!questionNumber) throw new Error('Missing questionNumber');
            if (!correctAnswer) throw new Error(`Missing correctAnswer (got: ${rowData.correctOption})`);
            if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                throw new Error(`Invalid correctAnswer: "${correctAnswer}"`);
            }

            const questionData = {
                examId,
                part: 1,
                questionNumber,
                questionText: rowData.questionScript || rowData.questionContent || '',
                options: ensureValidOptions(rowData),
                correctAnswer,
                explanation: rowData.questionExplanation || ''
            };

            const audioFile = (rowData.questionAudio || '').trim();
            const imageFile = (rowData.questionImage || '').trim();

            if (audioFile) {
                const audioUrl = findFile(audioFile, audioMap);
                if (audioUrl) questionData.audioUrl = audioUrl;
                else throw new Error(`Audio file not found: ${audioFile}`);
            }

            if (imageFile) {
                const imageUrl = findFile(imageFile, imageMap);
                if (imageUrl) questionData.imageUrl = imageUrl;
                else throw new Error(`Image file not found: ${imageFile}`);
            }

            await Part1Question.create(questionData);
            results.success++;
            results.details.push(`✅ Part 1 Q${questionNumber}`);
        } catch (error) {
            results.failed++;
            results.errors.push(`Row ${rowNum} (Part 1 Q${rowData.orderNumber || '?'}) : ${error.message}`);
        }
    }
};

const processPart2 = async (rows, examId, audioMap, results) => {
    for (const { row: rowNum, data: rowData } of rows) {
        try {
            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
            const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
            
            if (!questionNumber) throw new Error('Missing questionNumber');
            if (!correctAnswer) throw new Error('Missing correctAnswer');
            if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                throw new Error(`Invalid correctAnswer: "${correctAnswer}"`);
            }

            const audioFile = (rowData.questionAudio || '').trim();
            const audioUrl = audioFile ? findFile(audioFile, audioMap) : null;
            if (!audioUrl) throw new Error(`Audio file not found: ${audioFile}`);

            await Part2Question.create({
                examId,
                part: 2,
                questionNumber,
                questionText: rowData.questionScript || rowData.questionContent || '',
                options: ensureValidOptions(rowData),
                correctAnswer,
                explanation: rowData.questionExplanation || '',
                audioUrl
            });
            results.success++;
            results.details.push(`✅ Part 2 Q${questionNumber}`);
        } catch (error) {
            results.failed++;
            results.errors.push(`Row ${rowNum} (Part 2 Q${rowData.orderNumber || '?'}) : ${error.message}`);
        }
    }
};

const processPart3 = async (rows, examId, audioMap, imageMap, results) => {
    const groups = groupByPassageOrOrder(rows, 3);
    let conversationNumber = 1;
    for (const group of groups) {
        try {
            if (group.length !== 3) throw new Error(`Part 3 expects 3 questions per conversation, got ${group.length}`);

            const firstRow = group[0].data;
            const audioFile = (firstRow.questionAudio || '').trim();
            const imageFile = (firstRow.questionImage || '').trim();
            const audioUrl = audioFile ? findFile(audioFile, audioMap) : null;
            const imageUrl = imageFile ? findFile(imageFile, imageMap) : null;
            if (!audioUrl) throw new Error(`Audio file not found for conversation ${conversationNumber}: ${audioFile}`);

            const groupId = new mongoose.Types.ObjectId();

            const questionsData = group.map(({ data: rowData }) => {
                const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
                
                if (!questionNumber) throw new Error(`Missing questionNumber in group`);
                if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    throw new Error(`Invalid correctAnswer for Q${questionNumber}`);
                }

                return {
                    examId,
                    part: 3,
                    questionNumber,
                    questionText: rowData.questionContent || rowData.questionScript || '',
                    options: ensureValidOptions(rowData),
                    correctAnswer,
                    explanation: rowData.questionExplanation || firstRow.questionExplanation || '',
                    audioUrl,
                    imageUrl,
                    groupId,
                    groupType: 'conversation',
                    groupNumber: conversationNumber
                };
            });

            await Part3Question.insertMany(questionsData);
            results.success += 3;
            results.details.push(`✅ Part 3 Conversation ${conversationNumber} (Q${questionsData[0].questionNumber}-${questionsData[2].questionNumber})`);
            conversationNumber++;
        } catch (error) {
            results.failed += group.length;
            results.errors.push(`Part 3 Conversation ${conversationNumber}: ${error.message}`);
        }
    }
};

const processPart4 = async (rows, examId, audioMap, imageMap, results) => {
    const groups = groupByPassageOrOrder(rows, 3);
    let talkNumber = 1;
    for (const group of groups) {
        try {
            if (group.length !== 3) throw new Error(`Part 4 expects 3 questions per talk, got ${group.length}`);

            const firstRow = group[0].data;
            const audioFile = (firstRow.questionAudio || '').trim();
            const imageFile = (firstRow.questionImage || '').trim();
            const audioUrl = audioFile ? findFile(audioFile, audioMap) : null;
            const imageUrl = imageFile ? findFile(imageFile, imageMap) : null;
            if (!audioUrl) throw new Error(`Audio file not found for talk ${talkNumber}: ${audioFile}`);

            const groupId = new mongoose.Types.ObjectId();

            const questionsData = group.map(({ data: rowData }) => {
                const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
                
                if (!questionNumber) throw new Error(`Missing questionNumber in group`);
                if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    throw new Error(`Invalid correctAnswer for Q${questionNumber}`);
                }

                return {
                    examId,
                    part: 4,
                    questionNumber,
                    questionText: rowData.questionContent || rowData.questionScript || '',
                    options: ensureValidOptions(rowData),
                    correctAnswer,
                    explanation: rowData.questionExplanation || firstRow.questionExplanation || '',
                    audioUrl,
                    imageUrl,
                    groupId,
                    groupType: 'talk',
                    groupNumber: talkNumber
                };
            });

            await Part4Question.insertMany(questionsData);
            results.success += 3;
            results.details.push(`✅ Part 4 Talk ${talkNumber} (Q${questionsData[0].questionNumber}-${questionsData[2].questionNumber})`);
            talkNumber++;
        } catch (error) {
            results.failed += group.length;
            results.errors.push(`Part 4 Talk ${talkNumber}: ${error.message}`);
        }
    }
};

const processPart5 = async (rows, examId, results) => {
    for (const { row: rowNum, data: rowData } of rows) {
        try {
            const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
            const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
            
            if (!questionNumber) throw new Error('Missing questionNumber');
            if (!correctAnswer) throw new Error('Missing correctAnswer');
            if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                throw new Error(`Invalid correctAnswer: "${correctAnswer}"`);
            }

            await Part5Question.create({
                examId,
                part: 5,
                questionNumber,
                questionText: rowData.questionContent || rowData.questionScript || '',
                options: ensureValidOptions(rowData),
                correctAnswer,
                grammarPoint: rowData.grammarPoint || '',
                explanation: rowData.questionExplanation || ''
            });
            results.success++;
            results.details.push(`✅ Part 5 Q${questionNumber}`);
        } catch (error) {
            results.failed++;
            results.errors.push(`Row ${rowNum} (Part 5 Q${rowData.orderNumber || '?'}) : ${error.message}`);
        }
    }
};

const processPart6 = async (rows, examId, results) => {
    const groups = groupByPassageOrOrder(rows, 4);
    let passageNumber = 1;
    for (const group of groups) {
        try {
            if (group.length !== 4) throw new Error(`Part 6 expects 4 questions per passage, got ${group.length}`);

            const firstRow = group[0].data;

            // Step 1: Create Passage
            const passage = await Passage.create({
                examId,
                part: 6,
                passageNumber,
                passageType: 'single',
                passages: parsePassagesFromGroup(group),
                questionNumbers: group.map(g => parseInt(g.data.orderNumber || g.data.questionNumber))
            });

            // Step 2: Create flat questions with default questionText if empty (fixes the validation error)
            const questionsData = group.map(({ data: rowData }, index) => {
                const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
                
                if (!questionNumber) throw new Error(`Missing questionNumber in group`);
                if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    throw new Error(`Invalid correctAnswer for Q${questionNumber}`);
                }

                // Default if empty (TOEIC Part 6 style)
                let questionText = rowData.questionContent || rowData.questionScript || '';
                if (!questionText.trim()) {
                    questionText = `Select the best word or phrase for blank ${index + 1} (Question ${questionNumber})`;
                }

                return {
                    examId,
                    part: 6,
                    questionNumber,
                    questionText,
                    options: ensureValidOptions(rowData),
                    correctAnswer,
                    explanation: rowData.questionExplanation || firstRow.questionExplanation || '',
                    groupId: passage._id,
                    groupType: 'passage',
                    groupNumber: passageNumber
                };
            });

            await Part6Question.insertMany(questionsData);
            results.success += 4;
            results.details.push(`✅ Part 6 Passage ${passageNumber} (Q${questionsData[0].questionNumber}-${questionsData[3].questionNumber})`);
            passageNumber++;
        } catch (error) {
            results.failed += group.length;
            results.errors.push(`Part 6 Passage ${passageNumber}: ${error.message}`);
        }
    }
};

const processPart7 = async (rows, examId, results) => {
    const groups = groupByPassageOrOrder(rows);
    let passageNumber = 1;
    for (const group of groups) {
        try {
            const numQuestions = group.length;
            if (numQuestions < 2 || numQuestions > 5) throw new Error(`Part 7 expects 2-5 questions per passage, got ${numQuestions}`);

            const firstRow = group[0].data;
            const passageType = firstRow.passageType || 'single'; // If column exists, else default

            // Step 1: Create Passage
            const passage = await Passage.create({
                examId,
                part: 7,
                passageNumber,
                passageType,
                passages: parsePassagesFromGroup(group),
                questionNumbers: group.map(g => parseInt(g.data.orderNumber || g.data.questionNumber))
            });

            // Step 2: Create flat questions
            const questionsData = group.map(({ data: rowData }) => {
                const questionNumber = parseInt(rowData.orderNumber) || parseInt(rowData.questionNumber);
                const correctAnswer = extractCorrectAnswer(rowData.correctOption || rowData.correctAnswer);
                
                if (!questionNumber) throw new Error(`Missing questionNumber in group`);
                if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    throw new Error(`Invalid correctAnswer for Q${questionNumber}`);
                }

                return {
                    examId,
                    part: 7,
                    questionNumber,
                    questionText: rowData.questionContent || rowData.questionScript || '',
                    options: ensureValidOptions(rowData),
                    correctAnswer,
                    explanation: rowData.questionExplanation || firstRow.questionExplanation || '',
                    groupId: passage._id,
                    groupType: 'passage',
                    groupNumber: passageNumber
                };
            });

            await Part7Question.insertMany(questionsData);
            results.success += numQuestions;
            results.details.push(`✅ Part 7 Passage ${passageNumber} (Q${questionsData[0].questionNumber}-${questionsData[numQuestions-1].questionNumber})`);
            passageNumber++;
        } catch (error) {
            results.failed += group.length;
            results.errors.push(`Part 7 Passage ${passageNumber}: ${error.message}`);
        }
    }
};

export const bulkUploadQuestions = async (req, res) => {
    try {
        if (!req.files || !req.files.excel) {
            return res.status(400).json({ message: 'Vui lòng upload file Excel' });
        }

        const excelFile = req.files.excel[0];
        const workbook = xlsx.readFile(excelFile.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { blankrows: false, defval: '' });

        console.log(`\n📋 Raw request data:`);
        console.log(`   req.body:`, req.body);
        console.log(`   req.query:`, req.query);

        const examId = req.body.examId || req.query.examId;
        console.log(`   Extracted examId: ${examId}`);
        
        if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
            throw new Error('Invalid or missing examId');
        }

        // ===== VALIDATION: Check current question count =====
        const currentQuestionCount = await Question.countDocuments({ examId });
        const newQuestionsCount = data.length;
        const totalWillBe = currentQuestionCount + newQuestionsCount;
        
        console.log(`\n📊 Question Count Check:`);
        console.log(`   Exam ID: ${examId}`);
        console.log(`   Current questions: ${currentQuestionCount}`);
        console.log(`   New questions from Excel: ${newQuestionsCount}`);
        console.log(`   Total will be: ${totalWillBe}`);
        
        const MAX_QUESTIONS = 200;
        if (totalWillBe > MAX_QUESTIONS) {
            console.log(`   ❌ BLOCKED: Total ${totalWillBe} exceeds limit ${MAX_QUESTIONS}`);
            fs.unlinkSync(excelFile.path);
            return res.status(400).json({ 
                message: `Không thể thêm câu hỏi. Hiện tại đã có ${currentQuestionCount} câu, sắp thêm ${newQuestionsCount} câu, tổng sẽ là ${totalWillBe} câu (vượt quá giới hạn ${MAX_QUESTIONS} câu)`,
                currentCount: currentQuestionCount,
                newCount: newQuestionsCount,
                totalWillBe: totalWillBe,
                maxAllowed: MAX_QUESTIONS
            });
        }
        console.log(`   ✅ OK: Within limit`);

        const audioMap = new Map(req.files.audio ? req.files.audio.map(file => [file.originalname.toLowerCase(), `/uploads/audio/${file.filename}`]) : []);
        const imageMap = new Map(req.files.image ? req.files.image.map(file => [file.originalname.toLowerCase(), `/uploads/images/${file.filename}`]) : []);

        console.log(`🎵 Audio files: ${audioMap.size}`);
        console.log(`🖼️ Image files: ${imageMap.size}`);

        const results = { success: 0, failed: 0, errors: [], details: [] };

        const questionsByPart = {};
        data.forEach((row, index) => {
            const part = parseInt(row.questionPart) || parseInt(row.part) || 1;
            if (!questionsByPart[part]) questionsByPart[part] = [];
            questionsByPart[part].push({ row: index + 2, data: row, orderNumber: parseInt(row.orderNumber) || index + 1 });
        });

        Object.values(questionsByPart).forEach(questions => questions.sort((a, b) => a.orderNumber - b.orderNumber));

        for (const [partStr, rows] of Object.entries(questionsByPart)) {
            const part = parseInt(partStr);
            console.log(`\n📝 Processing Part ${part}: ${rows.length} rows`);
            switch (part) {
                case 1: await processPart1(rows, examId, audioMap, imageMap, results); break;
                case 2: await processPart2(rows, examId, audioMap, results); break;
                case 3: await processPart3(rows, examId, audioMap, imageMap, results); break;
                case 4: await processPart4(rows, examId, audioMap, imageMap, results); break;
                case 5: await processPart5(rows, examId, results); break;
                case 6: await processPart6(rows, examId, results); break;
                case 7: await processPart7(rows, examId, results); break;
                default: console.warn(`⚠️ Unknown part: ${part}`);
            }
        }

        fs.unlinkSync(excelFile.path);

        console.log(`\n✅ Upload completed: ${results.success} success, ${results.failed} failed`);

        res.status(200).json({
            message: `Upload hoàn tất: ${results.success} câu hỏi thành công, ${results.failed} câu hỏi thất bại`,
            results
        });
    } catch (error) {
        console.error('❌ Error in bulk upload:', error);
        if (req.files?.excel) fs.unlinkSync(req.files.excel[0].path);
        res.status(500).json({ message: 'Lỗi khi upload Excel', error: error.message });
    }
};