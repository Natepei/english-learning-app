import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ToeicHistory.css';

const ToeicHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchHistory();
        fetchStats();
    }, [user]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/submissions/user/${user._id}?status=completed`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmissions(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/submissions/stats/user/${user._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 850) return '#10B981';
        if (score >= 700) return '#3B82F6';
        if (score >= 500) return '#F59E0B';
        return '#EF4444';
    };

    const filteredSubmissions = submissions.filter(sub => {
        if (filter === 'all') return true;
        if (filter === 'high') return sub.scores.total >= 700;
        if (filter === 'medium') return sub.scores.total >= 500 && sub.scores.total < 700;
        if (filter === 'low') return sub.scores.total < 500;
        return true;
    });

    if (loading) return <div className="history-loading">Đang tải lịch sử...</div>;

    return (
        <div className="history-container">
            <div className="history-header">
                <h1>📊 Lịch Sử Làm Bài TOEIC</h1>
                <button className="btn-back" onClick={() => navigate('/toeic')}>
                    ← Quay lại
                </button>
            </div>

            {/* Statistics Overview */}
            {stats && (
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-content">
                            <h3>{stats.totalTests}</h3>
                            <p>Tổng số bài thi</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <h3>{stats.averageScore}</h3>
                            <p>Điểm trung bình</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                            <h3>{stats.highestScore}</h3>
                            <p>Điểm cao nhất</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>{stats.lowestScore}</h3>
                            <p>Điểm thấp nhất</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Score Chart */}
            {stats && stats.totalTests > 0 && (
                <div className="score-chart-section">
                    <h2>Biểu Đồ Tiến Bộ</h2>
                    <div className="chart-container">
                        <div className="chart-bars">
                            {submissions.slice(0, 10).reverse().map((sub, index) => {
                                const height = (sub.scores.total / 990) * 100;
                                return (
                                    <div key={sub._id} className="chart-bar-wrapper">
                                        <div 
                                            className="chart-bar"
                                            style={{ 
                                                height: `${height}%`,
                                                backgroundColor: getScoreColor(sub.scores.total)
                                            }}
                                        >
                                            <span className="bar-label">{sub.scores.total}</span>
                                        </div>
                                        <span className="bar-date">
                                            {new Date(sub.completedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#10B981' }}></span>
                                <span>Xuất sắc (850+)</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#3B82F6' }}></span>
                                <span>Tốt (700-849)</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#F59E0B' }}></span>
                                <span>Trung bình (500-699)</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color" style={{ background: '#EF4444' }}></span>
                                <span>Cần cải thiện (&lt;500)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="history-filter">
                <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => setFilter('all')}
                >
                    Tất cả ({submissions.length})
                </button>
                <button 
                    className={filter === 'high' ? 'active' : ''} 
                    onClick={() => setFilter('high')}
                >
                    Điểm cao (≥700)
                </button>
                <button 
                    className={filter === 'medium' ? 'active' : ''} 
                    onClick={() => setFilter('medium')}
                >
                    Trung bình (500-699)
                </button>
                <button 
                    className={filter === 'low' ? 'active' : ''} 
                    onClick={() => setFilter('low')}
                >
                    Cần cải thiện (&lt;500)
                </button>
            </div>

            {/* History List */}
            <div className="history-list">
                {filteredSubmissions.length === 0 ? (
                    <div className="empty-history">
                        <p>Chưa có lịch sử làm bài trong danh mục này</p>
                    </div>
                ) : (
                    filteredSubmissions.map(sub => (
                        <div key={sub._id} className="history-item">
                            <div className="history-item-header">
                                <div className="exam-info">
                                    <h3>{sub.examId?.title || 'Unknown Exam'}</h3>
                                    <p className="exam-date">
                                        {new Date(sub.completedAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div 
                                    className="total-score-badge"
                                    style={{ backgroundColor: getScoreColor(sub.scores.total) }}
                                >
                                    {sub.scores.total}
                                </div>
                            </div>

                            <div className="history-item-details">
                                <div className="score-breakdown">
                                    <div className="score-item">
                                        <span className="score-icon">🎧</span>
                                        <div className="score-info">
                                            <span className="score-label">Listening</span>
                                            <span className="score-value">{sub.scores.listening.scaled}/495</span>
                                        </div>
                                    </div>
                                    <div className="score-item">
                                        <span className="score-icon">📖</span>
                                        <div className="score-info">
                                            <span className="score-label">Reading</span>
                                            <span className="score-value">{sub.scores.reading.scaled}/495</span>
                                        </div>
                                    </div>
                                    <div className="score-item">
                                        <span className="score-icon">✅</span>
                                        <div className="score-info">
                                            <span className="score-label">Câu đúng</span>
                                            <span className="score-value">
                                                {sub.answers.filter(a => a.isCorrect).length}/200
                                            </span>
                                        </div>
                                    </div>
                                    <div className="score-item">
                                        <span className="score-icon">⏱️</span>
                                        <div className="score-info">
                                            <span className="score-label">Thời gian</span>
                                            <span className="score-value">
                                                {Math.floor(sub.timeSpent / 60)}m {sub.timeSpent % 60}s
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="history-item-actions">
                                    <button 
                                        className="btn-view-result"
                                        onClick={() => navigate(`/toeic/result/${sub._id}`)}
                                    >
                                        📊 Xem Chi Tiết
                                    </button>
                                    <button 
                                        className="btn-review"
                                        onClick={() => navigate(`/toeic/review/${sub._id}`)}
                                    >
                                        📋 Xem Đáp Án
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ToeicHistory;