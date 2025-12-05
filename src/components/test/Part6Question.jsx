import React, { useState } from 'react';
import './Part6Question.css';

const Part6Question = ({
    passage,
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

    if (!passage) {
        return <div className="part-loading">Loading passage...</div>;
    }

    const handleAnswerClick = (questionNumber, option) => {
        if (onSelectAnswer) {
            onSelectAnswer(questionNumber, option, 6);
        }
    };

    const answeredCount = passage.questions.filter(q =>
        selectedAnswers[q.questionNumber]
    ).length;

    return (
        <div className="part6-container">
            {/* Header */}
            <div className="question-header">
                <div className="question-number">
                    Text {passageIndex + 1} of {totalPassages}
                </div>
                <div className="progress-indicator">
                    Questions {passage.questions[0]?.questionNumber} - {passage.questions[3]?.questionNumber}
                </div>
            </div>

            {/* Passage Text */}
            <div className="passage-section">
                <div className="passage-text">
                    {passage.passageText.split(/(\[[\d]{3}\])/g).map((part, idx) => {
                        if (part.match(/\[\d{3}\]/)) {
                            const questionNum = parseInt(part.match(/\d+/)[0]);
                            const question = passage.questions.find(q => q.questionNumber === questionNum);
                            
                            return (
                                <div key={idx} className="question-in-passage">
                                    <span className="blank-marker">{part}</span>
                                    
                                    {/* Inline Options */}
                                    <div className="inline-options">
                                        {question && ['A', 'B', 'C', 'D'].map(option => (
                                            <button
                                                key={option}
                                                className={`inline-option ${
                                                    selectedAnswers[questionNum] === option ? 'selected' : ''
                                                }`}
                                                onClick={() => handleAnswerClick(questionNum, option)}
                                                title={question.options[option]}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return <span key={idx}>{part}</span>;
                    })}
                </div>
            </div>

            {/* Questions Detail Section */}
            <div className="questions-detail-section">
                <div className="section-label">
                    📝 Review questions and options:
                </div>

                {passage.questions.map((question) => (
                    <div key={question.questionNumber} className="question-detail">
                        <button
                            className="question-header-detail"
                            onClick={() => setExpandedQuestion(
                                expandedQuestion === question.questionNumber ? null : question.questionNumber
                            )}
                        >
                            <span className="question-num">Q{question.questionNumber}</span>
                            <span className="expand-icon">
                                {expandedQuestion === question.questionNumber ? '▼' : '▶'}
                            </span>
                        </button>

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
                    </div>
                ))}
            </div>

            {/* Answer Summary */}
            <div className="answer-summary">
                <span className="summary-text">
                    Answered: {answeredCount}/4 blanks
                </span>
                <div className="summary-dots">
                    {passage.questions.map((q) => (
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
                    ← Previous Text
                </button>

                <div className="nav-info">
                    Text {passageIndex + 1}/{totalPassages}
                </div>

                <button
                    className="nav-button next"
                    onClick={onNext}
                    disabled={!canGoNext}
                >
                    Next Text →
                </button>
            </div>

            {/* Instructions */}
            <div className="part-instructions">
                <p>
                    <strong>Part 6 - Text Completion:</strong> Read the passage and fill in the 4 blanks 
                    [131], [132], [133], [134] with the best option.
                </p>
                <p>
                    💡 <strong>Tip:</strong> Read the entire passage first, then fill in each blank. 
                    Consider grammar, vocabulary, and the flow of the text.
                </p>
            </div>
        </div>
    );
};

export default Part6Question;
