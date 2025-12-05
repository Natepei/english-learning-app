import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useTestSession from '../hooks/useTestSession';
import { calculateAllScores } from '../utils/scoreCalculator';

// Components
import TestTimer from '../components/test/TestTimer';
import TestNavigation from '../components/test/TestNavigation';
import TestProgressBar from '../components/test/TestProgressBar';
import AnswerReview from '../components/test/AnswerReview';

// Part Components
import Part1Question from '../components/test/Part1Question';
import Part2Question from '../components/test/Part2Question';
import Part3Question from '../components/test/Part3Question';
import Part4Question from '../components/test/Part4Question';
import Part5Question from '../components/test/Part5Question';
import Part6Question from '../components/test/Part6Question';
import Part7Question from '../components/test/Part7Question';

import './ToeicTest.css';

const ToeicTest = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Main state
    const [submission, setSubmission] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showReview, setShowReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Use test session hook for state management
    const testSession = useTestSession(questions, submission);

    // Debug logging
    useEffect(() => {
        console.log('🎯 ToeicTest mounted with submissionId:', submissionId);
    }, [submissionId]);

    useEffect(() => {
        console.log('📊 State changed:', {
            loading,
            submissionLoaded: !!submission,
            questionsCount: questions.length,
            error
        });
    }, [loading, submission, questions, error]);

    // Fetch test data on mount
    useEffect(() => {
        fetchTestData();
    }, [submissionId]);

    // Handle timer countdown
    useEffect(() => {
        if (timeRemaining <= 0 || !submission) {
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, submission]);

    /**
     * Fetch submission and questions
     */
    const fetchTestData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Fetching submission:', submissionId);
            // First, get the submission to find the exam ID
            const submissionRes = await axios.get(
                `http://localhost:5000/api/submissions/${submissionId}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('✅ Submission loaded:', submissionRes.data);
            const sub = submissionRes.data;
            const examId = sub.examId._id || sub.examId;
            console.log('📝 Exam ID extracted:', examId);
            
            console.log('🔄 Fetching questions for exam:', examId);
            // Then fetch questions for that exam
            const questionsRes = await axios.get(
                `http://localhost:5000/api/questions/exam/${examId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ Questions loaded:', questionsRes.data.length, 'questions');
            setSubmission(sub);
            setQuestions(questionsRes.data);
            
            if (!questionsRes.data || questionsRes.data.length === 0) {
                console.warn('⚠️ No questions found for this exam!');
                setError('Không tìm thấy câu hỏi cho bộ đề này');
            }

            // Calculate remaining time
            console.log('📋 Submission data:', { 
                examId: sub.examId, 
                startedAt: sub.startedAt,
                duration: sub.examId?.duration 
            });
            
            // Get exam duration - handle both object and string ID
            const duration = typeof sub.examId === 'object' ? sub.examId.duration : 120;
            const examDuration = (duration || 120) * 60; // Convert to seconds, default to 120 min
            
            const startTime = new Date(sub.startedAt).getTime();
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, examDuration - elapsed);
            
            console.log('⏱️ Time calculation:', { 
                examDuration, 
                elapsed, 
                remaining,
                isValidNumber: !isNaN(remaining)
            });
            
            setTimeRemaining(remaining);
        } catch (error) {
            console.error('❌ Error fetching test data:', error);
            console.error('Error response:', error.response?.data);
            setError(`Lỗi: ${error.response?.data?.message || error.message}`);
            alert('Error loading test. Redirecting to exams list.');
            navigate('/dashboard/exams');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle answer selection and auto-save
     */
    const handleSelectAnswer = async (questionNumber, answer, part) => {
        testSession.handleAnswer(questionNumber, answer, async (qNum, ans) => {
            // Auto-save to server
            try {
                await axios.put(
                    `http://localhost:5000/api/submissions/${submissionId}/answer`,
                    {
                        questionNumber: qNum,
                        part: part,
                        userAnswer: ans
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error('Error saving answer:', error);
            }
        });
    };

    /**
     * Handle audio play event
     */
    const handleAudioPlay = (questionNumber, part) => {
        // Track audio plays if needed
    };

    /**
     * Submit test
     */
    const handleSubmitTest = async () => {
        if (showReview && !window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const answerArray = testSession.getAnswersArray();

            // Calculate scores
            const scores = calculateAllScores(
                answerArray.map(ans => {
                    const question = findQuestion(ans.questionNumber);
                    return {
                        part: ans.part,
                        isCorrect: question ? ans.userAnswer === question.correctAnswer : false
                    };
                })
            );

            // Submit to server
            const response = await axios.put(
                `http://localhost:5000/api/submissions/${submissionId}/submit`,
                {
                    answers: answerArray,
                    timeSpent: Math.floor((new Date(submission.startedAt).getTime() - Date.now()) / 1000) + submission.examId.duration * 60,
                    scores
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Redirect to results
            navigate(`/toeic/result/${submissionId}`);
        } catch (error) {
            console.error('Error submitting test:', error);
            alert('Error submitting test. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Find question by number
     */
    const findQuestion = (questionNumber) => {
        for (let part = 1; part <= 7; part++) {
            const partQuestions = testSession.questionsGrouped[part];
            if (!partQuestions) continue;

            if ([3, 4, 6, 7].includes(part)) {
                for (const group of partQuestions) {
                    const found = group.questions.find(q => q.questionNumber === questionNumber);
                    if (found) return found;
                }
            } else {
                const found = partQuestions.find(q => q.questionNumber === questionNumber);
                if (found) return found;
            }
        }
        return null;
    };

    /**
     * Render part-specific question component
     */
    const renderPartComponent = () => {
        const currentQuestion = testSession.getCurrentQuestion();
        const progress = testSession.getProgress();

        if (!currentQuestion) {
            return <div className="loading-message">Loading question...</div>;
        }

        const partTotal = testSession.getPartTotalQuestions();
        const answersByPart = testSession.answeredCount[testSession.currentPart] || 0;

        const commonProps = {
            onNext: testSession.goToNext,
            onPrevious: testSession.goToPrevious,
            canGoNext: !testSession.isAtEndOfPart(),
            canGoPrevious: !testSession.isAtStartOfPart(),
            mode: submission?.mode || 'practice',
            onAudioPlay: handleAudioPlay
        };

        switch (testSession.currentPart) {
            case 1:
                return (
                    <Part1Question
                        question={currentQuestion}
                        currentIndex={testSession.currentPartIndex}
                        totalQuestions={partTotal}
                        selectedAnswer={testSession.getAnswer(currentQuestion.questionNumber)}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            case 2:
                return (
                    <Part2Question
                        question={currentQuestion}
                        currentIndex={testSession.currentPartIndex}
                        totalQuestions={partTotal}
                        selectedAnswer={testSession.getAnswer(currentQuestion.questionNumber)}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            case 3:
                return (
                    <Part3Question
                        conversation={currentQuestion}
                        conversationIndex={testSession.currentPartIndex}
                        totalConversations={testSession.getPartItemCount()}
                        selectedAnswers={testSession.answers}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            case 4:
                return (
                    <Part4Question
                        talk={currentQuestion}
                        talkIndex={testSession.currentPartIndex}
                        totalTalks={testSession.getPartItemCount()}
                        selectedAnswers={testSession.answers}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            case 5:
                return (
                    <Part5Question
                        question={currentQuestion}
                        currentIndex={testSession.currentPartIndex}
                        totalQuestions={partTotal}
                        selectedAnswer={testSession.getAnswer(currentQuestion.questionNumber)}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            case 6:
                return (
                    <Part6Question
                        passage={currentQuestion}
                        passageIndex={testSession.currentPartIndex}
                        totalPassages={testSession.getPartItemCount()}
                        selectedAnswers={testSession.answers}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            case 7:
                return (
                    <Part7Question
                        passageSet={currentQuestion}
                        passageIndex={testSession.currentPartIndex}
                        totalPassages={testSession.getPartItemCount()}
                        selectedAnswers={testSession.answers}
                        onSelectAnswer={handleSelectAnswer}
                        {...commonProps}
                    />
                );

            default:
                return <div>Unknown part</div>;
        }
    };

    if (loading) {
        return (
            <div className="test-loading">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>⏳ Đang tải bài test...</h2>
                    <p>Vui lòng chờ...</p>
                    {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="test-loading">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>❌ Lỗi</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!submission) return <div className="test-loading">Error loading test</div>;

    const progress = testSession.getProgress();

    return (
        <div className="test-container">
            {/* Fixed Header */}
            <TestTimer timeRemaining={timeRemaining} onTimeUp={handleSubmitTest} />

            <div className="test-main">
                {/* Sidebar Navigation */}
                <div className="test-sidebar">
                    <TestNavigation
                        currentPart={testSession.currentPart}
                        onPartSelect={testSession.goToPart}
                        questionsGrouped={testSession.questionsGrouped}
                        answers={testSession.answers}
                    />
                </div>

                {/* Main Content */}
                <div className="test-content">
                    {/* Progress Bar */}
                    <TestProgressBar
                        currentProgress={progress}
                        totalQuestions={200}
                    />

                    {/* Question Component */}
                    <div className="question-container">
                        {renderPartComponent()}
                    </div>

                    {/* Review & Submit Section */}
                    <div className="submit-section">
                        <button
                            className="btn-review"
                            onClick={() => setShowReview(true)}
                        >
                            Review Answers
                        </button>
                        <button
                            className="btn-submit"
                            onClick={handleSubmitTest}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Test'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Answer Review Modal */}
            {showReview && (
                <AnswerReview
                    questionsGrouped={testSession.questionsGrouped}
                    answers={testSession.answers}
                    onClose={() => setShowReview(false)}
                    onSubmit={handleSubmitTest}
                />
            )}
        </div>
    );
};

export default ToeicTest;