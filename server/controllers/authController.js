// authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

// Register user
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Email không hợp lệ'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (userExists) {
            return res.status(400).json({
                message: 'Email hoặc tên đăng nhập đã tồn tại'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with role (if provided)
        const userData = {
            username,
            email,
            password: hashedPassword,
        };

        // Chỉ cho phép set role nếu được cung cấp và hợp lệ
        if (role && ['user', 'admin'].includes(role)) {
            userData.role = role;
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            throw new Error('Không thể tạo tài khoản');
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({
            message: error.message || 'Đã có lỗi xảy ra khi đăng ký'
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ email và mật khẩu'
            });
        }

        // Check for user email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'Email không tồn tại'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role, // Thêm role vào response
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({
                message: 'Mật khẩu không chính xác'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({
            message: error.message || 'Đã có lỗi xảy ra khi đăng nhập'
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        // Chỉ lấy thông tin cần thiết, không lấy password
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách người dùng'
        });
    }
};
// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
