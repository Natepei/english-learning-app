import React from 'react';
import AudioPlayer from './AudioPlayer';
import './Part2Question.css';

const Part2Question = ({
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
            onSelectAnswer(question.questionNumber, option, 2);
        }
    };

    return (
        <div className="part2-container">
            {/* Question Header */}
            <div className="question-header">
                <div className="question-number">
                    Question {currentIndex + 1} of {totalQuestions}
                </div>
                <div className="progress-indicator">
                    {currentIndex + 1}/{totalQuestions}
                </div>
            </div>

            {/* Part 2 Description */}
            <div className="part2-description">
                <p>🎧 Listen to the question or statement and three possible responses.</p>
                <p>Select the best response.</p>
            </div>

            {/* Audio Player */}
            <AudioPlayer
                audioUrl={question.audioUrl}
                questionNumber={question.questionNumber}
                part={2}
                mode={mode}
                onPlay={onAudioPlay}
                className="part2-audio"
            />

            {/* Answer Options (No Text - Just Letters) */}
            <div className="options-section">
                <div className="options-label">
                    Select the best response:
                </div>
                <div className="options-grid part2-options">
                    {['A', 'B', 'C'].map(option => (
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
                    <strong>Part 2 - Question-Response:</strong> You will hear a question or statement 
                    followed by three possible responses. Choose the best response.
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

export default Part2Question;
