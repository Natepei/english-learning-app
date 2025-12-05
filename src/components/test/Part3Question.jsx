import React from 'react';
import AudioPlayer from './AudioPlayer';
import './Part3Question.css';

const Part3Question = ({
    conversation,
    conversationIndex,
    totalConversations,
    selectedAnswers,
    onSelectAnswer,
    onNext,
    onPrevious,
    canGoPrevious,
    canGoNext,
    mode = 'practice',
    onAudioPlay = null
}) => {
    if (!conversation) {
        return <div className="part-loading">Loading conversation...</div>;
    }

    const handleAnswerClick = (questionNumber, option) => {
        if (onSelectAnswer) {
            onSelectAnswer(questionNumber, option, 3);
        }
    };

    const answeredCount = conversation.questions.filter(q => 
        selectedAnswers[q.questionNumber]
    ).length;

    return (
        <div className="part3-container">
            {/* Header */}
            <div className="question-header">
                <div className="question-number">
                    Conversation {conversationIndex + 1} of {totalConversations}
                </div>
                <div className="progress-indicator">
                    Questions {conversation.questions[0]?.questionNumber} - {conversation.questions[2]?.questionNumber}
                </div>
            </div>

            {/* Visual Aid (if available) */}
            {conversation.imageUrl && (
                <div className="image-section">
                    <img
                        src={`http://localhost:5000${conversation.imageUrl}`}
                        alt="Conversation Context"
                        className="question-image"
                    />
                </div>
            )}

            {/* Audio Player */}
            <AudioPlayer
                audioUrl={conversation.audioUrl}
                questionNumber={conversation.questions[0]?.questionNumber}
                part={3}
                mode={mode}
                onPlay={onAudioPlay}
                className="part3-audio"
            />

            {/* Questions Section */}
            <div className="questions-section">
                <div className="section-label">
                    📝 Answer these 3 questions about the conversation:
                </div>

                {conversation.questions.map((question, idx) => (
                    <div key={question.questionNumber} className="question-block">
                        {/* Question Number */}
                        <div className="question-title">
                            <span className="question-num">Q{question.questionNumber}</span>
                            <span className="question-text">{question.questionText}</span>
                        </div>

                        {/* Answer Options */}
                        <div className="options-container">
                            {['A', 'B', 'C', 'D'].map(option => (
                                <button
                                    key={option}
                                    className={`option-full-text ${
                                        selectedAnswers[question.questionNumber] === option ? 'selected' : ''
                                    }`}
                                    onClick={() => handleAnswerClick(question.questionNumber, option)}
                                >
                                    <span className="option-letter">{option}</span>
                                    <span className="option-text">
                                        {question.options[option]}
                                    </span>
                                    {selectedAnswers[question.questionNumber] === option && (
                                        <span className="check-icon">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Answer Summary */}
            <div className="answer-summary">
                <span className="summary-text">
                    Answered: {answeredCount}/3 questions
                </span>
                <div className="summary-dots">
                    {conversation.questions.map((q, idx) => (
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
                    ← Previous Conversation
                </button>

                <div className="nav-info">
                    Conversation {conversationIndex + 1}/{totalConversations}
                </div>

                <button
                    className="nav-button next"
                    onClick={onNext}
                    disabled={!canGoNext}
                >
                    Next Conversation →
                </button>
            </div>

            {/* Instructions */}
            <div className="part-instructions">
                <p>
                    <strong>Part 3 - Short Conversations:</strong> You will hear a short conversation. 
                    First, read the 3 questions. Then listen to the conversation and answer the questions.
                </p>
                <p>
                    💡 <strong>Strategy:</strong> Read all 3 questions BEFORE listening to the conversation.
                </p>
            </div>
        </div>
    );
};

export default Part3Question;
