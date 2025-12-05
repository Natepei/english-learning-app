import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
            console.log('📚 Fetching books...');
            const response = await axios.get('http://localhost:5000/api/books');
            console.log('✅ Books loaded:', response.data);
            setBooks(response.data);
        } catch (error) {
            console.error('❌ Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBook = async (book) => {
        console.log('📖 Selected book:', book.title);
        setSelectedBook(book);
        try {
            console.log('🔄 Fetching exams for book:', book._id);
            const response = await axios.get(`http://localhost:5000/api/books/${book._id}/exams`);
            console.log('✅ Exams loaded:', response.data.length, 'exams');
            console.log('Exam data:', response.data);
            setExams(response.data);
            
            if (!response.data || response.data.length === 0) {
                console.warn('⚠️ No exams found for this book!');
            }
        } catch (error) {
            console.error('❌ Error fetching exams:', error);
            console.error('Error response:', error.response?.data);
        }
    };

    const handleStartExam = (examId) => {
        navigate(`/toeic/exam/${examId}`);
    };

    if (loading) {
        return <div className="toeic-loading">Đang tải...</div>;
    }

    return (
        <div className="toeic-dashboard">
            <div className="dashboard-header">
                <h1>📚 TOEIC Test Center</h1>
                <p>Chọn bộ đề và bắt đầu luyện tập TOEIC của bạn</p>
            </div>

            <div className="dashboard-content">
                {/* Books Section */}
                <div className="books-section">
                    <h2>Bộ Đề TOEIC</h2>
                    <div className="books-grid">
                        {books.map(book => (
                            <div
                                key={book._id}
                                className={`book-card ${selectedBook?._id === book._id ? 'selected' : ''}`}
                                onClick={() => handleSelectBook(book)}
                            >
                                <div className="book-cover">
                                    {book.imageUrl ? (
                                        <img src={`http://localhost:5000${book.imageUrl}`} alt={book.title} />
                                    ) : (
                                        <div className="book-placeholder">📖</div>
                                    )}
                                </div>
                                <div className="book-info">
                                    <h3>{book.title}</h3>
                                    <p className="book-year">Năm {book.year}</p>
                                    <p className="book-count">{book.examCount} đề thi</p>
                                </div>
                                {selectedBook?._id === book._id && (
                                    <div className="selected-badge">✓ Đã chọn</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exams Section */}
                {selectedBook && (
                    <div className="exams-section">
                        <h2>Danh Sách Đề Thi - {selectedBook.title}</h2>
                        {exams.length === 0 ? (
                            <div className="empty-exams">
                                <p>Chưa có đề thi nào trong bộ đề này</p>
                            </div>
                        ) : (
                            <div className="exams-list">
                                {exams.map(exam => (
                                    <div key={exam._id} className="exam-card">
                                        <div className="exam-header">
                                            <h3>{exam.title}</h3>
                                            <span className="exam-duration">⏱️ {exam.duration} phút</span>
                                        </div>
                                        <div className="exam-stats">
                                            <div className="stat">
                                                <span className="stat-label">Số câu hỏi</span>
                                                <span className="stat-value">{exam.totalQuestions}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Lượt làm</span>
                                                <span className="stat-value">{exam.attemptCount}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Điểm TB</span>
                                                <span className="stat-value">{exam.averageScore || 0}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-start-exam"
                                            onClick={() => handleStartExam(exam._id)}
                                        >
                                            🚀 Bắt Đầu Làm Bài
                                        </button>
                                    </div>
                                ))}
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
                        <h3>{books.reduce((sum, book) => sum + book.examCount, 0)}</h3>
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