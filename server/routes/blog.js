import express from 'express';
import {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    updateBlogStatus,
    toggleLikeBlog,
    getComments,
    addComment,
    deleteComment
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to optionally authenticate (allows both authenticated and non-authenticated requests)
const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const jwt = await import('jsonwebtoken');
            const { User } = await import('../models/User.js');
            
            const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            console.log('Optional auth failed, continuing without user');
        }
    }
    next();
};

// Blog routes
router.route('/')
    .get(optionalAuth, getBlogs)  // Allow both authenticated and non-authenticated
    .post(protect, createBlog);

router.route('/:id')
    .get(optionalAuth, getBlog)  // Allow both authenticated and non-authenticated
    .put(protect, updateBlog)
    .delete(protect, deleteBlog);

// Admin route to approve/reject
router.put('/:id/status', protect, admin, updateBlogStatus);

// Like/Unlike blog
router.post('/:id/like', protect, toggleLikeBlog);

// Comment routes
router.route('/:id/comments')
    .get(getComments)
    .post(protect, addComment);

router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;