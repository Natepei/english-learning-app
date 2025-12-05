import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    exerciseResults: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        },
        answer: String,
        isCorrect: Boolean,
        completedAt: Date
    }],
    score: Number
}, {
    timestamps: true
});

export default mongoose.model('Progress', progressSchema);