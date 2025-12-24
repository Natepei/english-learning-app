import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import './BlogPost.css';

// CommentItem with collapse magic
const CommentItem = ({ 
    comment, 
    isReply = false, 
    replyTo, 
    setReplyTo, 
    replyContent, 
    setReplyContent, 
    handleAddReply, 
    user, 
    handleDeleteComment,
    // Collapse props
    expanded,
    setExpanded
}) => {
    const handleReplyClick = () => {
        setReplyTo(replyTo === comment._id ? null : comment._id);
    };

    const handleCancelReply = () => {
        setReplyTo(null);
        setReplyContent(prev => ({ ...prev, [comment._id]: '' }));
    };

    const handleReplyChange = (e) => {
        setReplyContent(prev => ({
            ...prev,
            [comment._id]: e.target.value
        }));
    };

    // Collapse logic: Per-comment toggle, defaults false
    const isExpanded = expanded[comment._id] ?? false;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const toggleExpanded = () => {
        setExpanded(prev => ({
            ...prev,
            [comment._id]: !isExpanded
        }));
    };

    return (
        <div className={`comment ${isReply ? 'comment-reply' : ''}`}>
            <div className="comment-header">
                <strong>{comment.authorName}</strong>
                <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                </span>
            </div>
            <p className="comment-content">{comment.content}</p>
            <div className="comment-actions">
                {user && (
                    <button 
                        className="reply-button"
                        onClick={handleReplyClick}
                    >
                        {replyTo === comment._id ? 'Hủy' : 'Trả lời'}
                    </button>
                )}
                {user && (user._id === comment.author?._id || user.role === 'admin') && (
                    <button 
                        className="delete-comment"
                        onClick={() => handleDeleteComment(comment._id)}
                    >
                        Xóa
                    </button>
                )}
            </div>

            {replyTo === comment._id && (
                <div className="reply-form">
                    <textarea
                        placeholder="Viết phản hồi..."
                        value={replyContent[comment._id] || ''}
                        onChange={handleReplyChange}
                        rows="2"
                    />
                    <div className="reply-form-actions">
                        <button 
                            onClick={handleCancelReply} 
                            className="btn-cancel-reply"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={() => handleAddReply(comment._id)} 
                            className="btn-send-reply"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle button: Only if has replies */}
            {hasReplies && (
                <div className="replies-toggle">
                    <button 
                        className="reply-button"
                        onClick={toggleExpanded}
                    >
                        {isExpanded ? 'Ẩn phản hồi' : `Xem ${comment.replies.length} phản hồi`}
                    </button>
                </div>
            )}

            {/* Replies: Render only if expanded */}
            {hasReplies && isExpanded && (
                <div className="replies-container">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply._id} 
                            comment={reply} 
                            isReply={true}
                            replyTo={replyTo}
                            setReplyTo={setReplyTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            handleAddReply={handleAddReply}
                            user={user}
                            handleDeleteComment={handleDeleteComment}
                            expanded={expanded}
                            setExpanded={setExpanded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const BlogPost = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState({});
    // Expanded state: Obj keyed by comment ID, defaults collapsed
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        fetchBlog();
        fetchComments();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const config = user ? {
                headers: { Authorization: `Bearer ${user.token}` }
            } : {};

            const response = await axios.get(getApiUrl(`blogs/${id}`), config);
            setBlog(response.data);
            setLikesCount(response.data.likes?.length || 0);
            setIsLiked(response.data.likes?.includes(user?._id));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blog:', error);
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(getApiUrl(`blogs/${id}/comments`));
            setComments(response.data);
            // Reset expands on refetch—keeps it fresh (swap for localStorage if sticky needed)
            setExpanded({});
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleLike = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thích bài viết');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                getApiUrl(`blogs/${id}/like`),
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likes);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Vui lòng đăng nhập để bình luận');
            navigate('/login');
            return;
        }

        if (!newComment.trim()) return;

        try {
            await axios.post(
                getApiUrl(`blogs/${id}/comments`),
                { content: newComment },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchComments();  // Refetch full tree
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Lỗi khi thêm bình luận');
        }
    };

    const handleAddReply = async (parentId) => {
        if (!user) {
            alert('Vui lòng đăng nhập để trả lời');
            navigate('/login');
            return;
        }

        const content = replyContent[parentId] || '';
        if (!content.trim()) return;

        try {
            await axios.post(
                getApiUrl(`blogs/${id}/comments`),
                { 
                    content: content,
                    parentComment: parentId 
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchComments();  // Refetch to update tree
            setReplyContent(prev => ({ ...prev, [parentId]: '' }));
            setReplyTo(null);
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Lỗi khi thêm phản hồi');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        try {
            await axios.delete(
                getApiUrl(`blogs/${id}/comments/${commentId}`),
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchComments();  // Refetch cleans tree
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Lỗi khi xóa bình luận');
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!blog) return <div className="error">Không tìm thấy bài viết</div>;

    return (
        <div className="blog-post-container">
            <article className="blog-post">
                {blog.imageUrl && (
                    <div className="blog-post-image">
                        <img src={blog.imageUrl} alt={blog.title} />
                    </div>
                )}

                <div className="blog-post-header">
                    <span className="blog-post-category">{blog.category}</span>
                    <h1>{blog.title}</h1>
                    <div className="blog-post-meta">
                        <span>Bởi <strong>{blog.authorName}</strong></span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        <span>👁️ {blog.views} lượt xem</span>
                    </div>
                </div>

                <div 
                    className="blog-post-content" 
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {blog.tags && blog.tags.length > 0 && (
                    <div className="blog-post-tags">
                        {blog.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}

                <div className="blog-post-actions">
                    <button 
                        className={`like-button ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        {isLiked ? '❤️' : '🤍'} {likesCount}
                    </button>
                </div>
            </article>

            <div className="comments-section">
                <h2>Bình luận ({comments.length})</h2>

                {user ? (
                    <form onSubmit={handleAddComment} className="comment-form">
                        <textarea
                            placeholder="Viết bình luận..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows="3"
                        />
                        <button type="submit">Gửi bình luận</button>
                    </form>
                ) : (
                    <p className="login-prompt">
                        <a href="/login">Đăng nhập</a> để bình luận
                    </p>
                )}

                <div className="comments-list">
                    {comments.map(comment => (
                        <CommentItem 
                            key={comment._id}
                            comment={comment}
                            replyTo={replyTo}
                            setReplyTo={setReplyTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            handleAddReply={handleAddReply}
                            user={user}
                            handleDeleteComment={handleDeleteComment}
                            // Pass collapse props
                            expanded={expanded}
                            setExpanded={setExpanded}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
