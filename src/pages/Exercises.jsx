import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import './Exercises.css';

const Exercises = () => {
    const { lessonId } = useParams();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});

    useEffect(() => {
        fetchExercises();
    }, [lessonId]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            // console.log('Fetching exercises for lessonId:', lessonId); // Debug log
            const response = await axios.get(getApiUrl(`exercises/${lessonId}`));
            // console.log('Received exercises data:', response.data); // Debug log

            // Verify data structure
            if (Array.isArray(response.data)) {
                setExercises(response.data);
                setError(null);
            } else {
                console.error('Unexpected data format:', response.data);
                setError('Data format error');
            }
        } catch (err) {
            console.error('Error fetching exercises:', err);
            setError('Không thể tải danh sách bài tập. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const submitProgress = async (results) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                getApiUrl('progress'),
                {
                    lessonId,
                    exerciseResults: results.map((result) => ({
                        exerciseId: result.exerciseId,
                        answer: result.userAnswer,
                        isCorrect: result.correct,
                        completedAt: new Date(),
                    })),
                    score: results.filter((r) => r.correct).length,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const correctCount = results.filter((r) => r.correct).length;
            const totalCount = results.length;
            const percentage = Math.round((correctCount / totalCount) * 100);

            alert(`Kết quả: ${correctCount}/${totalCount} (${percentage}%) câu đúng\nTiến độ của bạn đã được cập nhật!`);
        } catch (error) {
            console.error('Error saving progress:', error);
            alert('Lỗi khi lưu quá trình học. Vui lòng thử lại sau.');
        }
    };

    const handleSubmit = () => {
        const results = exercises.map((exercise) => ({
            exerciseId: exercise._id,
            question: exercise.question,
            correct: exercise.answer === userAnswers[exercise._id],
            userAnswer: userAnswers[exercise._id],
            correctAnswer: exercise.answer,
        }));

        console.log('Exercise results:', results);
        submitProgress(results);
    };


    const handleAnswerChange = (exerciseId, answer) => {
        console.log('Selected answer:', { exerciseId, answer }); // Debug log
        setUserAnswers({ ...userAnswers, [exerciseId]: answer });
    };

    if (loading) {
        return (
            <div className="exercises-container">
                <div className="loading-state">
                    <p>Đang tải bài tập...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exercises-container">
                <div className="error-state">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Debug log for render
    console.log('Rendering exercises:', exercises);

    return (
        <div className="exercises-container">
            <h1>Bài Tập</h1>
            {exercises.length === 0 ? (
                <p>Không có bài tập nào cho bài học này.</p>
            ) : (
                <div className="exercise-list">
                    {exercises.map((exercise) => (
                        <div key={exercise._id} className="exercise-card">
                            <h3>{exercise.question}</h3>
                            <div className="options">
                                {Array.isArray(exercise.options) && exercise.options.map((option, index) => (
                                    <div key={index}>
                                        <input
                                            type="radio"
                                            id={`exercise-${exercise._id}-option-${index}`}
                                            name={`exercise-${exercise._id}`}
                                            value={option}
                                            checked={userAnswers[exercise._id] === option}
                                            onChange={() => handleAnswerChange(exercise._id, option)}
                                        />
                                        <label htmlFor={`exercise-${exercise._id}-option-${index}`}>
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            )}
            {exercises.length > 0 && (
                <button className="submit-btn" onClick={handleSubmit}>
                    Nộp Bài
                </button>
            )}
        </div>
    );
};

export default Exercises;