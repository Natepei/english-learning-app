import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
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
        content: {
            type: String,
            required: true,
            trim: true
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
);

// Virtual for replies
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment'
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Comment', commentSchema);