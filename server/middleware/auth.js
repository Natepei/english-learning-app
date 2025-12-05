import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Lấy token

            if (!token) {
                return res.status(401).json({ message: "Không có token." });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "Người dùng không tồn tại." });
            }

            next();
        } catch (error) {
            console.error("Lỗi token:", error);
            res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        }
    } else {
        res.status(401).json({ message: "Không có token." });
    }
};

// Middleware kiểm tra quyền admin
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        console.log('Người dùng là admin:', req.user);
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập, chỉ dành cho admin.' });
    }
};
