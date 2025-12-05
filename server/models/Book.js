import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tên bộ đề'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Vui lòng nhập năm xuất bản']
    },
    imageUrl: {
        type: String,
        default: null
    },
    // Số lượng bài test trong bộ đề
    examCount: {
        type: Number,
        default: 0
    },
    // Người tạo (admin)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Trạng thái active/inactive
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index để tìm kiếm nhanh
bookSchema.index({ title: 1, year: 1 });

// Virtual để lấy danh sách exams
bookSchema.virtual('exams', {
    ref: 'Exam',
    localField: '_id',
    foreignField: 'bookId'
});

// Middleware để cập nhật examCount khi có exam mới
bookSchema.methods.updateExamCount = async function() {
    const Exam = mongoose.model('Exam');
    const count = await Exam.countDocuments({ bookId: this._id });
    this.examCount = count;
    await this.save();
};

export const Book = mongoose.model('Book', bookSchema);