import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ToeicReview.css';

const ToeicReview = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch submission
                const subRes = await axios.get(
                    `http://localhost:5000/api/submissions/${submissionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSubmission(subRes.data);

                // Fetch full exam với questions
                const examId = typeof subRes.data.examId === 'object'
                    ? subRes.data.examId._id
                    : subRes.data.examId;

                const examRes = await axios.get(`http://localhost:5000/api/exams/${examId}`);
                setExam(examRes.data);
            } catch (error) {
                console.error('Error fetching review data:', error);
                alert('Lỗi tải dữ liệu review');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [submissionId]);

    // Map user answers: questionId → answer object
    const userAnswerMap = submission?.answers?.reduce((acc, ans) => {
        acc[ans.questionId] = ans;
        return acc;
    }, {}) || {};

    if (loading) return <div className="review-loading">Đang tải chi tiết đáp án...</div>;
    if (!submission || !exam) return <div className="review-error">Không tìm thấy dữ liệu</div>;

    // Nhóm questions theo part, và xử lý group audio cho Part 3/4 nếu backend trả groups
    const questions = exam.questions || [];
    const groups = exam.groups || []; // nếu backend có groups cho Part 3/4

    return (
        <div className="review-container">
            <div className="review-card">
                <div className="review-header">
                    <h1>📋 Xem Đáp Án Chi Tiết</h1>
                    <p className="exam-title">{exam.title}</p>
                    <p className="score-summary">
                        Tổng điểm: <strong>{submission.scores.total}/990</strong> • 
                        Listening: <strong>{submission.scores.listening.scaled}</strong> • 
                        Reading: <strong>{submission.scores.reading.scaled}</strong>
                    </p>
                </div>

                <div className="review-content">
                    {/* Part 1-2: render từng câu riêng */}
                    {questions.filter(q => q.part <= 2).map(q => {
                        const userAns = userAnswerMap[q._id] || {};
                        return (
                            <QuestionItem
                                key={q._id}
                                question={q}
                                userAns={userAns}
                            />
                        );
                    })}

                    {/* Part 3-4: dùng groups nếu có, không thì fallback render từng câu */}
                    {(groups.length > 0 ? groups : questions.filter(q => q.part >= 3 && q.part <= 4))
                        .map((item, idx) => (
                            <ConversationItem
                                key={item._id || idx}
                                item={item}
                                questions={questions.filter(q => 
                                    groups.length > 0 
                                        ? q.groupId === item._id 
                                        : q.part === item.part
                                )}
                                userAnswerMap={userAnswerMap}
                            />
                        ))}

                    {/* Part 5-7: render từng câu (reading) */}
                    {questions.filter(q => q.part >= 5).map(q => {
                        const userAns = userAnswerMap[q._id] || {};
                        return (
                            <QuestionItem
                                key={q._id}
                                question={q}
                                userAns={userAns}
                            />
                        );
                    })}
                </div>

                <div className="review-actions">
                    <button className="btn-back" onClick={() => navigate(`/toeic/result/${submissionId}`)}>
                        ← Quay lại Kết quả
                    </button>
                    <button className="btn-history" onClick={() => navigate('/toeic/history')}>
                        Lịch Sử Làm Bài
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component con cho câu hỏi đơn lẻ (Part 1,2,5,6,7)
const QuestionItem = ({ question, userAns }) => {
    const isCorrect = userAns.isCorrect;
    const selected = userAns.selectedAnswer || '—';

    return (
        <div className={`question-item ${isCorrect === true ? 'correct' : isCorrect === false ? 'wrong' : 'unanswered'}`}>
            <div className="question-header">
                <span className="question-num">Câu {question.number}</span>
                <span className="part-badge">Part {question.part}</span>
            </div>

            {question.imageUrl && <img src={question.imageUrl} alt="question" className="q-image" />}
            {question.audioUrl && <audio controls src={question.audioUrl} className="q-audio" />}
            {question.questionText && <p className="q-text">{question.questionText}</p>}

            <div className="options-list">
                {['A', 'B', 'C', 'D'].map(opt => {
                    const isSelected = selected === opt;
                    const isCorrectAns = question.correctAnswer === opt;

                    return (
                        <div
                            key={opt}
                            className={`option ${isCorrectAns ? 'correct' : ''} ${isSelected && !isCorrectAns ? 'wrong' : ''} ${isSelected ? 'selected' : ''}`}
                        >
                            <span className="opt-label">{opt}</span>
                            <span className="opt-text">{question.options?.[opt] || question[`option${opt}`]}</span>
                            {isCorrectAns && <span className="tag correct-tag">Đúng</span>}
                            {isSelected && !isCorrectAns && <span className="tag wrong-tag">Của bạn</span>}
                        </div>
                    );
                })}
            </div>

            {question.explanation && (
                <div className="explanation">
                    <strong>Giải thích:</strong> {question.explanation}
                </div>
            )}
        </div>
    );
};

// Component cho Part 3/4 (conversation/talk)
const ConversationItem = ({ item, questions, userAnswerMap }) => {
    return (
        <div className="conversation-item">
            <div className="conversation-header">
                <span className="part-badge">Part {item.part || questions[0]?.part}</span>
            </div>

            {item.audioUrl && <audio controls src={item.audioUrl} className="group-audio" />}
            {item.transcript && <div className="transcript">{item.transcript}</div>}

            {questions.map(q => {
                const userAns = userAnswerMap[q._id] || {};
                return <QuestionItem key={q._id} question={q} userAns={userAns} />;
            })}
        </div>
    );
};

export default ToeicReview;