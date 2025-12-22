import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminToeicExams.css';

const AdminToeicExams = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        duration: 120
    });
    const [examOverview, setExamOverview] = useState({});
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBookAndExams();
    }, [bookId]);

    const fetchBookAndExams = async () => {
        try {
            setLoading(true);
            const [bookRes, examsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/books/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/exams?bookId=${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setBook(bookRes.data);
            setExams(examsRes.data);

            // Fetch overview for each exam
            const overviews = {};
            for (const exam of examsRes.data) {
                try {
                    const overview = await axios.get(
                        `http://localhost:5000/api/exams/${exam._id}/questions-overview`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    overviews[exam._id] = overview.data;
                } catch (err) {
                    console.error('Error fetching overview:', err);
                }
            }
            setExamOverview(overviews);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (exam = null) => {
        if (exam) {
            setEditingExam(exam);
            setFormData({
                title: exam.title,
                duration: exam.duration
            });
        } else {
            setEditingExam(null);
            setFormData({
                title: '',
                duration: 120
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingExam(null);
        setFormData({ title: '', duration: 120 });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingExam) {
                await axios.put(
                    `http://localhost:5000/api/exams/${editingExam._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Cập nhật đề thi thành công!');
            } else {
                await axios.post(
                    'http://localhost:5000/api/exams',
                    { ...formData, bookId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Tạo đề thi thành công!');
            }
            handleCloseModal();
            fetchBookAndExams();
        } catch (error) {
            console.error('Error saving exam:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu đề thi'));
        }
    };

    const handleDelete = async (examId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/exams/${examId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Xóa đề thi thành công!');
            fetchBookAndExams();
        } catch (error) {
            console.error('Error deleting exam:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa đề thi'));
        }
    };

    const handlePublish = async (examId) => {
        if (!window.confirm('Bạn có chắc chắn muốn publish đề thi này?')) return;

        try {
            await axios.put(
                `http://localhost:5000/api/exams/${examId}/publish`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Publish đề thi thành công!');
            fetchBookAndExams();
        } catch (error) {
            console.error('Error publishing exam:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể publish đề thi'));
        }
    };

    const handleManageQuestions = (examId) => {
        navigate(`/dashboard/questions-management/${examId}`);
    };

    const getProgressColor = (current, expected) => {
        const percentage = (current / expected) * 100;
        if (percentage === 100) return '#10B981';
        if (percentage >= 50) return '#F59E0B';
        return '#EF4444';
    };

    if (loading) return <div className="admin-loading">Đang tải...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/dashboard/books-management')}>
                        ← Quay lại
                    </button>
                    <h1>{book?.title}</h1>
                    <p className="book-subtitle">Năm: {book?.year} • Số đề: {exams.length}</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    ➕ Thêm Đề Thi Mới
                </button>
            </div>

            <div className="exams-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Đề Thi</th>
                            <th>Trạng Thái</th>
                            <th>Tiến Độ</th>
                            <th>Lượt Làm</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map(exam => {
                            const overview = examOverview[exam._id];
                            const isComplete = overview?.isComplete || false;
                            const currentQuestions = overview?.totalCurrent || 0;
                            const expectedQuestions = overview?.totalExpected || 200;

                            return (
                                <tr key={exam._id}>
                                    <td>{exam.title}</td>
                                    <td>
                                        <div className="progress-info">
                                            <span style={{ color: getProgressColor(currentQuestions, expectedQuestions) }}>
                                                {currentQuestions}/{expectedQuestions}
                                            </span>
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ 
                                                        width: `${(currentQuestions / expectedQuestions) * 100}%`,
                                                        backgroundColor: getProgressColor(currentQuestions, expectedQuestions)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{exam.attemptCount}</td>
                                    <td>{exam.averageScore || 0}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-info-sm" 
                                                onClick={() => handleManageQuestions(exam._id)}
                                            >
                                                📝 Câu Hỏi
                                            </button>
                                            <button 
                                                className="btn-warning-sm" 
                                                onClick={() => handleOpenModal(exam)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="btn-danger-sm" 
                                                onClick={() => handleDelete(exam._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingExam ? 'Sửa Đề Thi' : 'Thêm Đề Thi Mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên Đề Thi *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="VD: ETS 2020 - Test 01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Thời Gian (phút) *</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    min="60"
                                    max="180"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingExam ? 'Cập Nhật' : 'Tạo Mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminToeicExams;