import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminBooks.css';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        image: null,
        status: 'draft' // Changed to string enum
    });
    const [imagePreview, setImagePreview] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/books', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
            alert('Lỗi khi tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED: Use status string and PATCH endpoint ---
    const handleTogglePublish = async (book) => {
        // Toggle logic: if published -> draft, if draft -> published
        const newStatus = book.status === 'published' ? 'draft' : 'published';
        const action = newStatus === 'published' ? 'xuất bản' : 'hủy xuất bản';
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} bộ đề này?`)) return;

        try {
            await axios.patch(
                `http://localhost:5000/api/books/${book._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchBooks();
            alert(`Đã ${action} thành công!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Lỗi: Không thể cập nhật trạng thái.');
        }
    };

    const handleOpenModal = (book = null) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title,
                description: book.description || '',
                year: book.year,
                image: null,
                status: book.status || 'draft'
            });
            setImagePreview(book.imageUrl ? `http://localhost:5000${book.imageUrl}` : null);
        } else {
            setEditingBook(null);
            setFormData({
                title: '',
                description: '',
                year: new Date().getFullYear(),
                image: null,
                status: 'draft'
            });
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBook(null);
        setFormData({ title: '', description: '', year: new Date().getFullYear(), image: null, status: 'draft' });
        setImagePreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        // For checkbox (isPublished toggle in modal), we convert to status string
        if (name === 'isPublished') {
             setFormData(prev => ({ 
                ...prev, 
                status: checked ? 'published' : 'draft' 
            }));
        } else {
             setFormData(prev => ({ 
                ...prev, 
                [name]: value 
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('year', formData.year);
        data.append('status', formData.status);
        
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editingBook) {
                await axios.put(
                    `http://localhost:5000/api/books/${editingBook._id}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
                alert('Cập nhật sách thành công!');
            } else {
                await axios.post(
                    'http://localhost:5000/api/books',
                    data,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
                alert('Tạo sách thành công!');
            }
            handleCloseModal();
            fetchBooks();
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu sách'));
        }
    };

    const handleDelete = async (bookId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Xóa sách thành công!');
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa sách'));
        }
    };

    const handleViewExams = (bookId) => {
        navigate(`/dashboard/exams-management/${bookId}`);
    };

    if (loading) return <div className="admin-loading">Đang tải...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Quản Lý Bộ Đề TOEIC</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    ➕ Thêm Bộ Đề Mới
                </button>
            </div>

            <div className="books-grid">
                {books.map(book => (
                    <div key={book._id} className="book-card">
                        <div className="book-image">
                            {/* Status Badge */}
                            <div className={`status-badge ${book.status}`}>
                                {book.status === 'published' ? 'Published' : 'Draft'}
                            </div>

                            {book.imageUrl ? (
                                <img src={`http://localhost:5000${book.imageUrl}`} alt={book.title} />
                            ) : (
                                <div className="no-image">📚</div>
                            )}
                        </div>
                        <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="book-year">Năm: {book.year}</p>
                            <p className="book-description">{book.description}</p>
                            <p className="book-exams">Số đề thi: {book.examCount || 0}</p>
                        </div>
                        <div className="book-actions">
                            <button className="btn-info" onClick={() => handleViewExams(book._id)}>
                                📝 Xem Đề
                            </button>
                            <button 
                                className={`btn-publish ${book.status === 'published' ? 'unpublish' : 'publish'}`}
                                onClick={() => handleTogglePublish(book)}
                            >
                                {book.status === 'published' ? '🔒 Hủy' : '🚀 Public'}
                            </button>
                            <button className="btn-warning" onClick={() => handleOpenModal(book)}>
                                ✏️ Sửa
                            </button>
                            <button className="btn-danger" onClick={() => handleDelete(book._id)}>
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingBook ? 'Sửa Bộ Đề' : 'Thêm Bộ Đề Mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên Bộ Đề *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="VD: ETS TOEIC TEST 2020"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả về bộ đề..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Năm Xuất Bản *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="2000"
                                    max={new Date().getFullYear() + 1}
                                    required
                                />
                            </div>

                             {/* Checkbox for Status in Form */}
                             <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.status === 'published'}
                                        onChange={handleInputChange}
                                    />
                                    <span style={{marginLeft: '8px'}}>Công khai cho học viên (Publish)</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Ảnh Bìa</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingBook ? 'Cập Nhật' : 'Tạo Mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;