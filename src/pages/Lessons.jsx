import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';
import './Lessons.css';

const Lessons = () => {
    const { courseId } = useParams(); // Lấy courseId từ URL
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/lessons/${courseId}`);
            setLessons(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching lessons:', err);
            setError('Không thể tải danh sách bài học. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="lessons-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải bài học...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lessons-container">
                <div className="error-state">
                    <AlertCircle size={48} />
                    <p>{error}</p>
                    <button onClick={fetchLessons} className="retry-btn">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="lessons-container">
            <div className="lessons-header">
                <h1>Bài Học</h1>
                <p>Chọn bài học và bắt đầu học tập</p>
            </div>

            <div className="lessons-grid">
                {lessons.length === 0 ? (
                    <div className="no-lessons">
                        <p>Không có bài học nào trong khóa học này</p>
                    </div>
                ) : (
                    lessons.map((lesson) => (
                        <div key={lesson._id} className="lesson-card">
                            <div className="lesson-icon">
                                <BookOpen size={32} />
                            </div>
                            <h3>{lesson.title}</h3>
                            <p>{lesson.content.substring(0, 100)}</p>
                            <Link to={`/lessons/${lesson._id}/exercises`} className="start-lesson-btn">
                                Làm bài tập
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Lessons;
