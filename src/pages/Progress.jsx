import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import './Progress.css';

const ProgressPage = () => {
    const { userId } = useParams();  // Lấy userId từ URL
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgress();
    }, [userId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');  // Lấy token từ localStorage
            console.log('Fetching progress for user ID:', userId);
            console.log(token);
            const response = await axios.get(
                getApiUrl(`progress/${userId}`),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setProgress(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching progress:', err);
            setError('Không thể tải tiến trình học. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="progress-page">
                <div className="loading-state">
                    <p>Đang tải tiến trình học...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="progress-page">
                <div className="error-state">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="progress-page">
            <h1>Tiến Trình Học</h1>
            {progress.length === 0 ? (
                <p>Không có tiến trình học nào cho người dùng này.</p>
            ) : (
                <div className="progress-list">
                    {progress.map((item) => (
                        <div key={item._id} className="progress-card">
                            <h3>Bài học: {item.lessonId?.title}</h3> {/* Hiển thị tên bài học */}
                            <h4>Bài tập hoàn thành: {item.exerciseResults.length}</h4>
                            <ul>
                                {item.exerciseResults.map((result, index) => (
                                    <li key={index}>
                                        <strong>Câu hỏi:</strong> {result.exerciseId.question}<br />
                                        <strong>Đáp án của bạn:</strong> {result.answer} <br />
                                        <strong>Đúng:</strong> {result.isCorrect ? 'Có' : 'Không'}<br />
                                        <strong>Thời gian hoàn thành:</strong> {new Date(result.completedAt).toLocaleString()}
                                    </li>
                                ))}
                            </ul>
                            <div className="score">
                                <strong>Điểm:</strong> {item.score}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProgressPage;
