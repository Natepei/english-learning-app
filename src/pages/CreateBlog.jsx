import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { getApiUrl } from '../utils/api';
import 'react-quill/dist/quill.snow.css';
import './CreateBlog.css';

const CreateBlog = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Other',
        tags: '',
        imageUrl: '',
        relatedCourse: '',
        relatedLesson: ''
    });
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCourses();
    }, [user]);

    useEffect(() => {
        if (formData.relatedCourse) {
            fetchLessons(formData.relatedCourse);
        } else {
            setLessons([]);
            setFormData(prev => ({ ...prev, relatedLesson: '' }));
        }
    }, [formData.relatedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(getApiUrl('courses'));
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchLessons = async (courseId) => {
        try {
            const response = await axios.get(getApiUrl(`lessons?courseId=${courseId}`));
            setLessons(response.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({
            ...prev,
            content: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Vui lòng điền tiêu đề và nội dung');
            return;
        }

        setLoading(true);

        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            await axios.post(
                getApiUrl('blogs'),
                {
                    ...formData,
                    tags: tagsArray
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            alert('Blog đã được tạo và đang chờ phê duyệt!');
            navigate('/blogs');
        } catch (error) {
            console.error('Error creating blog:', error);
            alert('Lỗi khi tạo blog: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
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

    // Rich text editor modules with full features
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    return (
        <div className="create-blog-container">
            <h1>Tạo Blog Mới</h1>
            <p className="info-text">Blog của bạn sẽ được gửi để admin phê duyệt trước khi công khai</p>

            <form onSubmit={handleSubmit} className="create-blog-form">
                <div className="form-group">
                    <label htmlFor="title">Tiêu đề *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Nhập tiêu đề blog..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Danh mục *</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">URL hình ảnh</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                        <img src={formData.imageUrl} alt="Preview" className="image-preview" />
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="content">Nội dung * (Sử dụng trình soạn thảo bên dưới)</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={modules}
                        formats={formats}
                        placeholder="Viết nội dung blog của bạn..."
                        className="rich-editor"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="ví dụ: grammar, tips, beginner"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="relatedCourse">Khóa học liên quan (tùy chọn)</label>
                        <select
                            id="relatedCourse"
                            name="relatedCourse"
                            value={formData.relatedCourse}
                            onChange={handleChange}
                        >
                            <option value="">Không liên quan</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="relatedLesson">Bài học liên quan (tùy chọn)</label>
                        <select
                            id="relatedLesson"
                            name="relatedLesson"
                            value={formData.relatedLesson}
                            onChange={handleChange}
                            disabled={!formData.relatedCourse}
                        >
                            <option value="">Không liên quan</option>
                            {lessons.map(lesson => (
                                <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/blogs')} className="btn-cancel">
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang tạo...' : 'Tạo Blog'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlog;
