import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tên đề thi'],
        trim: true
        // VD: "ETS 2020 - Test 01"
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Vui lòng chọn bộ đề']
    },
    // Thời gian làm bài (phút)
    duration: {
        type: Number,
        default: 120 // 120 phút = 2 giờ
    },
    // Tổng số câu hỏi
    totalQuestions: {
        type: Number,
        default: 200
    },
    // Số câu hỏi theo từng part
    partQuestions: {
        part1: { type: Number, default: 6 },
        part2: { type: Number, default: 25 },
        part3: { type: Number, default: 39 },
        part4: { type: Number, default: 30 },
        part5: { type: Number, default: 30 },
        part6: { type: Number, default: 16 },
        part7: { type: Number, default: 54 }
    },
    // Trạng thái bài test
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    // Người tạo (admin)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Số lần đã làm
    attemptCount: {
        type: Number,
        default: 0
    },
    // Điểm trung bình
    averageScore: {
        type: Number,
        default: 0
    },
    // Active/Inactive
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index để tìm kiếm nhanh
examSchema.index({ bookId: 1, title: 1 });
examSchema.index({ status: 1 });

// Virtual để lấy questions
examSchema.virtual('questions', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'examId'
});

// Method để kiểm tra exam đã hoàn thành chưa
examSchema.methods.isComplete = async function() {
    const Question = mongoose.model('Question');
    const questionCount = await Question.countDocuments({ examId: this._id });
    return questionCount === this.totalQuestions;
};

// Method để cập nhật số lần làm bài
examSchema.methods.updateAttemptCount = async function() {
    const Submission = mongoose.model('Submission');
    const count = await Submission.countDocuments({ examId: this._id, status: 'completed' });
    this.attemptCount = count;
    await this.save();
};

// Method để tính điểm trung bình
examSchema.methods.updateAverageScore = async function() {
    const Submission = mongoose.model('Submission');
    const submissions = await Submission.find({ examId: this._id, status: 'completed' });
    
    if (submissions.length === 0) {
        this.averageScore = 0;
    } else {
        const totalScore = submissions.reduce((sum, sub) => sum + (sub.scores?.total || 0), 0);
        this.averageScore = Math.round(totalScore / submissions.length);
    }
    
    await this.save();
};

export const Exam = mongoose.model('Exam', examSchema);