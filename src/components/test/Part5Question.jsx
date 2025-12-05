import React from 'react';
import './Part5Question.css';

const Part5Question = ({
    question,
    currentIndex,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
    onNext,
    onPrevious,
    canGoPrevious,
    canGoNext
}) => {
    if (!question) {
        return <div className="part-loading">Loading question...</div>;
    }

    const handleAnswerClick = (option) => {
        if (onSelectAnswer) {
            onSelectAnswer(question.questionNumber, option, 5);
        }
    };

    // Parse sentence to highlight blank
    const sentenceParts = question.sentence.split('_____');

    return (
        <div className="part5-container">
            {/* Question Header */}
            <div className="question-header">
                <div className="question-number">
                    Question {currentIndex + 1} of {totalQuestions}
                </div>
                <div className="progress-indicator">
                    {currentIndex + 1}/{totalQuestions}
                </div>
            </div>

            {/* Grammar Point (if available) */}
            {question.grammarPoint && (
                <div className="grammar-hint">
                    <span className="hint-label">Grammar Focus:</span>
                    <span className="hint-text">{question.grammarPoint}</span>
                </div>
            )}

            {/* Sentence with Blank */}
            <div className="sentence-section">
                <div className="sentence-text">
                    {sentenceParts[0]}
                    <span className="blank">_____</span>
                    {sentenceParts[1]}
                </div>
            </div>

            {/* Answer Options */}
            <div className="options-section">
                <div className="options-label">
                    Choose the best word or phrase:
                </div>
                <div className="options-grid part5-options">
                    {['A', 'B', 'C', 'D'].map(option => (
                        <button
                            key={option}
                            className={`option-full-text ${selectedAnswer === option ? 'selected' : ''}`}
                            onClick={() => handleAnswerClick(option)}
                        >
                            <span className="option-letter">{option}</span>
                            <span className="option-text">{question.options[option]}</span>
                            {selectedAnswer === option && <span className="check-icon">✓</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="navigation-section">
                <button
                    className="nav-button prev"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                >
                    ← Previous
                </button>

                <div className="nav-info">
                    {selectedAnswer ? (
                        <span className="answer-status answered">
                            ✓ Answered: {selectedAnswer}
                        </span>
                    ) : (
                        <span className="answer-status unanswered">
                            ○ Not answered yet
                        </span>
                    )}
                </div>

                <button
                    className="nav-button next"
                    onClick={onNext}
                    disabled={!canGoNext}
                >
                    Next →
                </button>
            </div>

            {/* Instructions */}
            <div className="part-instructions">
                <p>
                    <strong>Part 5 - Incomplete Sentences:</strong> Complete each sentence by choosing 
                    the best word or phrase.
                </p>
                <p>
                    💡 <strong>Tip:</strong> Read the entire sentence carefully. Consider grammar, 
                    vocabulary, and the meaning of the sentence.
                </p>
            </div>
        </div>
    );
};

export default Part5Question;
