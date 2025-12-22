import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    // Câu trả lời của user
    answers: [{
        questionNumber: {
            type: Number,
            required: true
        },
        part: {
            type: Number,
            required: true
        },
        userAnswer: {
            type: String,
            uppercase: true
        },
        correctAnswer: {
            type: String,
            uppercase: true,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    }],
    // Điểm số chi tiết
    scores: {
        // Tổng điểm (10-990)
        total: {
            type: Number,
            default: 0,
            min: [0, 'Total score must be at least 0'],
            max: 990
        },
        // Listening (5-495)
        listening: {
            raw: { type: Number, default: 0 }, // Số câu đúng /100
            scaled: { type: Number, default: 0, min: [0, 'Listening scaled must be at least 0'], max: 495 } // Điểm quy đổi
        },
        // Reading (5-495)
        reading: {
            raw: { type: Number, default: 0 }, // Số câu đúng /100
            scaled: { type: Number, default: 0, min: [0, 'Reading scaled must be at least 0'], max: 495 } // Điểm quy đổi
        },
        // Điểm từng part
        parts: {
            part1: { type: Number, default: 0 }, // /6
            part2: { type: Number, default: 0 }, // /25
            part3: { type: Number, default: 0 }, // /39
            part4: { type: Number, default: 0 }, // /30
            part5: { type: Number, default: 0 }, // /30
            part6: { type: Number, default: 0 }, // /16
            part7: { type: Number, default: 0 }  // /54
        }
    },
    // Thời gian làm bài
    timeSpent: {
        type: Number, // Tính bằng giây
        default: 0
    },
    // Thời gian bắt đầu
    startedAt: {
        type: Date,
        default: Date.now
    },
    // Thời gian nộp bài
    completedAt: {
        type: Date
    },
    // Trạng thái
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },
    // Chế độ làm bài
    mode: {
        type: String,
        enum: ['real_exam', 'practice'],
        default: 'practice'
    },
    // Progress tracking
    progress: {
        answeredQuestions: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 200 },
        completedParts: [{ type: Number }]
    }
}, {
    timestamps: true
});

// Index
submissionSchema.index({ userId: 1, examId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ completedAt: -1 });

// Virtual: Tính phần trăm hoàn thành
submissionSchema.virtual('completionPercentage').get(function() {
    return Math.round((this.progress.answeredQuestions / this.progress.totalQuestions) * 100);
});

// Method: Hoàn thành bài test
submissionSchema.methods.complete = function() {
    this.status = 'completed';
    this.completedAt = new Date();
    
    // Calculate time spent (in seconds)
    if (this.startedAt) {
        this.timeSpent = Math.floor((this.completedAt - this.startedAt) / 1000);
    }
    
    this.calculateRawScores();
    this.convertToScaledScore();
    
    // Tính total score
    this.scores.total = Math.round(this.scores.listening.scaled + this.scores.reading.scaled);
};

// Method: Tính điểm raw
submissionSchema.methods.calculateRawScores = function() {
    const partScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    
    this.answers.forEach(answer => {
        if (answer.isCorrect) {
            partScores[answer.part]++;
        }
    });
    
    // Cập nhật scores.parts
    this.scores.parts.part1 = partScores[1];
    this.scores.parts.part2 = partScores[2];
    this.scores.parts.part3 = partScores[3];
    this.scores.parts.part4 = partScores[4];
    this.scores.parts.part5 = partScores[5];
    this.scores.parts.part6 = partScores[6];
    this.scores.parts.part7 = partScores[7];
    
    // Tính listening raw score (Part 1-4)
    this.scores.listening.raw = partScores[1] + partScores[2] + partScores[3] + partScores[4];
    
    // Tính reading raw score (Part 5-7)
    this.scores.reading.raw = partScores[5] + partScores[6] + partScores[7];
};

// Method: Quy đổi điểm TOEIC (simplified conversion)
submissionSchema.methods.convertToScaledScore = function() {
    // Đây là công thức quy đổi đơn giản hóa
    // TOEIC thực tế sử dụng bảng quy đổi phức tạp hơn
    
    // Listening: 5-495
    // Công thức: raw/100 * 490 + 5
    const listeningScaled = Math.round((this.scores.listening.raw / 100) * 490 + 5);
    this.scores.listening.scaled = Math.min(495, Math.max(5, listeningScaled));
    
    // Reading: 5-495
    // Công thức: raw/100 * 490 + 5
    const readingScaled = Math.round((this.scores.reading.raw / 100) * 490 + 5);
    this.scores.reading.scaled = Math.min(495, Math.max(5, readingScaled));
    
    // Total: 10-990
    this.scores.total = this.scores.listening.scaled + this.scores.reading.scaled;
};

// Method: Tính tất cả điểm
submissionSchema.methods.calculateAllScores = function() {
    this.calculateRawScores();
    this.convertToScaledScore();
};

// Method: Cập nhật progress
submissionSchema.methods.updateProgress = function() {
    this.progress.answeredQuestions = this.answers.filter(a => a.userAnswer).length;
    
    // Đếm parts đã hoàn thành
    const partCounts = { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 };
    const completedParts = [];
    
    for (let part = 1; part <= 7; part++) {
        const partAnswers = this.answers.filter(a => a.part === part && a.userAnswer);
        if (partAnswers.length === partCounts[part]) {
            completedParts.push(part);
        }
    }
    
    this.progress.completedParts = completedParts;
};

// Pre-save middleware
submissionSchema.pre('save', function(next) {
    if (this.isModified('answers')) {
        this.updateProgress();
    }
    next();
});

export const Submission = mongoose.model('Submission', submissionSchema);