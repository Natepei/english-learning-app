import React, { useState } from 'react';
import './Part7Question.css';

const Part7Question = ({
    passageSet,
    passageIndex,
    totalPassages,
    selectedAnswers,
    onSelectAnswer,
    onNext,
    onPrevious,
    canGoPrevious,
    canGoNext
}) => {
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    if (!passageSet) {
        return <div className="part-loading">Loading passage...</div>;
    }

    const handleAnswerClick = (questionNumber, option) => {
        if (onSelectAnswer) {
            onSelectAnswer(questionNumber, option, 7);
        }
    };

    const answeredCount = passageSet.questions.filter(q =>
        selectedAnswers[q.questionNumber]
    ).length;

    const getPassageTypeDisplay = () => {
        const type = passageSet.passageType;
        if (type === 'single') return 'Single Passage';
        if (type === 'double') return 'Two Passages';
        if (type === 'triple') return 'Three Passages';
        return 'Passage';
    };

    return (
        <div className="part7-container">
            {/* Header */}
            <div className="question-header">
                <div className="question-number">
                    {getPassageTypeDisplay()} {passageIndex + 1} of {totalPassages}
                </div>
                <div className="progress-indicator">
                    Questions {passageSet.questions[0]?.questionNumber} - {passageSet.questions[passageSet.questions.length - 1]?.questionNumber}
                </div>
            </div>

            {/* Passages Section */}
            <div className="passages-container">
                {passageSet.passages.map((passage, idx) => (
                    <div key={idx} className="passage-card">
                        {/* Passage Type Badge */}
                        {passage.type && (
                            <div className="passage-type-badge">{passage.type}</div>
                        )}

                        {/* Passage Title */}
                        {passage.title && (
                            <div className="passage-title">{passage.title}</div>
                        )}

                        {/* Passage Content */}
                        <div className="passage-content">
                            {passage.content}
                        </div>

                        {/* Divider between passages */}
                        {idx < passageSet.passages.length - 1 && (
                            <div className="passage-divider" />
                        )}
                    </div>
                ))}
            </div>

            {/* Questions Section */}
            <div className="questions-section">
                <div className="section-label">
                    📝 Answer the questions based on the passage{passageSet.passages.length > 1 ? 's' : ''}:
                </div>

                {passageSet.questions.map((question) => (
                    <div key={question.questionNumber} className="question-block">
                        {/* Question Header */}
                        <button
                            className="question-header-button"
                            onClick={() => setExpandedQuestion(
                                expandedQuestion === question.questionNumber ? null : question.questionNumber
                            )}
                        >
                            <span className="question-num">Q{question.questionNumber}</span>
                            <span className="question-text-preview">{question.questionText}</span>
                            <span className="expand-icon">
                                {expandedQuestion === question.questionNumber ? '▼' : '▶'}
                            </span>
                        </button>

                        {/* Question Options */}
                        {expandedQuestion === question.questionNumber && (
                            <div className="question-options">
                                {['A', 'B', 'C', 'D'].map(option => (
                                    <button
                                        key={option}
                                        className={`option-full-text ${
                                            selectedAnswers[question.questionNumber] === option ? 'selected' : ''
                                        }`}
                                        onClick={() => handleAnswerClick(question.questionNumber, option)}
                                    >
                                        <span className="option-letter">{option}</span>
                                        <span className="option-text">{question.options[option]}</span>
                                        {selectedAnswers[question.questionNumber] === option && (
                                            <span className="check-icon">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quick Selection */}
                        <div className="quick-select">
                            {['A', 'B', 'C', 'D'].map(option => (
                                <button
                                    key={option}
                                    className={`quick-option ${
                                        selectedAnswers[question.questionNumber] === option ? 'selected' : ''
                                    }`}
                                    onClick={() => handleAnswerClick(question.questionNumber, option)}
                                    title={question.options[option]}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Answer Summary */}
            <div className="answer-summary">
                <span className="summary-text">
                    Answered: {answeredCount}/{passageSet.questions.length} questions
                </span>
                <div className="summary-dots">
                    {passageSet.questions.map((q) => (
                        <div
                            key={q.questionNumber}
                            className={`dot ${selectedAnswers[q.questionNumber] ? 'answered' : ''}`}
                            title={`Q${q.questionNumber}`}
                        />
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
                    {getPassageTypeDisplay()} {passageIndex + 1}/{totalPassages}
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
                    <strong>Part 7 - Reading Comprehension:</strong> Read the passage{passageSet.passages.length > 1 ? 's' : ''} 
                    and answer the questions.
                </p>
                <p>
                    💡 <strong>Tip:</strong> 
                    {passageSet.passages.length === 1 
                        ? " Read carefully and locate relevant information to answer each question."
                        : " For multiple passages, note how the passages relate to each other. Some questions may refer to both passages."}
                </p>
            </div>
        </div>
    );
};

export default Part7Question;
