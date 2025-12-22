import mongoose from 'mongoose';

const passageSchema = new mongoose.Schema({
    examId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Exam', 
        required: true 
    },
    part: { 
        type: Number, 
        required: true, 
        enum: [6, 7] 
    },
    passageNumber: { 
        type: Number, 
        required: true 
    },
    passageType: { 
        type: String, 
        enum: ['single', 'double', 'triple'], 
        default: 'single' 
    },
    passages: [{
        title: { type: String, trim: true },
        content: { type: String, required: true },
        type: { type: String, trim: true } // e.g., "Email", "Article"
    }],
    questionNumbers: [{ 
        type: Number, 
        required: true 
    }]
}, { timestamps: true });

// Indexes for performance
passageSchema.index({ examId: 1, part: 1, passageNumber: 1 });
passageSchema.index({ examId: 1 });

export const Passage = mongoose.model('Passage', passageSchema);
