import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        authorName: {
            type: String,
            required: true
        },
        tags: [{
            type: String,
            trim: true
        }],
        category: {
            type: String,
            enum: ['Grammar', 'Vocabulary', 'Pronunciation', 'Listening', 'Speaking', 'Reading', 'Writing', 'Tips & Tricks', 'Resources', 'Other'],
            default: 'Other'
        },
        imageUrl: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        views: {
            type: Number,
            default: 0
        },
        relatedCourse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        relatedLesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        }
    },
    {
        timestamps: true
    }
);

// Index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Blog', blogSchema);