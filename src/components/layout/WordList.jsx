import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WordList.css';

const WordList = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                setLoading(true);
                setError(null);

                // Giả sử có API trả về danh sách các từ. Nếu không, bạn có thể định nghĩa tạm danh sách.
                const wordList =
                    [
                        "abandon", "ability", "absence", "academic", "acceptable", "accomplish", "accurate",
                        "achieve", "acknowledge", "acquire", "adapt", "advantage", "affect", "analysis",
                        "analyze", "approach", "assessment", "assistance", "assume", "attitude", "benefit",
                        "capacity", "challenge", "category", "conclusion", "conflict", "consequence", "contribute",
                        "coordinate", "creative", "criticism", "debate", "demonstrate", "discipline", "diversity",
                        "economy", "efficient", "environment", "evidence", "examine", "expand", "expectation",
                        "expertise", "familiar", "function", "impact", "indicate", "influence", "innovation",
                        "institute", "interpret", "justify", "method", "notion", "obtain", "perspective", "priority",
                        "process", "relevant", "significance", "strategy", "subsequent", "transform", "transition"
                    ];

                setWords(wordList);
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách từ.');
            } finally {
                setLoading(false);
            }
        };

        fetchWords();
    }, []);

    if (loading) {
        return <div className="loading">Đang tải danh sách từ...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="word-list-container">
            <h1>Danh sách một vài từ vựng thông dụng</h1>
            <ul className="word-list">
                {words.map((word, index) => (
                    <li key={index} className="word-item">
                        <Link to={`/dictionary/${word}`} className="word-link">
                            {word}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WordList;
