import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

// Get all blogs (public - approved only, admin - all)
export const getBlogs = async (req, res) => {
    try {
        const { status, category, search, author } = req.query;
        let query = {};

        console.log('User role:', req.user?.role);
        console.log('Query params:', { status, category, search, author });

        // If not logged in or not admin, only show approved blogs
        if (!req.user || req.user.role !== 'admin') {
            query.status = 'approved';
            console.log('Non-admin user: only showing approved blogs');
        } else {
            // Admin can filter by status, or see all if no filter
            if (status) {
                query.status = status;
                console.log('Admin filtering by status:', status);
            } else {
                console.log('Admin viewing all blogs (no status filter)');
            }
        }

        if (category) query.category = category;
        if (author) query.author = author;
        if (search) {
            query.$text = { $search: search };
        }

        console.log('Final query:', query);

        const blogs = await Blog.find(query)
            .populate('author', 'username email')
            .populate('relatedCourse', 'title')
            .populate('relatedLesson', 'title')
            .sort({ createdAt: -1 });

        console.log('Found blogs:', blogs.length);

        res.json(blogs);
    } catch (error) {
        console.error('Error in getBlogs:', error);
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// Get single blog
export const getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'username email')
            .populate('relatedCourse', 'title')
            .populate('relatedLesson', 'title');

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Only show if approved or if user is author/admin
        if (blog.status !== 'approved' && 
            (!req.user || (req.user._id.toString() !== blog.author._id.toString() && req.user.role !== 'admin'))) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.json(blog);
    } catch (error) {
        console.error('Error in getBlog:', error);
        res.status(500).json({ message: 'Error fetching blog', error: error.message });
    }
};

// Create blog
export const createBlog = async (req, res) => {
    try {
        console.log('Creating blog with user:', req.user);
        console.log('Request body:', req.body);

        const { title, content, tags, category, imageUrl, relatedCourse, relatedLesson } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Create blog object
        const blogData = {
            title,
            content,
            author: req.user._id,
            authorName: req.user.username,
            category: category || 'Other',
            status: 'pending'
        };

        // Add optional fields only if they exist
        if (tags && Array.isArray(tags) && tags.length > 0) {
            blogData.tags = tags;
        }
        if (imageUrl) {
            blogData.imageUrl = imageUrl;
        }
        if (relatedCourse) {
            blogData.relatedCourse = relatedCourse;
        }
        if (relatedLesson) {
            blogData.relatedLesson = relatedLesson;
        }

        console.log('Blog data to create:', blogData);

        const blog = await Blog.create(blogData);

        console.log('Blog created successfully:', blog);

        res.status(201).json(blog);
    } catch (error) {
        console.error('Error in createBlog:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
};

// Update blog
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Only author or admin can update
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, content, tags, category, imageUrl, relatedCourse, relatedLesson } = req.body;

        if (title) blog.title = title;
        if (content) blog.content = content;
        if (tags !== undefined) blog.tags = tags;
        if (category) blog.category = category;
        if (imageUrl !== undefined) blog.imageUrl = imageUrl;
        if (relatedCourse !== undefined) blog.relatedCourse = relatedCourse;
        if (relatedLesson !== undefined) blog.relatedLesson = relatedLesson;

        // If user edits, reset to pending (unless admin)
        if (req.user.role !== 'admin') {
            blog.status = 'pending';
        }

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (error) {
        console.error('Error in updateBlog:', error);
        res.status(500).json({ message: 'Error updating blog', error: error.message });
    }
};

// Delete blog
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Only author or admin can delete
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Blog.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ blogId: req.params.id }); // Delete all comments

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error in deleteBlog:', error);
        res.status(500).json({ message: 'Error deleting blog', error: error.message });
    }
};

// Approve/Reject blog (admin only)
export const updateBlogStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (error) {
        console.error('Error in updateBlogStatus:', error);
        res.status(500).json({ message: 'Error updating blog status', error: error.message });
    }
};

// Like/Unlike blog
export const toggleLikeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const userIndex = blog.likes.indexOf(req.user._id);

        if (userIndex === -1) {
            blog.likes.push(req.user._id);
        } else {
            blog.likes.splice(userIndex, 1);
        }

        await blog.save();
        res.json({ likes: blog.likes.length, isLiked: userIndex === -1 });
    } catch (error) {
        console.error('Error in toggleLikeBlog:', error);
        res.status(500).json({ message: 'Error toggling like', error: error.message });
    }
};

// Get comments for a blog (with nested replies)
export const getComments = async (req, res) => {
    try {
        // Fetch ALL comments for blog, populated authors, sorted OLDEST first
        const allComments = await Comment.find({ blogId: req.params.id })
            .populate('author', 'username')  // Populates author obj on every comment
            .sort({ createdAt: 1 });  // <- CHANGED: Oldest first for chrono flow

        // Build tree: Map for quick parent lookup
        const commentMap = {};
        const topLevel = [];

        allComments.forEach(comment => {
            // Ensure replies array exists (even if empty)
            comment.replies = [];
            // Key by string ID for safety
            commentMap[comment._id.toString()] = comment;

            if (!comment.parentComment) {
                // Top-level: Add to roots (in oldest order)
                topLevel.push(comment);
            } else {
                // Attach as child to parent (appends in fetch order = chrono)
                const parentId = comment.parentComment.toString();
                if (commentMap[parentId]) {
                    commentMap[parentId].replies.push(comment);
                } else {
                    // Orphan? Rare, but log it
                    console.warn(`Orphan comment ${comment._id}: No parent ${parentId}`);
                    topLevel.push(comment);  // Fallback to top
                }
            }
        });

        // Recursive sort: Each node's replies newest-first
        const sortReplies = (comments) => {
            comments.forEach(comment => {
                if (comment.replies && comment.replies.length > 0) {
                    comment.replies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    sortReplies(comment.replies);
                }
            });
        };
        sortReplies(topLevel);

        console.log(`Fetched ${allComments.length} comments, ${topLevel.length} top-level`);
        res.json(topLevel);
    } catch (error) {
        console.error('Error in getComments:', error);
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

// Add comment (can be a reply)
export const addComment = async (req, res) => {
    try {
        const { content, parentComment } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const commentData = {
            blogId: req.params.id,
            author: req.user._id,
            authorName: req.user.username,
            content: content.trim()
        };

        if (parentComment) {
            commentData.parentComment = parentComment;
        }

        const comment = await Comment.create(commentData);
        console.log(`Added comment ${comment._id} (reply? ${!!parentComment})`);

        // Return basic populated comment (frontend will refetch full tree)
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error in addComment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only author or admin can delete
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Comment.findByIdAndDelete(req.params.commentId);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error in deleteComment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};