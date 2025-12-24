import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getBaseUrl } from '../utils/api';
import './ToeicDashboard.css';

const ToeicDashboard = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    const [exams, setExams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(getApiUrl('books'));
            
            // Backend now filters based on role, but we can double check on frontend
            // to ensure no drafts leak if backend logic changes.
            const publishedBooks = response.data.filter(book => book.status === 'published');
            
            setBooks(publishedBooks);
        } catch (error) {
            console.error('❌ Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBook = async (book) => {
        setSelectedBook(book);
        try {
            const response = await axios.get(getApiUrl(`books/${book._id}/exams`));
            setExams(response.data);
        } catch (error) {
            console.error('❌ Error fetching exams:', error);
            alert('Không thể tải danh sách đề thi');
        }
    };

    const handleStartExam = (examId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để làm bài!');
            navigate('/login');
            return;
        }
        navigate(`/toeic/exam/${examId}`);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="toeic-dashboard">
            <div className="dashboard-header">
                <h1>Luyện Thi TOEIC Online</h1>
                <p>Chọn bộ đề và bắt đầu hành trình chinh phục điểm cao!</p>
            </div>

            <div className="dashboard-content">
                {/* Books List */}
                <div className="books-section">
                    <h2>📚 Bộ Đề Thi</h2>
                    <div className="books-grid">
                        {books.length > 0 ? (
                            books.map(book => (
                                <div 
                                    key={book._id} 
                                    className={`book-card ${selectedBook?._id === book._id ? 'selected' : ''}`}
                                    onClick={() => handleSelectBook(book)}
                                >
                                    <div className="book-cover">
                                        {book.imageUrl ? (
                                            <img src={`${getBaseUrl()}${book.imageUrl}`} alt={book.title} />
                                        ) : (
                                            <div className="no-cover">TOEIC</div>
                                        )}
                                    </div>
                                    <div className="book-info">
                                        <h3>{book.title}</h3>
                                        <p>{book.year} • {book.examCount || 0} đề</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">Hiện chưa có bộ đề nào được xuất bản.</div>
                        )}
                    </div>
                </div>

                {/* Exams List (Only shows when a book is selected) */}
                {selectedBook && (
                    <div className="exams-section">
                        <h2>📝 Danh Sách Đề Thi: {selectedBook.title}</h2>
                        
                        {exams.length > 0 ? (
                            <div className="exams-grid">
                                {exams.map(exam => (
                                    <div key={exam._id} className="exam-card">
                                        <div className="exam-icon">✍️</div>
                                        <div className="exam-details">
                                            <h3>{exam.title}</h3>
                                            <div className="exam-meta">
                                                <span>⏱️ {exam.duration} phút</span>
                                                <span>❓ 200 câu</span>
                                            </div>
                                        </div>
                                        <button 
                                            className="btn-start-exam"
                                            onClick={() => handleStartExam(exam._id)}
                                        >
                                            Bắt Đầu Làm Bài
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-exams">
                                <p>Chưa có đề thi nào trong bộ này.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>{books.length}</h3>
                        <p>Bộ đề có sẵn</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>{books.reduce((sum, book) => sum + (book.examCount || 0), 0)}</h3>
                        <p>Tổng số đề thi</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                        <h3>120</h3>
                        <p>Phút mỗi đề</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>200</h3>
                        <p>Câu hỏi/đề</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToeicDashboard;
