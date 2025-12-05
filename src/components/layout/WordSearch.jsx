import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './WordSearch.css';
const WordSearch = () => {
    const [word, setWord] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!word.trim()) return;
        navigate(`/dictionary/${word.toLowerCase()}`);
        setWord('');
    };

    return (
        <div className="search-wrapper">
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Từ vựng cần tìm..."
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    <Search size={20} />
                </button>
            </form>
        </div>
    );
};

export default WordSearch;