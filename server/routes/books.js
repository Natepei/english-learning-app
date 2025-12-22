import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    updateBookStatus,
    getBookExams // ADDED: Import the controller function
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to optionally authenticate
const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const jwt = await import('jsonwebtoken');
            const { User } = await import('../models/User.js');
            
            const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            console.log('Optional auth failed in books, continuing without user');
        }
    }
    next();
};

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/books';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)'));
        }
    }
});

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', optionalAuth, getAllBooks);

// @route   GET /api/books/:id
// @desc    Get a single book
// @access  Public
router.get('/:id', getBookById);

// @route   GET /api/books/:id/exams
// @desc    Get all exams for a specific book
// @access  Public
// --- FIX: This route was missing ---
router.get('/:id/exams', getBookExams);

// @route   POST /api/books
// @desc    Create a new book
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), createBook);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), updateBook);

// @route   PATCH /api/books/:id/status
// @desc    Update book status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, updateBookStatus);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteBook);

export default router;