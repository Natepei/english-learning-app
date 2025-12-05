import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        language: {
            type: String,
            default: 'English',
        },
        level: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced'],
            default: 'basic',
        },
        lessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Course', courseSchema);
