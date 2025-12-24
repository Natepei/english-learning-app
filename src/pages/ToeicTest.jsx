import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getBaseUrl } from '../utils/api';
import './ToeicTest.css';

const ToeicTest = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [passages, setPassages] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(7200);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const token = localStorage.getItem('token');

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      try {
        const subRes = await axios.get(getApiUrl(`submissions/${submissionId}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const sub = subRes.data;
        setSubmission(sub);
        
        const examId = sub.examId?._id || sub.examId;
        
        const [qRes, pRes] = await Promise.all([
          axios.get(getApiUrl(`questions/exam/${examId}`), {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(getApiUrl(`passages/exam/${examId}`), {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        const sortedQuestions = qRes.data.sort((a, b) => a.questionNumber - b.questionNumber);
        setQuestions(sortedQuestions);
        setPassages(pRes.data);
        
        const initialAnswers = {};
        sub.answers?.forEach(ans => {
          initialAnswers[ans.questionNumber] = ans.userAnswer;
        });
        setAnswers(initialAnswers);
        
        const elapsed = Math.floor((Date.now() - new Date(sub.startedAt)) / 1000);
        const duration = (sub.examId?.duration || 120) * 60;
        setTimeRemaining(Math.max(0, duration - elapsed));
        
      } catch (error) {
        console.error('Load error:', error);
        alert('Không thể tải bài thi');
        navigate('/toeic');
      } finally {
        setLoading(false);
      }
    };
    
    loadTest();
  }, [submissionId, token, navigate]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = async (questionNumber, answer) => {
    const newAnswers = { ...answers, [questionNumber]: answer };
    setAnswers(newAnswers);
    
    try {
      const question = questions.find(q => q.questionNumber === questionNumber);
      await axios.put(
        getApiUrl(`submissions/${submissionId}/answer`),
        {
          questionNumber,
          part: question?.part,
          userAnswer: answer
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    
    setSubmitting(true);
    try {
      await axios.put(
        getApiUrl(`submissions/${submissionId}/submit`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Nộp bài thành công!');
      navigate(`/toeic/result/${submissionId}`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (questions.length === 0) return <div className="no-questions">Không có câu hỏi</div>;
    
    const question = questions[currentQuestionIndex];
    if (!question) return <div className="no-questions">Câu hỏi không tồn tại</div>;
    
    const part = question.part;
    let passage = null;
    
    if ([6, 7].includes(part) && question.groupId) {
      passage = passages.find(p => p._id === question.groupId);
    }
    
    return (
      <div className="question-content">
        {/* Part Badge */}
        <div className="part-badge">Part {part}</div>
        
        {/* Listening Section (Parts 1-4) */}
        {[1, 2, 3, 4].includes(part) && (
          <div className="listening-section">
            {/* Audio Player */}
            {question.audioUrl && (
              <div className="audio-container">
                <audio 
                  controls 
                  src={`${getBaseUrl()}${question.audioUrl}`}
                  controlsList="nodownload"
                >
                  Your browser does not support audio.
                </audio>
              </div>
            )}
            
            {/* Image for Part 1 */}
            {part === 1 && question.imageUrl && (
              <div className="question-image-container">
                <img 
                  src={`${getBaseUrl()}${question.imageUrl}`} 
                  alt={`Question ${question.questionNumber}`}
                />
              </div>
            )}
            
            {/* Transcript */}
            {question.questionScript && (
              <div className="transcript-section">
                <strong>Transcript:</strong>
                <div className="transcript-content">{question.questionScript}</div>
              </div>
            )}
          </div>
        )}
        
        {/* Reading Section (Parts 5-7) - Show passage on left */}
        {[6, 7].includes(part) && passage && (
          <div className="reading-layout">
            <div className="passage-column">
              <div className="passage-header">
                <h3>READING PASSAGE {question.groupNumber || ''}</h3>
                <p className="passage-subtitle">
                  You should spend about 20 minutes on Questions {passage.questionNumbers?.[0]}-{passage.questionNumbers?.[passage.questionNumbers.length - 1]}, which are based on Reading Passage {question.groupNumber || ''} below.
                </p>
              </div>
              {passage.passages.map((p, idx) => (
                <div key={idx} className="passage-text">
                  {p.title && <h4>{p.title}</h4>}
                  {p.content.includes('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: p.content }} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{p.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Question Area */}
        <div className={[6, 7].includes(part) ? "questions-column" : "questions-full"}>
          <div className="question-header-bar">
            <span className="question-number-badge">{question.questionNumber}</span>
            <span className="question-title">
              {question.questionText ? (
                question.questionText.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
                ) : (
                  question.questionText
                )
              ) : (
                `Question ${question.questionNumber}`
              )}
            </span>
            <span className="bookmark-icon">💡</span>
          </div>
          
          {/* Part 5 - Show sentence with blank */}
          {part === 5 && question.questionText && (
            <div className="sentence-text">
              {question.questionText}
            </div>
          )}
          
          {/* Options */}
          <div className="options-list">
            {['A', 'B', 'C', 'D'].map(option => (
              <div 
                key={option}
                className={`option-item ${answers[question.questionNumber] === option ? 'selected' : ''}`}
                onClick={() => handleAnswer(question.questionNumber, option)}
              >
                <div className="option-letter">{option}</div>
                <div className="option-text">{question.options[option] || '(Empty)'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="test-loading">
        <div className="spinner"></div>
        <p>Đang tải bài thi...</p>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / 200) * 100;

  return (
    <div className="yola-test-container">
      {/* Top Bar */}
      <div className="yola-top-bar">
        <div className="test-title-section">
          <h1>{submission?.examId?.title || 'Test 1'}</h1>
          <p className="progress-text">{Object.keys(answers).length} / 200 câu đã làm</p>
        </div>
        <div className="timer-section">
          <div className={`timer-display ${timeRemaining < 600 ? 'warning' : ''}`}>
            ⏰ {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      {/* Main Layout */}
      <div className="yola-main-layout">
        {/* Left Sidebar - Question Navigator */}
        <div className="yola-sidebar">
          <div className="questions-navigator">
            <div className="part-sections">
              {[1, 2, 3, 4, 5, 6, 7].map(part => {
                const partQuestions = questions.filter(q => q.part === part);
                if (partQuestions.length === 0) return null;
                
                return (
                  <div key={part} className="part-section">
                    <div className="part-section-header">Part {part}</div>
                    <div className="part-questions-grid">
                      {partQuestions.map((q, idx) => {
                        const globalIdx = questions.findIndex(gq => gq._id === q._id);
                        return (
                          <button
                            key={q._id}
                            className={`q-nav-btn 
                              ${currentQuestionIndex === globalIdx ? 'current' : ''}
                              ${answers[q.questionNumber] ? 'answered' : ''}
                            `}
                            onClick={() => goToQuestion(globalIdx)}
                          >
                            {q.questionNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="navigator-legend">
              <div className="legend-item">
                <span className="legend-box answered"></span>
                <span>Đã làm</span>
              </div>
              <div className="legend-item">
                <span className="legend-box current"></span>
                <span>Hiện tại</span>
              </div>
              <div className="legend-item">
                <span className="legend-box"></span>
                <span>Chưa làm</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Content Area */}
        <div className="yola-content">
          {renderQuestion()}
          
          {/* Bottom Navigation */}
          <div className="bottom-navigation">
            <button 
              className="nav-btn prev-btn"
              onClick={goPrevious}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            
            <button 
              className="nav-btn next-btn"
              onClick={goNext}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next →
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="review-btn" onClick={() => setShowReview(true)}>
              📋 Review Answers
            </button>
            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '⏳ Đang nộp...' : '✅ Nộp Bài'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Review Modal */}
      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="review-modal" onClick={e => e.stopPropagation()}>
            <h2>Review Your Answers</h2>
            <div className="review-grid">
              {questions.map((q, idx) => (
                <div 
                  key={q._id}
                  className={`review-cell ${answers[q.questionNumber] ? 'answered' : 'unanswered'}`}
                  onClick={() => {
                    setShowReview(false);
                    goToQuestion(idx);
                  }}
                >
                  <span className="q-num">Q{q.questionNumber}</span>
                  <span className="q-ans">{answers[q.questionNumber] || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReview(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToeicTest;
