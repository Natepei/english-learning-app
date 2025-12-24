import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, BarChart, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import './Courses.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(getApiUrl('courses'));
            console.log('Courses data:', response.data); // For debugging
            setCourses(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = currentFilter === 'all'
        ? courses
        : courses.filter(course => course.level === currentFilter);

    const getLevelColor = (level) => {
        switch (level) {
            case 'basic':
                return 'level-basic';
            case 'intermediate':
                return 'level-intermediate';
            case 'advanced':
                return 'level-advanced';
            default:
                return '';
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 'basic':
                return 'Cơ Bản';
            case 'intermediate':
                return 'Trung Cấp';
            case 'advanced':
                return 'Nâng Cao';
            default:
                return level;
        }
    };

    if (loading) {
        return (
            <div className="courses-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải khóa học...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="courses-container">
                <div className="error-state">
                    <AlertCircle size={48} />
                    <p>{error}</p>
                    <button onClick={fetchCourses} className="retry-btn">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="courses-container">
            <div className="courses-header">
                <h1>Khóa Học Tiếng Anh</h1>
                <p>Chọn khóa học phù hợp với trình độ của bạn</p>
            </div>

            <div className="course-filters">
                <button
                    className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setCurrentFilter('all')}
                >
                    Tất Cả
                </button>
                <button
                    className={`filter-btn ${currentFilter === 'basic' ? 'active' : ''}`}
                    onClick={() => setCurrentFilter('basic')}
                >
                    Cơ Bản
                </button>
                <button
                    className={`filter-btn ${currentFilter === 'intermediate' ? 'active' : ''}`}
                    onClick={() => setCurrentFilter('intermediate')}
                >
                    Trung Cấp
                </button>
                <button
                    className={`filter-btn ${currentFilter === 'advanced' ? 'active' : ''}`}
                    onClick={() => setCurrentFilter('advanced')}
                >
                    Nâng Cao
                </button>
            </div>

            <div className="courses-grid">
                {filteredCourses.length === 0 ? (
                    <div className="no-courses">
                        <p>Không có khóa học nào trong mục này</p>
                    </div>
                ) : (
                    filteredCourses.map((course) => (
                        <div key={course._id} className="course-card">
                            <div className={`course-level ${getLevelColor(course.level)}`}>
                                {getLevelText(course.level)}
                            </div>
                            <div className="course-icon">
                                <BookOpen size={32} />
                            </div>
                            <h3>{course.title}</h3>
                            <p>{course.description || 'Chưa có mô tả cho khóa học này'}</p>
                            <div className="course-stats">
                                <div className="stat">
                                    <GraduationCap size={20} />
                                    <span>{course.lessonCount || 0} bài học</span>
                                </div>
                                <div className="stat">
                                    <BarChart size={20} />
                                    <span>0% hoàn thành</span>
                                </div>
                            </div>
                            <Link to={`/courses/${course._id}/lessons`} className="start-course-btn">
                                Bắt Đầu Học
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Courses;