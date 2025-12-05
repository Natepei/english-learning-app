import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { username, email, role, password = "defaultPassword123" } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        const savedUser = await newUser.save();
        const userResponse = { ...savedUser._doc };
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo người dùng mới' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Update thông tin
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;

        // Nếu có thay đổi password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        const userResponse = { ...updatedUser._doc };
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        // Kiểm tra xem user có tồn tại không
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra không cho phép xóa chính mình
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
        }

        // Sử dụng findByIdAndDelete thay vì remove()
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Đã xóa người dùng thành công' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
    }
};