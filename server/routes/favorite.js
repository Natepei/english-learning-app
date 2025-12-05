import express from 'express';
import Favorite from '../models/Favorite.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Thêm từ vào danh sách yêu thích
router.post('/:userId', protect, async (req, res) => {
    try {
        const { word, phonetic, definition } = req.body;

        // Kiểm tra xem từ đã tồn tại trong danh sách yêu thích chưa
        const existingFavorite = await Favorite.findOne({
            userId: req.params.userId,
            word: word
        });

        if (existingFavorite) {
            return res.status(400).json({ message: 'Từ này đã có trong danh sách yêu thích' });
        }

        const newFavorite = new Favorite({
            userId: req.params.userId,
            word,
            phonetic,
            definition
        });

        await newFavorite.save();
        res.status(201).json(newFavorite);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Lấy danh sách từ yêu thích của user
router.get('/:userId', protect, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.params.userId })
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian thêm vào, mới nhất lên đầu
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Xóa từ khỏi danh sách yêu thích
router.delete('/:userId/:word', protect, async (req, res) => {
    try {
        const result = await Favorite.findOneAndDelete({
            userId: req.params.userId,
            word: req.params.word
        });

        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy từ này trong danh sách yêu thích' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

export default router;
