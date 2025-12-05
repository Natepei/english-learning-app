import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ToeicExamDetail.css';

const ToeicExamDetail = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('practice');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchExamDetails();
    }, [examId]);

    const fetchExamDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/exams/${examId}`);
            setExam(response.data);
        } catch (error) {
            console.error('Error fetching exam:', error);
            alert('Lỗi khi tải thông tin đề thi');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để làm bài test');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/submissions/start',
                { examId, mode },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const submissionId = response.data.submission._id;
            navigate(`/toeic/test/${submissionId}`);
        } catch (error) {
            console.error('Error starting test:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể bắt đầu làm bài'));
        }
    };

    if (loading) {
        return <div className="toeic-loading">Đang tải...</div>;
    }

    if (!exam) {
        return <div className="toeic-error">Không tìm thấy đề thi</div>;
    }

    return (
        <div className="exam-detail-container">
            <div className="exam-detail-card">
                {/* Header */}
                <div className="exam-detail-header">
                    <button className="btn-back" onClick={() => navigate('/toeic')}>
                        ← Quay lại
                    </button>
                    <h1>{exam.title}</h1>
                    <p className="exam-book">{exam.bookId?.title} - {exam.bookId?.year}</p>
                </div>

                {/* Test Overview */}
                <div className="test-overview">
                    <h2>📋 Thông Tin Đề Thi</h2>
                    <div className="overview-grid">
                        <div className="overview-item">
                            <span className="overview-icon">⏱️</span>
                            <div className="overview-content">
                                <h3>{exam.duration} phút</h3>
                                <p>Thời gian làm bài</p>
                            </div>
                        </div>
                        <div className="overview-item">
                            <span className="overview-icon">📝</span>
                            <div className="overview-content">
                                <h3>{exam.totalQuestions} câu</h3>
                                <p>Tổng số câu hỏi</p>
                            </div>
                        </div>
                        <div className="overview-item">
                            <span className="overview-icon">🎯</span>
                            <div className="overview-content">
                                <h3>10 - 990</h3>
                                <p>Thang điểm</p>
                            </div>
                        </div>
                        <div className="overview-item">
                            <span className="overview-icon">👥</span>
                            <div className="overview-content">
                                <h3>{exam.attemptCount}</h3>
                                <p>Lượt làm bài</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Structure */}
                <div className="test-structure">
                    <h2>📚 Cấu Trúc Đề Thi</h2>
                    <div className="structure-sections">
                        {/* Listening Section */}
                        <div className="structure-section">
                            <h3>🎧 LISTENING (100 câu)</h3>
                            <div className="parts-list">
                                <div className="part-item">
                                    <span className="part-number">Part 1</span>
                                    <span className="part-name">Photographs</span>
                                    <span className="part-count">6 câu</span>
                                </div>
                                <div className="part-item">
                                    <span className="part-number">Part 2</span>
                                    <span className="part-name">Question-Response</span>
                                    <span className="part-count">25 câu</span>
                                </div>
                                <div className="part-item">
                                    <span className="part-number">Part 3</span>
                                    <span className="part-name">Short Conversations</span>
                                    <span className="part-count">39 câu</span>
                                </div>
                                <div className="part-item">
                                    <span className="part-number">Part 4</span>
                                    <span className="part-name">Short Talks</span>
                                    <span className="part-count">30 câu</span>
                                </div>
                            </div>
                        </div>

                        {/* Reading Section */}
                        <div className="structure-section">
                            <h3>📖 READING (100 câu)</h3>
                            <div className="parts-list">
                                <div className="part-item">
                                    <span className="part-number">Part 5</span>
                                    <span className="part-name">Incomplete Sentences</span>
                                    <span className="part-count">30 câu</span>
                                </div>
                                <div className="part-item">
                                    <span className="part-number">Part 6</span>
                                    <span className="part-name">Text Completion</span>
                                    <span className="part-count">16 câu</span>
                                </div>
                                <div className="part-item">
                                    <span className="part-number">Part 7</span>
                                    <span className="part-name">Reading Comprehension</span>
                                    <span className="part-count">54 câu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Mode Selection */}
                <div className="test-mode-selection">
                    <h2>🎮 Chế Độ Làm Bài</h2>
                    <div className="mode-options">
                        <label className={`mode-option ${mode === 'practice' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="mode"
                                value="practice"
                                checked={mode === 'practice'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            <div className="mode-content">
                                <h3>🎯 Chế độ Luyện tập</h3>
                                <ul>
                                    <li>✓ Có thể nghe audio nhiều lần</li>
                                    <li>✓ Xem đáp án sau khi nộp bài</li>
                                    <li>✓ Không giới hạn thời gian nghiêm ngặt</li>
                                </ul>
                            </div>
                        </label>

                        <label className={`mode-option ${mode === 'real_exam' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="mode"
                                value="real_exam"
                                checked={mode === 'real_exam'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            <div className="mode-content">
                                <h3>🔥 Chế độ Thi Thật</h3>
                                <ul>
                                    <li>⚠️ Audio chỉ phát 1 lần duy nhất</li>
                                    <li>⚠️ Giới hạn thời gian nghiêm ngặt</li>
                                    <li>⚠️ Giống điều kiện thi thật nhất</li>
                                </ul>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Instructions */}
                <div className="test-instructions">
                    <h2>⚠️ Lưu Ý Quan Trọng</h2>
                    <ul>
                        <li>Đảm bảo kết nối internet ổn định trong suốt quá trình làm bài</li>
                        <li>Câu trả lời của bạn sẽ được tự động lưu sau mỗi lần chọn</li>
                        <li>Bạn có thể thoát và quay lại tiếp tục làm bài</li>
                        <li>Nên sử dụng tai nghe để có trải nghiệm nghe tốt nhất</li>
                        <li>Sau khi nộp bài, bạn sẽ thấy kết quả chi tiết</li>
                    </ul>
                </div>

                {/* Start Button */}
                <button className="btn-start-test" onClick={handleStartTest}>
                    🚀 Bắt Đầu Làm Bài
                </button>
            </div>
        </div>
    );
};

export default ToeicExamDetail;