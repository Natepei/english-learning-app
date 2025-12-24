import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../pages/CreateBlog.css'; // Reuse exact same CSS as CreateBlog

const EditBlog = () => {
    const { id } = useParams();
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
    const [loading, setLoading] = useState(true);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ]
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'image', 'video'
    ];

    useEffect(() => {
        if (!user) return navigate('/login');
        fetchCourses();
        fetchBlog();
    }, [id, user, navigate]);

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
            const res = await axios.get(getApiBaseUrl() + '/courses');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLessons = async (courseId) => {
        try {
            const res = await axios.get(`${getApiBaseUrl()}/lessons?courseId=${courseId}`);
            setLessons(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBlog = async () => {
        try {
            const res = await axios.get(`${getApiBaseUrl()}/blogs/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const b = res.data;
            setFormData({
                title: b.title || '',
                content: b.content || '',
                category: b.category || 'Other',
                tags: b.tags?.join(', ') || '',
                imageUrl: b.imageUrl || '',
                relatedCourse: b.relatedCourse?._id || '',
                relatedLesson: b.relatedLesson?._id || ''
            });
            if (b.relatedCourse?._id) fetchLessons(b.relatedCourse._id);
        } catch (err) {
            alert('Không thể tải blog hoặc bạn không có quyền chỉnh sửa');
            navigate('/my-blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            return alert('Tiêu đề và nội dung là bắt buộc');
        }

        setLoading(true);
        try {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

            await axios.put(
                `${getApiBaseUrl()}/blogs/${id}`,
                {
                    ...formData,
                    tags: tagsArray,
                    relatedCourse: formData.relatedCourse || null,
                    relatedLesson: formData.relatedLesson || null
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            alert('Blog đã được cập nhật thành công!\n(Nếu bạn không phải admin, blog sẽ quay lại trạng thái "Chờ duyệt")');
            navigate('/my-blogs');
        } catch (err) {
            alert('Lỗi khi cập nhật: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        'Grammar', 'Vocabulary', 'Pronunciation', 'Listening', 'Speaking',
        'Reading', 'Writing', 'Tips & Tricks', 'Resources', 'Other'
    ];

    if (loading) return <div className="loading">Đang tải blog...</div>;

    return (
        <div className="create-blog-container">
            <h1>Chỉnh sửa Blog</h1>
            <p className="info-text">Cập nhật nội dung blog của bạn</p>

            <form onSubmit={handleSubmit} className="create-blog-form">
                <div className="form-group">
                    <label htmlFor="title">Tiêu đề *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Danh mục</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange}>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">URL ảnh bìa (tùy chọn)</label>
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
                    <label htmlFor="content">Nội dung *</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={modules}
                        formats={formats}
                        placeholder="Viết nội dung blog..."
                        className="rich-editor"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags (cách nhau bởi dấu phẩy)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="grammar, tips, beginner"
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
                    <button type="button" onClick={() => navigate('/my-blogs')} className="btn-cancel">
                        Hủy
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật Blog'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBlog;