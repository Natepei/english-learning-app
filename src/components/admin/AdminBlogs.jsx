import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBlogs.css';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [token] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedBlog, setSelectedBlog] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, [filter]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }

            console.log('Fetching blogs with params:', params);

            const response = await axios.get('http://localhost:5000/api/blogs', {
                headers: { 'Authorization': `Bearer ${token}` },
                params
            });
            
            console.log('Blogs received:', response.data);
            setBlogs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Error fetching blogs: ' + error.message);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (blogId, status) => {
        try {
            await axios.put(
                `http://localhost:5000/api/blogs/${blogId}/status`,
                { status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchBlogs();
            alert(`Blog ${status === 'approved' ? 'phê duyệt' : 'từ chối'} thành công!`);
            setSelectedBlog(null);
        } catch (error) {
            alert('Lỗi khi cập nhật trạng thái: ' + error.message);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa blog này?')) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/blogs/${blogId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchBlogs();
            alert('Xóa blog thành công!');
        } catch (error) {
            alert('Lỗi khi xóa blog: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'Chờ duyệt', className: 'status-pending' },
            approved: { text: 'Đã duyệt', className: 'status-approved' },
            rejected: { text: 'Từ chối', className: 'status-rejected' }
        };
        return badges[status] || badges.pending;
    };

    if (loading) return <div className="admin-loading">Đang tải...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-container">
            <h1>Quản lý Blog</h1>

            <div className="filter-section">
                <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => setFilter('all')}
                >
                    Tất cả ({blogs.length})
                </button>
                <button 
                    className={filter === 'pending' ? 'active' : ''} 
                    onClick={() => setFilter('pending')}
                >
                    Chờ duyệt
                </button>
                <button 
                    className={filter === 'approved' ? 'active' : ''} 
                    onClick={() => setFilter('approved')}
                >
                    Đã duyệt
                </button>
                <button 
                    className={filter === 'rejected' ? 'active' : ''} 
                    onClick={() => setFilter('rejected')}
                >
                    Từ chối
                </button>
            </div>

            {blogs.length === 0 ? (
                <div className="no-blogs-message">
                    <p>Không có blog nào trong danh mục này</p>
                </div>
            ) : (
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Tác giả</th>
                                <th>Danh mục</th>
                                <th>Trạng thái</th>
                                <th>Lượt xem</th>
                                <th>Lượt thích</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog._id}>
                                    <td>
                                        <div className="blog-title-cell">
                                            {blog.title}
                                        </div>
                                    </td>
                                    <td>{blog.authorName}</td>
                                    <td>{blog.category}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(blog.status).className}`}>
                                            {getStatusBadge(blog.status).text}
                                        </span>
                                    </td>
                                    <td>{blog.views}</td>
                                    <td>{blog.likes?.length || 0}</td>
                                    <td>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <button 
                                            className="btn-info" 
                                            onClick={() => setSelectedBlog(blog)}
                                        >
                                            Xem
                                        </button>
                                        {blog.status === 'pending' && (
                                            <>
                                                <button
                                                    className="btn-success"
                                                    onClick={() => handleUpdateStatus(blog._id, 'approved')}
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    className="btn-warning"
                                                    onClick={() => handleUpdateStatus(blog._id, 'rejected')}
                                                >
                                                    Từ chối
                                                </button>
                                            </>
                                        )}
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDeleteBlog(blog._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedBlog && (
                <div className="modal-overlay" onClick={() => setSelectedBlog(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedBlog(null)}>×</button>
                        <h2>{selectedBlog.title}</h2>
                        {selectedBlog.imageUrl && (
                            <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="blog-preview-image" />
                        )}
                        <div className="blog-meta">
                            <span><strong>Tác giả:</strong> {selectedBlog.authorName}</span>
                            <span><strong>Danh mục:</strong> {selectedBlog.category}</span>
                            <span><strong>Tags:</strong> {selectedBlog.tags?.join(', ') || 'Không có'}</span>
                        </div>
                        <div 
                            className="blog-content-preview" 
                            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                        />
                        <div className="modal-actions">
                            {selectedBlog.status === 'pending' && (
                                <>
                                    <button
                                        className="btn-success"
                                        onClick={() => handleUpdateStatus(selectedBlog._id, 'approved')}
                                    >
                                        Phê duyệt
                                    </button>
                                    <button
                                        className="btn-warning"
                                        onClick={() => handleUpdateStatus(selectedBlog._id, 'rejected')}
                                    >
                                        Từ chối
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;