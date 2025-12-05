import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    word: {
        type: String,
        required: true
    },
    phonetic: {
        type: String,
        required: false
    },
    definition: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Tạo compound index để đảm bảo mỗi user chỉ có thể yêu thích một từ một lần
favoriteSchema.index({ userId: 1, word: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
