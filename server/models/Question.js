// models/Question.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ===== BASE QUESTION SCHEMA =====
// Common fields for EVERY question (flat structure)
const baseQuestionSchema = new Schema({
    examId: { 
        type: Schema.Types.ObjectId, 
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
    questionText: { 
        type: String, 
        required: true, 
        trim: true 
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
    },
    explanation: { 
        type: String, 
        trim: true 
    },
    audioUrl: { 
        type: String 
    },
    imageUrl: { 
        type: String 
    },
    // Grouping fields (for Parts 3,4,6,7)
    groupId: { 
        type: Schema.Types.ObjectId 
    },
    groupType: { 
        type: String, 
        enum: ['conversation', 'talk', 'passage'] 
    },
    groupNumber: { 
        type: Number 
    }
}, {
    timestamps: true,
    discriminatorKey: 'questionType' // Để phân biệt loại (giữ nguyên cho compatibility)
});

// Indexes for performance
baseQuestionSchema.index({ examId: 1, part: 1, questionNumber: 1 });
baseQuestionSchema.index({ examId: 1, groupId: 1 });
baseQuestionSchema.index({ examId: 1, part: 1, groupNumber: 1 });

// Base model
export const Question = model('Question', baseQuestionSchema);

// ===== PART-SPECIFIC DISCRIMINATORS =====
// Part 1: Photographs
const part1Schema = new Schema({});
export const Part1Question = Question.discriminator('Part1', part1Schema);

// Part 2: Question-Response
const part2Schema = new Schema({});
export const Part2Question = Question.discriminator('Part2', part2Schema);

// Part 3: Short Conversations (now flat, use groupId)
const part3Schema = new Schema({});
export const Part3Question = Question.discriminator('Part3', part3Schema);

// Part 4: Short Talks (now flat, use groupId)
const part4Schema = new Schema({});
export const Part4Question = Question.discriminator('Part4', part4Schema);

// Part 5: Incomplete Sentences
const part5Schema = new Schema({
    grammarPoint: { type: String, trim: true }
});
export const Part5Question = Question.discriminator('Part5', part5Schema);

// Part 6: Text Completion (flat questions, link to Passage via groupId)
const part6Schema = new Schema({});
export const Part6Question = Question.discriminator('Part6', part6Schema);

// Part 7: Reading Comprehension (flat questions, link to Passage via groupId)
const part7Schema = new Schema({});
export const Part7Question = Question.discriminator('Part7', part7Schema);