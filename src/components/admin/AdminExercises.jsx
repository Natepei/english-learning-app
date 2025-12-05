import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './AdminExercises.css';

const AdminExercisesPage = () => {
    const { lessonId } = useParams();
    const [exercises, setExercises] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [newExercise, setNewExercise] = useState({
        question: '',
        options: [''], // Khởi tạo với một option rỗng
        answer: '',
        type: 'multiple-choice',
    });
    const [editingExercise, setEditingExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExercises();
    }, [lessonId]);

    const fetchExercises = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/exercises/${lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setExercises(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching exercises: ' + error.message);
            setLoading(false);
        }
    };

    // Thêm một option mới
    const addOption = () => {
        if (editingExercise) {
            setEditingExercise({
                ...editingExercise,
                options: [...editingExercise.options, '']
            });
        } else {
            setNewExercise({
                ...newExercise,
                options: [...newExercise.options, '']
            });
        }
    };

    // Xóa một option
    const removeOption = (index) => {
        if (editingExercise) {
            const newOptions = editingExercise.options.filter((_, i) => i !== index);
            setEditingExercise({
                ...editingExercise,
                options: newOptions
            });
        } else {
            const newOptions = newExercise.options.filter((_, i) => i !== index);
            setNewExercise({
                ...newExercise,
                options: newOptions
            });
        }
    };

    // Cập nhật giá trị của một option
    const updateOption = (index, value) => {
        if (editingExercise) {
            const newOptions = [...editingExercise.options];
            newOptions[index] = value;
            setEditingExercise({
                ...editingExercise,
                options: newOptions
            });
        } else {
            const newOptions = [...newExercise.options];
            newOptions[index] = value;
            setNewExercise({
                ...newExercise,
                options: newOptions
            });
        }
    };

    const handleAddExercise = async () => {
        // Lọc bỏ các options rỗng trước khi gửi
        const filteredOptions = newExercise.options.filter(opt => opt.trim() !== '');
        
        try {
            const response = await axios.post('http://localhost:5000/api/exercises', {
                ...newExercise,
                options: filteredOptions,
                lessonId: lessonId,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setExercises([...exercises, response.data]);
            setNewExercise({ 
                question: '', 
                options: [''], 
                answer: '', 
                type: 'multiple-choice' 
            });
            alert('Exercise added successfully!');
        } catch (error) {
            alert('Error adding exercise: ' + error.message);
        }
    };

    const handleUpdateExercise = async (id) => {
        // Lọc bỏ các options rỗng trước khi cập nhật
        const filteredOptions = editingExercise.options.filter(opt => opt.trim() !== '');
        
        try {
            const response = await axios.put(
                `http://localhost:5000/api/exercises/${id}`,
                {
                    ...editingExercise,
                    options: filteredOptions
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setExercises(exercises.map((exercise) => (exercise._id === id ? response.data : exercise)));
            setEditingExercise(null);
            alert('Exercise updated successfully!');
        } catch (error) {
            alert('Error updating exercise: ' + error.message);
        }
    };

    const handleDeleteExercise = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exercise?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/exercises/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setExercises(exercises.filter((exercise) => exercise._id !== id));
            alert('Exercise deleted successfully!');
        } catch (error) {
            alert('Error deleting exercise: ' + error.message);
        }
    };

    if (loading) return <div className="loading">Loading exercises...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-exercises-container">
            <h1>Manage Exercises</h1>

            <div className="exercise-form">
                <h2>{editingExercise ? 'Edit Exercise' : 'Add New Exercise'}</h2>
                
                <input
                    type="text"
                    placeholder="Exercise Question"
                    value={editingExercise ? editingExercise.question : newExercise.question}
                    onChange={(e) =>
                        editingExercise
                            ? setEditingExercise({ ...editingExercise, question: e.target.value })
                            : setNewExercise({ ...newExercise, question: e.target.value })
                    }
                />

                <div className="options-container">
                    <label>Options:</label>
                    {(editingExercise ? editingExercise.options : newExercise.options).map((option, index) => (
                        <div key={index} className="option-input-group">
                            <input
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                            />
                            {index > 0 && (
                                <button 
                                    type="button" 
                                    className="remove-option-btn"
                                    onClick={() => removeOption(index)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button 
                        type="button" 
                        className="add-option-btn"
                        onClick={addOption}
                    >
                        + Add Option
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Correct Answer"
                    value={editingExercise ? editingExercise.answer : newExercise.answer}
                    onChange={(e) =>
                        editingExercise
                            ? setEditingExercise({ ...editingExercise, answer: e.target.value })
                            : setNewExercise({ ...newExercise, answer: e.target.value })
                    }
                />

                {editingExercise ? (
                    <div className="button-group">
                        <button onClick={() => handleUpdateExercise(editingExercise._id)}>Update</button>
                        <button onClick={() => setEditingExercise(null)}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={handleAddExercise}>Add Exercise</button>
                )}
            </div>

            <div className="exercise-list">
                <h2>Exercise List</h2>
                <ul>
                    {exercises.map((exercise) => (
                        <li key={exercise._id}>
                            <h3>{exercise.question}</h3>
                            <ul>
                                {exercise.options.map((option, index) => (
                                    <li key={index}>{option}</li>
                                ))}
                            </ul>
                            <p>Correct Answer: {exercise.answer}</p>
                            <button className='btn-primary' onClick={() => setEditingExercise(exercise)}>Edit</button>
                            <button className='btn-danger' onClick={() => handleDeleteExercise(exercise._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminExercisesPage;