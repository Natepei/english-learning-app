import mongoose from 'mongoose';

// ===== BASE QUESTION SCHEMA =====
const baseQuestionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    part: {
        type: Number,
        required: true,
        min: 1,
        max: 7
    },
    questionNumber: {
        type: Number,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true,
        uppercase: true
    },
    explanation: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    discriminatorKey: 'questionType' // Để phân biệt loại câu hỏi
});

// Index
baseQuestionSchema.index({ examId: 1, part: 1, questionNumber: 1 });

// Base model
export const Question = mongoose.model('Question', baseQuestionSchema);

// ===== PART 1: PHOTOGRAPHS =====
const part1Schema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: [true, 'Part 1 yêu cầu hình ảnh']
    },
    audioUrl: {
        type: String,
        default: null // Optional - can be added later
    }
});

export const Part1Question = Question.discriminator('Part1', part1Schema);

// ===== PART 2: QUESTION-RESPONSE =====
const part2Schema = new mongoose.Schema({
    audioUrl: {
        type: String,
        default: null // Optional - can be added later
    }
});

export const Part2Question = Question.discriminator('Part2', part2Schema);

// ===== PART 3: SHORT CONVERSATIONS =====
const part3Schema = new mongoose.Schema({
    // Mỗi conversation có 3 câu hỏi
    conversationNumber: {
        type: Number,
        required: true
    },
    audioUrl: {
        type: String,
        default: null // Optional - can be added later
    },
    imageUrl: {
        type: String,
        default: null // Optional visual aid
    },
    questions: [{
        questionNumber: {
            type: Number,
            required: true
        },
        questionText: {
            type: String,
            required: true
        },
        options: {
            A: { type: String, required: true },
            B: { type: String, required: true },
            C: { type: String, required: true },
            D: { type: String, required: true }
        },
        correctAnswer: {
            type: String,
            required: true,
            uppercase: true,
            enum: ['A', 'B', 'C', 'D']
        }
    }]
});

// Validate: Part 3 phải có đúng 3 câu hỏi
part3Schema.pre('save', function(next) {
    if (this.questions.length !== 3) {
        next(new Error('Part 3 conversation phải có đúng 3 câu hỏi'));
    }
    next();
});

export const Part3Question = Question.discriminator('Part3', part3Schema);

// ===== PART 4: SHORT TALKS =====
const part4Schema = new mongoose.Schema({
    // Mỗi talk có 3 câu hỏi
    talkNumber: {
        type: Number,
        required: true
    },
    audioUrl: {
        type: String,
        default: null // Optional - can be added later
    },
    imageUrl: {
        type: String,
        default: null // Optional visual aid
    },
    questions: [{
        questionNumber: {
            type: Number,
            required: true
        },
        questionText: {
            type: String,
            required: true
        },
        options: {
            A: { type: String, required: true },
            B: { type: String, required: true },
            C: { type: String, required: true },
            D: { type: String, required: true }
        },
        correctAnswer: {
            type: String,
            required: true,
            uppercase: true,
            enum: ['A', 'B', 'C', 'D']
        }
    }]
});

// Validate: Part 4 phải có đúng 3 câu hỏi
part4Schema.pre('save', function(next) {
    if (this.questions.length !== 3) {
        next(new Error('Part 4 talk phải có đúng 3 câu hỏi'));
    }
    next();
});

export const Part4Question = Question.discriminator('Part4', part4Schema);

// ===== PART 5: INCOMPLETE SENTENCES =====
const part5Schema = new mongoose.Schema({
    sentence: {
        type: String,
        required: [true, 'Part 5 yêu cầu câu văn']
    },
    options: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true }
    },
    grammarPoint: {
        type: String,
        trim: true
        // VD: "Verb tense", "Preposition", "Word form"
    }
});

export const Part5Question = Question.discriminator('Part5', part5Schema);

// ===== PART 6: TEXT COMPLETION =====
const part6Schema = new mongoose.Schema({
    // Mỗi passage có 4 câu hỏi
    passageNumber: {
        type: Number,
        required: true
    },
    passageText: {
        type: String,
        required: [true, 'Part 6 yêu cầu đoạn văn']
    },
    questions: [{
        questionNumber: {
            type: Number,
            required: true
        },
        blankPosition: {
            type: Number,
            required: true // Vị trí chỗ trống trong đoạn văn
        },
        options: {
            A: { type: String, required: true },
            B: { type: String, required: true },
            C: { type: String, required: true },
            D: { type: String, required: true }
        },
        correctAnswer: {
            type: String,
            required: true,
            uppercase: true,
            enum: ['A', 'B', 'C', 'D']
        }
    }]
});

// Validate: Part 6 phải có đúng 4 câu hỏi
part6Schema.pre('save', function(next) {
    if (this.questions.length !== 4) {
        next(new Error('Part 6 passage phải có đúng 4 câu hỏi'));
    }
    next();
});

export const Part6Question = Question.discriminator('Part6', part6Schema);

// ===== PART 7: READING COMPREHENSION =====
const part7Schema = new mongoose.Schema({
    // Single/Double/Triple passage
    passageType: {
        type: String,
        enum: ['single', 'double', 'triple'],
        required: true
    },
    passageNumber: {
        type: Number,
        required: true
    },
    // Có thể có 1-3 passages
    passages: [{
        title: {
            type: String,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            // VD: "Email", "Article", "Advertisement", "Notice"
            trim: true
        }
    }],
    // Số câu hỏi: 2-5 tùy loại passage
    questions: [{
        questionNumber: {
            type: Number,
            required: true
        },
        questionText: {
            type: String,
            required: true
        },
        options: {
            A: { type: String, required: true },
            B: { type: String, required: true },
            C: { type: String, required: true },
            D: { type: String, required: true }
        },
        correctAnswer: {
            type: String,
            required: true,
            uppercase: true,
            enum: ['A', 'B', 'C', 'D']
        }
    }]
});

// Validate passages theo type
part7Schema.pre('save', function(next) {
    const passageCount = this.passages.length;
    
    if (this.passageType === 'single' && passageCount !== 1) {
        return next(new Error('Single passage phải có đúng 1 passage'));
    }
    if (this.passageType === 'double' && passageCount !== 2) {
        return next(new Error('Double passage phải có đúng 2 passages'));
    }
    if (this.passageType === 'triple' && passageCount !== 3) {
        return next(new Error('Triple passage phải có đúng 3 passages'));
    }
    
    // Validate số câu hỏi (2-5 câu)
    if (this.questions.length < 2 || this.questions.length > 5) {
        return next(new Error('Part 7 phải có từ 2-5 câu hỏi'));
    }
    
    next();
});

export const Part7Question = Question.discriminator('Part7', part7Schema);