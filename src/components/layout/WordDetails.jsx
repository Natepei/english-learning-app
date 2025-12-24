import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import { Volume2, Heart, HeartOff } from 'lucide-react';
import './WordDetails.css';

const WordDetails = () => {
    const { word } = useParams();
    const { user } = useAuth();
    const [wordData, setWordData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch word data
                const wordResponse = await axios.get(
                    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
                );
                setWordData(wordResponse.data[0]);

                // Check if word is in favorites
                if (user) {
                    const favResponse = await axios.get(
                        `${getApiBaseUrl()}/favorites/${user._id}`,
                        {
                            headers: { Authorization: `Bearer ${user.token}` }
                        }
                    );
                    setIsFavorite(favResponse.data.some(fav => fav.word === word));
                }
            } catch (err) {
                setError(
                    err.response?.status === 404
                        ? 'Không tìm thấy từ này trong từ điển'
                        : 'Có lỗi xảy ra khi tải dữ liệu'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [word, user]);

    const toggleFavorite = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để sử dụng tính năng này');
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(
                    `${getApiBaseUrl()}/favorites/${user._id}/${word}`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` }
                    }
                );
            } else {
                await axios.post(
                    `${getApiBaseUrl()}/favorites/${user._id}`,
                    {
                        word,
                        phonetic: wordData.phonetic,
                        definition: wordData.meanings[0].definitions[0].definition
                    },
                    {
                        headers: { Authorization: `Bearer ${user.token}` }
                    }
                );
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Có lỗi xảy ra khi thực hiện thao tác này');
        }
    };

    if (loading) {
        return (
            <div className="word-details-container">
                <div className="loading-container">
                    <div className="loading-text">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="word-details-container">
                <div className="error-container">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="word-details-container">
            <div className="word-details-card">
                <div className="word-header">
                    <div className="word-title-container">
                        <h1 className="word-title">{wordData.word}</h1>
                        <button
                            onClick={toggleFavorite}
                            className="favorite-button"
                            title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                        >
                            {isFavorite ? (
                                <Heart className="favorite-icon favorite" fill="#ef4444" stroke="#ef4444" />
                            ) : (
                                <HeartOff className="favorite-icon" />
                            )}
                        </button>
                    </div>
                    <div className="word-phonetic-container">
                        <span className="word-phonetic">{wordData.phonetic}</span>
                        {wordData.phonetics?.some(p => p.audio) && (
                            <button
                                onClick={() => {
                                    const audio = wordData.phonetics.find(p => p.audio)?.audio;
                                    if (audio) new Audio(audio).play();
                                }}
                                className="audio-button"
                                title="Nghe phát âm"
                            >
                                <Volume2 className="audio-icon" size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {wordData.meanings.map((meaning, index) => (
                    <div key={index} className="meaning-section">
                        <h2 className="part-of-speech">{meaning.partOfSpeech}</h2>

                        <div className="meaning-content">
                            <div className="definitions-container">
                                <h3 className="section-title">Định nghĩa:</h3>
                                <ul className="definitions-list">
                                    {meaning.definitions.map((def, idx) => (
                                        <li key={idx} className="definition-item">
                                            <p className="definition-text">{def.definition}</p>
                                            {def.example && (
                                                <p className="example-text">
                                                    Ví dụ: {def.example}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {meaning.synonyms.length > 0 && (
                                <div className="synonyms-container">
                                    <h3 className="section-title">Từ đồng nghĩa:</h3>
                                    <div className="tags-container">
                                        {meaning.synonyms.map((syn, idx) => (
                                            <span key={idx} className="synonym-tag">
                                                {syn}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {meaning.antonyms.length > 0 && (
                                <div className="antonyms-container">
                                    <h3 className="section-title">Từ trái nghĩa:</h3>
                                    <div className="tags-container">
                                        {meaning.antonyms.map((ant, idx) => (
                                            <span key={idx} className="antonym-tag">
                                                {ant}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WordDetails;