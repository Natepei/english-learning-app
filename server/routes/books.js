import express from 'express';
import { Book } from '../models/Book.js';
import { Exam } from '../models/Exam.js';
import { protect, admin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Cấu hình multer để upload ảnh bìa
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
// @desc    Lấy danh sách tất cả books
// @access  Public
router.get('/', async (req, res) => {
    try {
        const books = await Book.find({ isActive: true })
            .populate('createdBy', 'username')
            .sort({ year: -1, createdAt: -1 });

        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sách' });
    }
});

// @route   GET /api/books/:id
// @desc    Lấy chi tiết một book
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('createdBy', 'username');

        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        // Lấy danh sách exams của book này
        const exams = await Exam.find({ bookId: book._id, isActive: true })
            .select('title status attemptCount averageScore createdAt')
            .sort({ title: 1 });

        res.json({
            ...book.toObject(),
            exams
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sách' });
    }
});

// @route   POST /api/books
// @desc    Tạo book mới
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, year } = req.body;

        // Kiểm tra dữ liệu
        if (!title || !year) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Tạo book mới
        const bookData = {
            title,
            description,
            year: parseInt(year),
            createdBy: req.user._id
        };

        // Nếu có upload ảnh
        if (req.file) {
            bookData.imageUrl = `/uploads/books/${req.file.filename}`;
        }

        const book = await Book.create(bookData);

        res.status(201).json({
            message: 'Tạo sách thành công',
            book
        });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Lỗi khi tạo sách' });
    }
});

// @route   PUT /api/books/:id
// @desc    Cập nhật book
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, year, isActive } = req.body;

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        // Cập nhật thông tin
        if (title) book.title = title;
        if (description !== undefined) book.description = description;
        if (year) book.year = parseInt(year);
        if (isActive !== undefined) book.isActive = isActive;

        // Nếu có upload ảnh mới
        if (req.file) {
            // Xóa ảnh cũ nếu có
            if (book.imageUrl) {
                const oldImagePath = `.${book.imageUrl}`;
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            book.imageUrl = `/uploads/books/${req.file.filename}`;
        }

        await book.save();

        res.json({
            message: 'Cập nhật sách thành công',
            book
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sách' });
    }
});

// @route   DELETE /api/books/:id
// @desc    Xóa book (soft delete)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        // Kiểm tra xem có exam nào đang active không
        const activeExams = await Exam.countDocuments({ bookId: book._id, isActive: true });

        if (activeExams > 0) {
            return res.status(400).json({ 
                message: 'Không thể xóa sách khi còn đề thi đang hoạt động' 
            });
        }

        // Soft delete
        book.isActive = false;
        await book.save();

        res.json({ message: 'Xóa sách thành công' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sách' });
    }
});

// @route   GET /api/books/:id/exams
// @desc    Lấy danh sách exams của một book
// @access  Public
router.get('/:id/exams', async (req, res) => {
    try {
        // Allow both draft and published for testing
        const exams = await Exam.find({ 
            bookId: req.params.id, 
            isActive: true,
            $or: [
                { status: 'published' },
                { status: 'draft' }
            ]
        })
        .select('title duration totalQuestions attemptCount averageScore createdAt')
        .sort({ title: 1 });

        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đề thi' });
    }
});

export default router;