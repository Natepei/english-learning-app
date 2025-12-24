import express from 'express';
import { register, login, getUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';
import { requireAdmin, requireUser } from '../middleware/role.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Route công khai
router.post('/register', register);
router.post('/login', login);

// Get all users (admin only)
router.get("/users", protect, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// Create new user (admin only)
router.post("/users", protect, admin, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: "Email hoặc tên đăng nhập đã tồn tại" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });
    } catch (error) {
        console.error("Lỗi khi tạo user:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// Update user (admin only)
router.put("/users/:id", protect, admin, async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const userId = req.params.id;

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        // Check if username or email already exists (excluding current user)
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
            }
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email đã tồn tại" });
            }
        }

        // Update fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật user:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// Delete user (admin only)
router.delete("/users/:id", protect, admin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Không thể xóa tài khoản của chính mình" });
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: "Xóa user thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa user:", error);
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