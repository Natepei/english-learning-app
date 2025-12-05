import React, { useState } from 'react';
import './AnswerReview.css';

const AnswerReview = ({
    answers = {},
    questionsGrouped = {},
    onSubmit = null,
    onCancel = null,
    isSubmitting = false
}) => {
    const [selectedPart, setSelectedPart] = useState(1);
    const [expandedConversation, setExpandedConversation] = useState(null);

    const partTotals = {
        1: 6, 2: 25, 3: 39, 4: 30,
        5: 30, 6: 16, 7: 54
    };

    const getPartQuestions = (part) => {
        const partQuestions = questionsGrouped[part];
        if (!partQuestions) return [];

        const questionNumbers = new Set();

        if ([3, 4, 6, 7].includes(part)) {
            partQuestions.forEach(group => {
                group.questions.forEach(q => {
                    questionNumbers.add(q.questionNumber);
                });
            });
        } else {
            partQuestions.forEach(q => {
                questionNumbers.add(q.questionNumber);
            });
        }

        return Array.from(questionNumbers).sort((a, b) => a - b);
    };

    const getAnswerStatus = (questionNumber) => {
        if (answers[questionNumber]) {
            return { answered: true, answer: answers[questionNumber] };
        }
        return { answered: false, answer: null };
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit();
        }
    };

    return (
        <div className="answer-review">
            {/* Header */}
            <div className="review-header">
                <h2>📋 Review Your Answers</h2>
                <p>Check all your answers before submitting the test</p>
            </div>

            {/* Part Tabs */}
            <div className="review-tabs">
                {[1, 2, 3, 4, 5, 6, 7].map(part => {
                    const questions = getPartQuestions(part);
                    const answered = questions.filter(q => answers[q]).length;
                    const isActive = selectedPart === part;

                    return (
                        <button
                            key={part}
                            className={`review-tab ${isActive ? 'active' : ''}`}
                            onClick={() => setSelectedPart(part)}
                        >
                            <span className="part-label">Part {part}</span>
                            <span className="part-stat">{answered}/{questions.length}</span>
                        </button>
                    );
                })}
            </div>

            {/* Answer Grid */}
            <div className="review-content">
                <div className="answers-grid">
                    {getPartQuestions(selectedPart).map(qNum => {
                        const status = getAnswerStatus(qNum);

                        return (
                            <div
                                key={qNum}
                                className={`answer-card ${status.answered ? 'answered' : 'unanswered'}`}
                            >
                                <div className="question-number">Q{qNum}</div>
                                <div className="answer-display">
                                    {status.answered ? (
                                        <div className="answer-badge">
                                            {status.answer}
                                        </div>
                                    ) : (
                                        <div className="no-answer">
                                            <span>❌</span>
                                            <span>No Answer</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Unanswered Summary */}
                {getPartQuestions(selectedPart).some(q => !answers[q]) && (
                    <div className="unanswered-warning">
                        <span>⚠️</span>
                        <span>
                            {getPartQuestions(selectedPart).filter(q => !answers[q]).length} questions 
                            not answered in Part {selectedPart}
                        </span>
                    </div>
                )}
            </div>

            {/* Overall Summary */}
            <div className="review-summary">
                <div className="summary-stat">
                    <span className="label">Total Answered</span>
                    <span className="value">
                        {Object.keys(answers).length}/200
                    </span>
                </div>
                <div className="summary-stat">
                    <span className="label">Not Answered</span>
                    <span className="value">
                        {200 - Object.keys(answers).length}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="review-actions">
                <button
                    className="btn-secondary"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    ← Go Back & Edit
                </button>
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner"></span>
                            Submitting...
                        </>
                    ) : (
                        '✓ Submit Test'
                    )}
                </button>
            </div>

            {/* Confirmation */}
            <div className="confirmation-message">
                <p>⚠️ Once you submit, you cannot change your answers.</p>
            </div>
        </div>
    );
};

export default AnswerReview;
