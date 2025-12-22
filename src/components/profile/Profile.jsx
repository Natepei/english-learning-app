import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [progressStats, setProgressStats] = useState({
        lessonsCompleted: 0,
        vocabularyLearned: 0,
    });
    const [favoriteWords, setFavoriteWords] = useState([]);
    const [myBlogsCount, setMyBlogsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Progress
                const progressResponse = await fetch(
                    `http://localhost:5000/api/progress/${user._id}`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    const lessonsCompleted = progressData.filter(item => item.lessonId).length;
                    setProgressStats({ lessonsCompleted, vocabularyLearned: 0 });
                }

                // Favorites
                const favoritesResponse = await axios.get(
                    `http://localhost:5000/api/favorites/${user._id}`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setFavoriteWords(favoritesResponse.data);

                // My Blogs count
                const blogsResponse = await axios.get(
                    `http://localhost:5000/api/blogs?author=${user._id}`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setMyBlogsCount(blogsResponse.data.length);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Thông tin cá nhân</h1>
            </div>
            <div className="profile-card">
                <div className="profile-section">
                    <h2>Thông tin tài khoản</h2>
                    <p><strong>Tên người dùng:</strong> {user?.username}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                </div>

                <div className="profile-section">
                    <h2>Cá nhân</h2>
                    <div className="progress-stats">
                        <Link to={`/progress/${user._id}`} className="view-progress-link">
                            <div className="progress-stat">
                                <h3>Bài học đã hoàn thành</h3>
                                <p>{progressStats.lessonsCompleted}</p>
                            </div>
                        </Link>

                        <Link to={`/favorites/${user._id}`} className="view-progress-link">
                            <div className="progress-stat">
                                <h3>Từ vựng đã yêu thích</h3>
                                <p>{favoriteWords.length}</p>
                            </div>
                        </Link>

                        <Link to="/my-blogs" className="view-progress-link">
                            <div className="progress-stat">
                                <h3>Bài viết của tôi</h3>
                                <p>{myBlogsCount}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;