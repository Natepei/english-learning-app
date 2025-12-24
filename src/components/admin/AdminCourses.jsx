import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import './AdminCourses.css';

const AdminCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        language: 'English',
        level: 'basic'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(getApiBaseUrl() + '/courses', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                setError('Error fetching courses: ' + error.message);
                setLoading(false);
            }
        };

        fetchCourses();
    }, [token]);

    const handleAddCourse = async () => {
        try {
            const response = await axios.post(getApiBaseUrl() + '/courses', newCourse, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCourses([...courses, response.data]);
            setNewCourse({ title: '', description: '', language: 'English', level: 'basic' });
            alert('Thêm khóa học thành công!');
        } catch (error) {
            handleTokenError(error);
            alert('Lỗi khi thêm khóa học: ' + error.message);
        }
    };

    const handleUpdateCourse = async (id) => {
        try {
            const response = await axios.put(
                `${getApiBaseUrl()}/courses/${id}`,
                editingCourse,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setCourses(courses.map(course => course._id === id ? response.data : course));
            setEditingCourse(null);
            alert('Cập nhật khóa học thành công!');
        } catch (error) {
            handleTokenError(error);
            alert('Lỗi khi cập nhật khóa học: ' + error.message);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

        try {
            await axios.delete(
                `${getApiBaseUrl()}/courses/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setCourses(courses.filter(course => course._id !== id));
            alert('Xóa khóa học thành công!');
        } catch (error) {
            handleTokenError(error);
            alert('Lỗi khi xóa khóa học: ' + error.message);
        }
    };

    const handleTokenError = (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Redirect to login page
            window.location.href = '/login';
        }
    };

    if (loading) return <div className="admin-loading">Đang tải...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-container">
            <h1>Quản lý Khóa học</h1>

            <div className="admin-form">
                <h2>{editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h2>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Tên khóa học"
                        value={editingCourse ? editingCourse.title : newCourse.title}
                        onChange={(e) => editingCourse
                            ? setEditingCourse({ ...editingCourse, title: e.target.value })
                            : setNewCourse({ ...newCourse, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Mô tả khóa học"
                        value={editingCourse ? editingCourse.description : newCourse.description}
                        onChange={(e) => editingCourse
                            ? setEditingCourse({ ...editingCourse, description: e.target.value })
                            : setNewCourse({ ...newCourse, description: e.target.value })}
                    />
                    <select
                        value={editingCourse ? editingCourse.level : newCourse.level}
                        onChange={(e) => editingCourse
                            ? setEditingCourse({ ...editingCourse, level: e.target.value })
                            : setNewCourse({ ...newCourse, level: e.target.value })}
                    >
                        <option value="basic">Cơ bản</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                    </select>
                    {editingCourse ? (
                        <div className="button-group">
                            <button onClick={() => handleUpdateCourse(editingCourse._id)}>
                                Cập nhật
                            </button>
                            <button className="cancel" onClick={() => setEditingCourse(null)}>
                                Hủy
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleAddCourse}>Thêm khóa học</button>
                    )}
                </div>
            </div>

            <div className="admin-table">
                <h2>Danh sách khóa học</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tên khóa học</th>
                            <th>Mô tả</th>
                            <th>Cấp độ</th>
                            <th>Số bài học</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course._id}>
                                <td>{course.title}</td>
                                <td>{course.description}</td>
                                <td>{course.level}</td>
                                <td>{course.lessonCount || 0}</td>
                                <td>
                                    <button className="btn-primary" onClick={() => setEditingCourse(course)}>
                                        Sửa
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDeleteCourse(course._id)}
                                    >
                                        Xóa
                                    </button>
                                    <button className="admincourses"onClick={() => window.location.href = `/dashboard/lessons-management/${course._id}`}>
                                        Chỉnh sửa bài học
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCoursesPage;