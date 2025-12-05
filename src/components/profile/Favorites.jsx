import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Favorites.css';

const Favorites = () => {
    const { user } = useAuth();
    const [favoriteWords, setFavoriteWords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavoriteWords = async () => {
            try {
                setLoading(true);
                const favoritesResponse = await axios.get(
                    `http://localhost:5000/api/favorites/${user._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
                setFavoriteWords(favoritesResponse.data);
            } catch (error) {
                console.error('Error fetching favorite words:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFavoriteWords();
        }
    }, [user]);

    return (
        <div className="favorites-container">
            <div className="favorites-header">
                <h1>Từ vựng yêu thích</h1>
            </div>
            <div className="favorites-content">
                {loading ? (
                    <div className="loading-text">Đang tải...</div>
                ) : favoriteWords.length === 0 ? (
                    <p className="no-favorites">Bạn chưa có từ vựng yêu thích nào</p>
                ) : (
                    <div className="favorite-words-container">
                        {favoriteWords.map((word, index) => (
                            <Link
                                key={index}
                                to={`/dictionary/${word.word}`}
                                className="favorite-word-card"
                            >
                                <h3 className="favorite-word">{word.word}</h3>
                                <p className="favorite-phonetic">{word.phonetic}</p>
                                <p className="favorite-definition">{word.definition}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;