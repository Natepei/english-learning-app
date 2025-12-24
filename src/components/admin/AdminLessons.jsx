import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './AdminLessons.css';

const AdminLessonsPage = () => {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [newLesson, setNewLesson] = useState({ title: '', content: '' });
    const [editingLesson, setEditingLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            const response = await axios.get(`${getApiBaseUrl()}/lessons/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLessons(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching lessons: ' + error.message);
            setLoading(false);
        }
    };

    const handleAddLesson = async () => {
        try {
            const response = await axios.post(getApiBaseUrl() + '/lessons', {
                ...newLesson,
                courseId,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLessons([...lessons, response.data]);
            setNewLesson({ title: '', content: '' });
            alert('Lesson added successfully!');
        } catch (error) {
            alert('Error adding lesson: ' + error.message);
        }
    };

    const handleUpdateLesson = async (id) => {
        try {
            const response = await axios.put(`${getApiBaseUrl()}/lessons/${id}`, editingLesson, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLessons(lessons.map((lesson) => (lesson._id === id ? response.data : lesson)));
            setEditingLesson(null);
            alert('Lesson updated successfully!');
        } catch (error) {
            alert('Error updating lesson: ' + error.message);
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;

        try {
            await axios.delete(`${getApiBaseUrl()}/lessons/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLessons(lessons.filter((lesson) => lesson._id !== id));
            alert('Lesson deleted successfully!');
        } catch (error) {
            alert('Error deleting lesson: ' + error.message);
        }
    };

    if (loading) return <div className="loading">Loading lessons...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-lessons-container">
            <h1>Manage Lessons</h1>

            <div className="lesson-form">
                <h2>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
                <input
                    type="text"
                    placeholder="Lesson Title"
                    value={editingLesson ? editingLesson.title : newLesson.title}
                    onChange={(e) =>
                        editingLesson
                            ? setEditingLesson({ ...editingLesson, title: e.target.value })
                            : setNewLesson({ ...newLesson, title: e.target.value })
                    }
                />
                <textarea
                    placeholder="Lesson Content"
                    value={editingLesson ? editingLesson.content : newLesson.content}
                    onChange={(e) =>
                        editingLesson
                            ? setEditingLesson({ ...editingLesson, content: e.target.value })
                            : setNewLesson({ ...newLesson, content: e.target.value })
                    }
                />
                {editingLesson ? (
                    <div className="button-group">
                        <button onClick={() => handleUpdateLesson(editingLesson._id)}>Update</button>
                        <button onClick={() => setEditingLesson(null)}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={handleAddLesson}>Add Lesson</button>
                )}
            </div>

            <div className="lesson-list">
                <h2>Lesson List</h2>
                <ul>
                    {lessons.map((lesson) => (
                        <li key={lesson._id}>
                            <h3>{lesson.title}</h3>
                            <p>{lesson.content}</p>
                            <button className='btn-primary' onClick={() => setEditingLesson(lesson)}>sửa</button>
                            <button className='btn-danger' onClick={() => handleDeleteLesson(lesson._id)}>Xóa</button>
                            <button className='adminexercises' onClick={() => window.location.href = `/dashboard/exercises-management/${lesson._id}`}>
                                Chỉnh sửa bài tập
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminLessonsPage;
