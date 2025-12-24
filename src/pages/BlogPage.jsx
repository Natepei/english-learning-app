import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import './BlogPage.css';

const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

const BlogPage = () => {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        'All',
        'Grammar',
        'Vocabulary',
        'Pronunciation',
        'Listening',
        'Speaking',
        'Reading',
        'Writing',
        'Tips & Tricks',
        'Resources',
        'Other'
    ];

    const fetchBlogs = async (searchQuery = '', category = '') => {
        try {
            setLoading(true);
            const params = {};
            
            if (category && category !== 'All') {
                params.category = category;
            }
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await axios.get(getApiUrl('blogs'), { params });
            setBlogs(response.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleCategoryChange = (category) => {
        const newCategory = category === 'All' ? '' : category;
        setSelectedCategory(newCategory);
        fetchBlogs(searchTerm, newCategory);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBlogs(searchTerm, selectedCategory);
    };

    if (loading) return <div className="loading">Đang tải blogs...</div>;

    return (
        <div className="blog-page-container">
            <div className="blog-header">
                <h1>English Learning Blog</h1>
                <p>Tips, tricks, and resources for learning English</p>
            </div>

            <div className="blog-actions">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        placeholder="Tìm kiếm blog..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {/* <button type="submit" className="search-button">Tìm</button> */}
                </form>

                {user && (
                    <Link to="/create-blog" className="create-blog-button">
                        + Tạo Blog Mới
                    </Link>
                )}
            </div>

            <div className="category-filter">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-btn ${selectedCategory === category || (category === 'All' && !selectedCategory) ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="blogs-grid">
                {blogs.length === 0 ? (
                    <div className="no-blogs">
                        <p>Không tìm thấy blog nào</p>
                        <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                            Thử thay đổi bộ lọc hoặc {user ? <Link to="/create-blog" style={{ color: '#4F46E5' }}>tạo blog đầu tiên</Link> : <Link to="/login" style={{ color: '#4F46E5' }}>đăng nhập để xem thêm</Link>}
                        </p>
                    </div>
                ) : (
                    blogs.map(blog => (
                        <Link to={`/blog/${blog._id}`} key={blog._id} className="blog-card">
                            {blog.imageUrl && (
                                <div className="blog-card-image">
                                    <img src={blog.imageUrl} alt={blog.title} />
                                </div>
                            )}
                            <div className="blog-card-content">
                                <span className="blog-category">{blog.category}</span>
                                <h3>{blog.title}</h3>
                                <p className="blog-excerpt">
                                    {stripHtml(blog.content).substring(0, 150)}...
                                </p>
                                <div className="blog-card-footer">
                                    <span className="blog-author">Bởi {blog.authorName}</span>
                                    <div className="blog-stats">
                                        <span>👁️ {blog.views || 0}</span>
                                        <span>❤️ {blog.likes?.length || 0}</span>
                                    </div>
                                </div>
                                <div className="blog-tags">
                                    {blog.tags?.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default BlogPage;
