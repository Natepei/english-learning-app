import React from 'react';
import AudioPlayer from './AudioPlayer';
import './Part1Question.css';

const Part1Question = ({
    question,
    currentIndex,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
    onNext,
    onPrevious,
    canGoPrevious,
    canGoNext,
    mode = 'practice',
    onAudioPlay = null
}) => {
    if (!question) {
        return <div className="part-loading">Loading question...</div>;
    }

    const handleAnswerClick = (option) => {
        if (onSelectAnswer) {
            onSelectAnswer(question.questionNumber, option, 1);
        }
    };

    return (
        <div className="part1-container">
            {/* Question Header */}
            <div className="question-header">
                <div className="question-number">
                    Question {currentIndex + 1} of {totalQuestions}
                </div>
                <div className="progress-indicator">
                    {currentIndex + 1}/{totalQuestions}
                </div>
            </div>

            {/* Image Section */}
            <div className="image-section">
                {question.imageUrl ? (
                    <img
                        src={`http://localhost:5000${question.imageUrl}`}
                        alt="Part 1 Photograph"
                        className="question-image"
                    />
                ) : (
                    <div className="no-image">📸 Image not available</div>
                )}
            </div>

            {/* Audio Player */}
            <AudioPlayer
                audioUrl={question.audioUrl}
                questionNumber={question.questionNumber}
                part={1}
                mode={mode}
                onPlay={onAudioPlay}
                className="part1-audio"
            />

            {/* Answer Options (No Text - Just Letters) */}
            <div className="options-section">
                <div className="options-label">
                    🎤 Select the correct response:
                </div>
                <div className="options-grid">
                    {['A', 'B', 'C', 'D'].map(option => (
                        <button
                            key={option}
                            className={`option-button ${selectedAnswer === option ? 'selected' : ''}`}
                            onClick={() => handleAnswerClick(option)}
                            aria-label={`Option ${option}`}
                        >
                            <span className="option-letter">{option}</span>
                            <span className="option-indicator">
                                {selectedAnswer === option && '✓'}
                            </span>
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
                    <strong>Part 1 - Photographs:</strong> Listen to the audio and select the statement 
                    that best describes the photograph.
                </p>
                <p>
                    {mode === 'real_exam' ? (
                        <>🔒 <strong>Real Exam Mode:</strong> You can listen to the audio only once per question.</>
                    ) : (
                        <>♾️ <strong>Practice Mode:</strong> You can listen to the audio unlimited times.</>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Part1Question;
