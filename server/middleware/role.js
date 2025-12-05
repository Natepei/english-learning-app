export const requireAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Bạn không có quyền truy cập trang này' });
    }
};


export const requireUser = async (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ message: 'Trang này chỉ dành cho người dùng thường' });
        return;
    }
};