import { Book } from '../models/Book.js';
import { Exam } from '../models/Exam.js';
import { Submission } from '../models/Submission.js';
import fs from 'fs';

// @desc    Get all books
// @access  Public (Published only) / Admin (All)
export const getAllBooks = async (req, res) => {
    try {
        let query = { isActive: true };

        // If NOT admin, force status='published'
        if (!req.user || req.user.role !== 'admin') {
            query.status = 'published';
        }

        const books = await Book.find(query)
            .populate('createdBy', 'username')
            .sort({ year: -1, createdAt: -1 });

        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sách' });
    }
};

// @desc    Get book by ID
// @access  Public
export const getBookById = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, isActive: true })
            .populate('createdBy', 'username');
            
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Create a new book
// @access  Private/Admin
export const createBook = async (req, res) => {
    try {
        const { title, description, year, status } = req.body;

        const book = new Book({
            title,
            description,
            year,
            status: status || 'draft',
            imageUrl: req.file ? `/uploads/books/${req.file.filename}` : null,
            createdBy: req.user._id
        });

        const createdBook = await book.save();
        res.status(201).json(createdBook);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Lỗi khi tạo sách', error: error.message });
    }
};

// @desc    Update a book
// @access  Private/Admin
export const updateBook = async (req, res) => {
    try {
        const { title, description, year, status } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        book.title = title || book.title;
        book.description = description || book.description;
        book.year = year || book.year;
        if (status) book.status = status;

        if (req.file) {
            if (book.imageUrl) {
                const oldPath = `.${book.imageUrl}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            book.imageUrl = `/uploads/books/${req.file.filename}`;
        }

        const updatedBook = await book.save();
        res.json(updatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sách' });
    }
};

// @desc    Update Book Status
// @access  Private/Admin
export const updateBookStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['draft', 'published'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use draft or published' });
        }

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        book.status = status;
        await book.save();

        res.json({ message: `Book status updated to ${status}`, book });
    } catch (error) {
        console.error('Error updating book status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a book
// @access  Private/Admin
export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        // Check for exams associated with this book
        const exams = await Exam.find({ bookId: book._id, isActive: true });
        const examIds = exams.map(e => e._id);

        // Check if there are any submissions for these exams
        if (examIds.length > 0) {
            const submissionCount = await Submission.countDocuments({ 
                examId: { $in: examIds } 
            });

            if (submissionCount > 0) {
                return res.status(400).json({ 
                    message: `Không thể xóa sách này. Hiện tại có ${examIds.length} đề thi với tổng ${submissionCount} bài làm từ người dùng. Vui lòng xóa tất cả bài làm trước hoặc xóa các đề thi.`,
                    details: {
                        examCount: examIds.length,
                        submissionCount: submissionCount
                    }
                });
            }

            // Check if there are active exams
            return res.status(400).json({ 
                message: `Không thể xóa sách khi còn ${examIds.length} đề thi đang hoạt động. Vui lòng xóa các đề thi trước.`,
                details: {
                    examCount: examIds.length
                }
            });
        }

        book.isActive = false;
        await book.save();

        res.json({ message: 'Xóa sách thành công' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sách' });
    }
};

// @desc    Get exams for a book
// @access  Public
export const getBookExams = async (req, res) => {
    try {
        const exams = await Exam.find({ 
            bookId: req.params.id, 
            isActive: true
        })
        .select('title duration totalQuestions attemptCount averageScore createdAt')
        .sort({ createdAt: 1 });

        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đề thi' });
    }
};