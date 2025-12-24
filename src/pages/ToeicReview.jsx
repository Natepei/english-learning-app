import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getBaseUrl } from '../utils/api';
import './ToeicReview.css';

const ToeicReview = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch submission with answers
                const subRes = await axios.get(
                    getApiUrl(`submissions/${submissionId}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSubmission(subRes.data);

                // Fetch all questions for the exam
                const examId = typeof subRes.data.examId === 'object'
                    ? subRes.data.examId._id
                    : subRes.data.examId;

                const qRes = await axios.get(
                    getApiUrl(`questions/exam/${examId}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Sort by question number
                const sorted = (qRes.data || []).sort((a, b) => a.questionNumber - b.questionNumber);
                setQuestions(sorted);

                console.log('✅ Loaded', sorted.length, 'questions for review');
            } catch (error) {
                console.error('Error fetching review data:', error);
                alert('Lỗi tải dữ liệu review');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [submissionId, token]);

    // Create map of answers by questionNumber for quick lookup
    const answerMap = submission?.answers?.reduce((acc, ans) => {
        acc[ans.questionNumber] = ans;
        return acc;
    }, {}) || {};

    if (loading) return <div className="review-loading">Đang tải chi tiết đáp án...</div>;
    if (!submission || !questions.length) return <div className="review-error">Không tìm thấy dữ liệu</div>;

    return (
        <div className="review-container">
            <div className="review-card">
                {/* Header */}
                <div className="review-header">
                    <h1>📋 Xem Đáp Án Chi Tiết</h1>
                    <p className="exam-title">{submission.examId?.title || 'TOEIC Test'}</p>
                    <p className="score-summary">
                        Tổng điểm: <strong>{submission.scores.total}/990</strong> • 
                        Listening: <strong>{submission.scores.listening.scaled}</strong> • 
                        Reading: <strong>{submission.scores.reading.scaled}</strong>
                    </p>
                </div>

                {/* Questions Review */}
                <div className="review-content">
                    {questions.map((question) => {
                        const answer = answerMap[question.questionNumber];
                        const isCorrect = answer?.isCorrect;
                        const userAnswer = answer?.userAnswer;

                        return (
                            <div
                                key={question._id}
                                className={`question-item ${isCorrect === true ? 'correct' : isCorrect === false ? 'wrong' : 'unanswered'}`}
                            >
                                {/* Question Header */}
                                <div className="question-header">
                                    <div className="question-info">
                                        <span className="question-num">Câu {question.questionNumber}</span>
                                        <span className="part-badge">Part {question.part}</span>
                                    </div>
                                    <div className="answer-status">
                                        {isCorrect === true && <span className="status-correct">✓ Đúng</span>}
                                        {isCorrect === false && <span className="status-wrong">✗ Sai</span>}
                                        {isCorrect === undefined && <span className="status-skip">⊘ Chưa trả lời</span>}
                                    </div>
                                </div>

                                {/* Audio (Part 1-4) */}
                                {[1, 2, 3, 4].includes(question.part) && question.audioUrl && (
                                    <div className="audio-section">
                                        <p className="audio-label">🔊 Audio:</p>
                                        <audio controls src={`${getBaseUrl()}${question.audioUrl}`} />
                                    </div>
                                )}

                                {/* Image (Part 1) */}
                                {question.part === 1 && question.imageUrl && (
                                    <div className="image-section">
                                        <img src={`${getBaseUrl()}${question.imageUrl}`} alt={`Q${question.questionNumber}`} />
                                    </div>
                                )}

                                {/* Question Text */}
                                {question.questionText && (
                                    <div className="question-text-section">
                                        <p className="label">Câu hỏi:</p>
                                        {question.questionText.includes('<') ? (
                                            <div dangerouslySetInnerHTML={{ __html: question.questionText }} className="q-text" />
                                        ) : (
                                            <p className="q-text">{question.questionText}</p>
                                        )}
                                    </div>
                                )}

                                {/* Options */}
                                <div className="options-section">
                                    <p className="label">Lựa chọn:</p>
                                    <div className="options-list">
                                        {['A', 'B', 'C', 'D'].map(option => {
                                            const isCorrectAnswer = question.correctAnswer === option;
                                            const isUserAnswer = userAnswer === option;
                                            const showWrong = isUserAnswer && !isCorrectAnswer;

                                            return (
                                                <div
                                                    key={option}
                                                    className={`option ${isCorrectAnswer ? 'correct-answer' : ''} ${showWrong ? 'wrong-answer' : ''}`}
                                                >
                                                    <span className="opt-label">{option}</span>
                                                    <span className="opt-text">{question.options?.[option] || ''}</span>
                                                    {isCorrectAnswer && <span className="tag correct-tag">Đáp án đúng</span>}
                                                    {showWrong && <span className="tag wrong-tag">Câu trả lời của bạn</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Explanation */}
                                {question.explanation && (
                                    <div className="explanation-section">
                                        <p className="label">💡 Giải thích:</p>
                                        {question.explanation.includes('<') ? (
                                            <div dangerouslySetInnerHTML={{ __html: question.explanation }} className="explanation" />
                                        ) : (
                                            <p className="explanation">{question.explanation}</p>
                                        )}
                                    </div>
                                )}

                                {/* User Answer Summary */}
                                <div className="answer-summary">
                                    <span>Đáp án đúng: <strong>{question.correctAnswer}</strong></span>
                                    {userAnswer && <span>Câu trả lời của bạn: <strong>{userAnswer}</strong></span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="review-actions">
                    <button className="btn-back" onClick={() => navigate(`/toeic/result/${submissionId}`)}>
                        ← Quay lại Kết quả
                    </button>
                    <button className="btn-history" onClick={() => navigate('/toeic/history')}>
                        📊 Lịch Sử Làm Bài
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToeicReview;