import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './MyBlogs.css';

const MyBlogs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyBlogs = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/blogs?author=${user._id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBlogs(res.data);
        } catch (err) {
            console.error(err);
            alert('Không thể tải danh sách blog');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return navigate('/login');
        fetchMyBlogs();
    }, [user, navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa blog này vĩnh viễn? Không thể khôi phục!')) return;
        try {
            await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchMyBlogs(); // refresh list
            alert('Đã xóa blog');
        } catch (err) {
            alert('Lỗi xóa blog');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { text: 'Chờ duyệt', class: 'status-pending' },
            approved: { text: 'Đã duyệt', class: 'status-approved' },
            rejected: { text: 'Bị từ chối', class: 'status-rejected' }
        };
        return map[status] || map.pending;
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="myblogs-container">
            <div className="myblogs-header">
                <h1>Blog của tôi ({blogs.length})</h1>
                <Link to="/create-blog" className="btn-create">
                    + Tạo blog mới
                </Link>
            </div>

            {blogs.length === 0 ? (
                <div className="empty-state">
                    <p>Bạn chưa có blog nào.</p>
                    <Link to="/create-blog">Tạo blog đầu tiên ngay!</Link>
                </div>
            ) : (
                <table className="myblogs-table">
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Danh mục</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map(blog => {
                            const badge = getStatusBadge(blog.status);
                            return (
                                <tr key={blog._id}>
                                    <td>
                                        <Link to={`/blog/${blog._id}`} className="blog-title-link">
                                            {blog.title}
                                        </Link>
                                    </td>
                                    <td>{blog.category}</td>
                                    <td>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.text}
                                        </span>
                                    </td>
                                    <td>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="actions">
                                        <Link to={`/blog/${blog._id}`} className="btn-small btn-view">Xem</Link>
                                        <Link to={`/edit-blog/${blog._id}`} className="btn-small btn-edit">Sửa</Link>
                                        <button
                                            onClick={() => handleDelete(blog._id)}
                                            className="btn-small btn-delete"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyBlogs;