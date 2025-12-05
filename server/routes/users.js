import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Tất cả các route bên dưới yêu cầu xác thực và quyền admin
router.use(protect, admin);

router.route('/')
    .get(getUsers) // Lấy danh sách user
    .post(createUser); // Tạo user mới

router.route('/:id')
    .put(updateUser) // Cập nhật user theo ID
    .delete(deleteUser); // Xóa user theo ID

export default router;
