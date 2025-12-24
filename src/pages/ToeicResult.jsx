import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import './ToeicResult.css';

const ToeicResult = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchResult();
    }, [submissionId]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                getApiUrl(`submissions/${submissionId}`),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmission(response.data);
        } catch (error) {
            console.error('Error fetching result:', error);
            alert('Lỗi khi tải kết quả');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const getScoreColor = (score) => {
        if (score >= 850) return '#10B981'; // Green
        if (score >= 700) return '#3B82F6'; // Blue
        if (score >= 500) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    const getScoreLevel = (score) => {
        if (score >= 850) return 'Xuất sắc';
        if (score >= 700) return 'Tốt';
        if (score >= 500) return 'Trung bình';
        return 'Cần cải thiện';
    };

    if (loading) return <div className="result-loading">Đang tải kết quả...</div>;

    if (!submission) return <div className="result-error">Không tìm thấy kết quả</div>;

    return (
        <div className="result-container">
            <div className="result-card">
                {/* Header */}
                <div className="result-header">
                    <h1>🎉 Kết Quả Kiểm Tra</h1>
                    <p className="exam-title">{submission.examId?.title}</p>
                    <p className="completion-date">
                        Hoàn thành lúc: {new Date(submission.completedAt).toLocaleString('vi-VN')}
                    </p>
                </div>

                {/* Total Score */}
                <div className="total-score-section">
                    <div className="score-circle" style={{ borderColor: getScoreColor(submission.scores.total) }}>
                        <div className="score-number" style={{ color: getScoreColor(submission.scores.total) }}>
                            {submission.scores.total}
                        </div>
                        <div className="score-max">/990</div>
                    </div>
                    <div className="score-details">
                        <h2>Tổng Điểm TOEIC</h2>
                        <p className="score-level" style={{ color: getScoreColor(submission.scores.total) }}>
                            {getScoreLevel(submission.scores.total)}
                        </p>
                        <div className="time-spent">
                            <span>⏱️ Thời gian làm bài: {formatTime(submission.timeSpent)}</span>
                        </div>
                    </div>
                </div>

                {/* Section Scores */}
                <div className="section-scores">
                    <div className="section-score listening">
                        <h3>🎧 LISTENING</h3>
                        <div className="section-details">
                            <div className="raw-score">
                                <span className="label">Câu đúng:</span>
                                <span className="value">{submission.scores.listening.raw}/100</span>
                            </div>
                            <div className="scaled-score">
                                <span className="score">{submission.scores.listening.scaled}</span>
                                <span className="max">/495</span>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill listening-fill"
                                style={{ width: `${(submission.scores.listening.scaled / 495) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="section-score reading">
                        <h3>📖 READING</h3>
                        <div className="section-details">
                            <div className="raw-score">
                                <span className="label">Câu đúng:</span>
                                <span className="value">{submission.scores.reading.raw}/100</span>
                            </div>
                            <div className="scaled-score">
                                <span className="score">{submission.scores.reading.scaled}</span>
                                <span className="max">/495</span>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill reading-fill"
                                style={{ width: `${(submission.scores.reading.scaled / 495) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Part Scores */}
                <div className="part-scores-section">
                    <h2>Điểm Theo Từng Part</h2>
                    <div className="parts-grid">
                        {[
                            { part: 1, name: 'Photographs', max: 6, icon: '📷' },
                            { part: 2, name: 'Question-Response', max: 25, icon: '💬' },
                            { part: 3, name: 'Short Conversations', max: 39, icon: '👥' },
                            { part: 4, name: 'Short Talks', max: 30, icon: '🎤' },
                            { part: 5, name: 'Incomplete Sentences', max: 30, icon: '✍️' },
                            { part: 6, name: 'Text Completion', max: 16, icon: '📝' },
                            { part: 7, name: 'Reading Comprehension', max: 54, icon: '📚' }
                        ].map(({ part, name, max, icon }) => {
                            const score = submission.scores.parts[`part${part}`];
                            const percentage = (score / max) * 100;
                            
                            return (
                                <div key={part} className="part-card">
                                    <div className="part-header">
                                        <span className="part-icon">{icon}</span>
                                        <div className="part-info">
                                            <h4>Part {part}</h4>
                                            <p>{name}</p>
                                        </div>
                                    </div>
                                    <div className="part-score">
                                        <span className="score-fraction">{score}/{max}</span>
                                        <span className="score-percentage">{percentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="part-progress-bar">
                                        <div 
                                            className="part-progress-fill"
                                            style={{ 
                                                width: `${percentage}%`,
                                                backgroundColor: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Statistics */}
                <div className="statistics-section">
                    <h2>Thống Kê Chi Tiết</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-icon">✅</span>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {submission.answers.filter(a => a.isCorrect).length}
                                </span>
                                <span className="stat-label">Câu đúng</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">❌</span>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {submission.answers.filter(a => !a.isCorrect).length}
                                </span>
                                <span className="stat-label">Câu sai</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">📊</span>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {((submission.answers.filter(a => a.isCorrect).length / 200) * 100).toFixed(1)}%
                                </span>
                                <span className="stat-label">Tỷ lệ đúng</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">⏱️</span>
                            <div className="stat-content">
                                <span className="stat-value">{formatTime(submission.timeSpent)}</span>
                                <span className="stat-label">Thời gian</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="result-actions">
                    <button 
                        className="btn-review"
                        onClick={() => navigate(`/toeic/review/${submissionId}`)}
                    >
                        📋 Xem Đáp Án Chi Tiết
                    </button>
                    <button 
                        className="btn-history"
                        onClick={() => navigate('/toeic/history')}
                    >
                        📊 Lịch Sử Làm Bài
                    </button>
                    <button 
                        className="btn-retry"
                        onClick={() => navigate('/toeic')}
                    >
                        🔄 Làm Bài Khác
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToeicResult;
