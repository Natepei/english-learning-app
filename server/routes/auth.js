import express from 'express';
import { register, login, getUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';
import { requireAdmin, requireUser } from '../middleware/role.js';
import { User } from '../models/User.js'; // Import User from '../models/User.js';

const router = express.Router();

// Route công khai
router.post('/register', register);
router.post('/login', login);

router.get("/users", protect, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Ẩn password khi trả về
        res.status(200).json(users);
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// Route cho admin
router.get('/dashboard', protect, requireAdmin, (req, res) => {
    res.json({ message: 'Trang quản trị', user: req.user });
});

// Route cho user thường
router.get('/', protect, requireUser, (req, res) => {
    res.json({ message: 'Trang người dùng', user: req.user });
});

export default router;