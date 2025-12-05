import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
    {
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        question: {
            type: String,
            required: true,
        },
        options: [String], // Câu trả lời cho bài tập dạng multiple-choice
        answer: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['multiple-choice', 'fill-in-the-blank'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Exercise', exerciseSchema);
