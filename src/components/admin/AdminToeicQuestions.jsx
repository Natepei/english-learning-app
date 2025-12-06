import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminToeicQuestions.css';
import { renderQuestionForm } from './QuestionForms';

const AdminToeicQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [selectedPart, setSelectedPart] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [excelFile, setExcelFile] = useState(null);
    const [audioFiles, setAudioFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    const partInfo = {
        1: { name: 'Part 1 - Photographs', count: 6, hasAudio: true, hasImage: true },
        2: { name: 'Part 2 - Question-Response', count: 25, hasAudio: true, hasImage: false },
        3: { name: 'Part 3 - Short Conversations', count: 39, hasAudio: true, hasImage: true },
        4: { name: 'Part 4 - Short Talks', count: 30, hasAudio: true, hasImage: true },
        5: { name: 'Part 5 - Incomplete Sentences', count: 30, hasAudio: false, hasImage: false },
        6: { name: 'Part 6 - Text Completion', count: 16, hasAudio: false, hasImage: false },
        7: { name: 'Part 7 - Reading Comprehension', count: 54, hasAudio: false, hasImage: false }
    };

    useEffect(() => {
        fetchExamData();
    }, [examId]);

    useEffect(() => {
        if (selectedPart) {
            fetchQuestions();
        }
    }, [selectedPart]);

    const fetchExamData = async () => {
        try {
            setLoading(true);
            const [examRes, overviewRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/exams/${examId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/exams/${examId}/questions-overview`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setExam(examRes.data);
            setOverview(overviewRes.data);
        } catch (error) {
            console.error('Error fetching exam data:', error);
            alert('Lỗi khi tải dữ liệu đề thi');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/questions/exam/${examId}/part/${selectedPart}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const handleOpenModal = () => {
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        const baseForm = {
            examId,
            questionNumber: '',
            correctAnswer: '',
            explanation: ''
        };

        if (selectedPart === 1) {
            setFormData({ ...baseForm, audio: null, image: null });
        } else if (selectedPart === 2) {
            setFormData({ ...baseForm, audio: null });
        } else if ([3, 4].includes(selectedPart)) {
            setFormData({
                ...baseForm,
                audio: null,
                image: null,
                [selectedPart === 3 ? 'conversationNumber' : 'talkNumber']: '',
                questions: [
                    { questionNumber: '', questionText: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' },
                    { questionNumber: '', questionText: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' },
                    { questionNumber: '', questionText: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' }
                ]
            });
        } else if (selectedPart === 5) {
            setFormData({
                ...baseForm,
                sentence: '',
                options: { A: '', B: '', C: '', D: '' },
                grammarPoint: ''
            });
        } else if (selectedPart === 6) {
            setFormData({
                ...baseForm,
                passageNumber: '',
                passageText: '',
                questions: [
                    { questionNumber: '', blankPosition: 1, options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' },
                    { questionNumber: '', blankPosition: 2, options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' },
                    { questionNumber: '', blankPosition: 3, options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' },
                    { questionNumber: '', blankPosition: 4, options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' }
                ]
            });
        } else if (selectedPart === 7) {
            setFormData({
                ...baseForm,
                passageNumber: '',
                passageType: 'single',
                passages: [{ title: '', content: '', type: '' }],
                questions: [
                    { questionNumber: '', questionText: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' },
                    { questionNumber: '', questionText: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '' }
                ]
            });
        } else {
            setFormData(baseForm);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        
        // Common fields
        formDataToSend.append('examId', examId);
        if (formData.explanation) formDataToSend.append('explanation', formData.explanation);

        // Part-specific handling
        if (selectedPart === 1) {
            formDataToSend.append('questionNumber', formData.questionNumber);
            formDataToSend.append('correctAnswer', formData.correctAnswer);
            if (formData.audio) formDataToSend.append('audio', formData.audio);
            if (formData.image) formDataToSend.append('image', formData.image);
        } else if (selectedPart === 2) {
            formDataToSend.append('questionNumber', formData.questionNumber);
            formDataToSend.append('correctAnswer', formData.correctAnswer);
            if (formData.audio) formDataToSend.append('audio', formData.audio);
        } else if ([3, 4].includes(selectedPart)) {
            if (selectedPart === 3) {
                formDataToSend.append('conversationNumber', formData.conversationNumber);
            } else {
                formDataToSend.append('talkNumber', formData.talkNumber);
            }
            if (formData.audio) formDataToSend.append('audio', formData.audio);
            if (formData.image) formDataToSend.append('image', formData.image);
            formDataToSend.append('questions', JSON.stringify(formData.questions));
        } else if (selectedPart === 5) {
            formDataToSend.append('questionNumber', formData.questionNumber);
            formDataToSend.append('sentence', formData.sentence);
            formDataToSend.append('options', JSON.stringify(formData.options));
            formDataToSend.append('correctAnswer', formData.correctAnswer);
            if (formData.grammarPoint) formDataToSend.append('grammarPoint', formData.grammarPoint);
        } else if (selectedPart === 6) {
            formDataToSend.append('passageNumber', formData.passageNumber);
            formDataToSend.append('passageText', formData.passageText);
            formDataToSend.append('questions', JSON.stringify(formData.questions));
        } else if (selectedPart === 7) {
            formDataToSend.append('passageNumber', formData.passageNumber);
            formDataToSend.append('passageType', formData.passageType);
            formDataToSend.append('passages', JSON.stringify(formData.passages));
            formDataToSend.append('questions', JSON.stringify(formData.questions));
        }

        try {
            await axios.post(
                `http://localhost:5000/api/questions/part${selectedPart}`,
                formDataToSend,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );
            alert('Tạo câu hỏi thành công!');
            setShowModal(false);
            fetchQuestions();
            fetchExamData();
        } catch (error) {
            console.error('Error creating question:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể tạo câu hỏi'));
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/questions/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Xóa câu hỏi thành công!');
            fetchQuestions();
            fetchExamData();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể xóa câu hỏi'));
        }
    };

    const handleOpenExcelModal = () => {
        setExcelFile(null);
        setAudioFiles([]);
        setImageFiles([]);
        setShowExcelModal(true);
    };

    const handleCloseExcelModal = () => {
        setShowExcelModal(false);
        setExcelFile(null);
        setAudioFiles([]);
        setImageFiles([]);
    };

    const handleExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setExcelFile(file);
            } else {
                alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
            }
        }
    };

    const handleAudioFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setAudioFiles(files);
    };

    const handleImageFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const handleExcelUpload = async (e) => {
        e.preventDefault();

        if (!excelFile) {
            alert('Vui lòng chọn file Excel');
            return;
        }

        setUploading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('excel', excelFile);
            formDataToSend.append('examId', examId);
            formDataToSend.append('preserveFilename', 'true');

            // Add audio files
            audioFiles.forEach(file => {
                formDataToSend.append('audio', file);
            });

            // Add image files
            imageFiles.forEach(file => {
                formDataToSend.append('image', file);
            });

            const response = await axios.post(
                'http://localhost:5000/api/questions/bulk-upload',
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload progress: ${percentCompleted}%`);
                    }
                }
            );

            alert(response.data.message);
            if (response.data.results.errors.length > 0) {
                console.warn('Errors:', response.data.results.errors);
                alert('Một số câu hỏi có lỗi. Vui lòng kiểm tra console để xem chi tiết.');
            }

            handleCloseExcelModal();
            fetchQuestions();
            fetchExamData();
        } catch (error) {
            console.error('Error uploading Excel:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể upload Excel'));
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="admin-loading">Đang tải...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        ← Quay lại
                    </button>
                    <h1>Quản Lý Câu Hỏi</h1>
                    <p className="exam-subtitle">{exam?.title}</p>
                </div>
            </div>

            {/* Part Tabs */}
            <div className="parts-tabs">
                {[1, 2, 3, 4, 5, 6, 7].map(part => {
                    const current = overview?.currentQuestions[`part${part}`] || 0;
                    const expected = overview?.expectedQuestions[`part${part}`] || 0;
                    const isComplete = current === expected;

                    return (
                        <button
                            key={part}
                            className={`part-tab ${selectedPart === part ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                            onClick={() => setSelectedPart(part)}
                        >
                            <span className="part-number">Part {part}</span>
                            <span className="part-progress">{current}/{expected}</span>
                            {isComplete && <span className="check-icon">✓</span>}
                        </button>
                    );
                })}
            </div>

            {/* Questions List */}
            <div className="questions-section">
                <div className="section-header">
                    <h2>{partInfo[selectedPart].name}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" onClick={handleOpenModal}>
                            ➕ Thêm Câu Hỏi
                        </button>
                        <button className="btn-success" onClick={handleOpenExcelModal} style={{ backgroundColor: '#10B981' }}>
                            📊 Upload Excel
                        </button>
                    </div>
                </div>

                <div className="questions-list">
                    {questions.length === 0 ? (
                        <div className="empty-state">
                            <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Số Câu</th>
                                    <th>Nội Dung</th>
                                    <th>Đáp Án</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(q => (
                                    <tr key={q._id}>
                                        <td>Q{q.questionNumber}</td>
                                        <td>
                                            {q.sentence && q.sentence.substring(0, 50)}
                                            {q.audioUrl && <span className="badge-audio">🔊 Audio</span>}
                                            {q.imageUrl && <span className="badge-image">🖼️ Image</span>}
                                            {q.questions && <span className="badge-multi">× {q.questions.length}</span>}
                                        </td>
                                        <td><strong>{q.correctAnswer}</strong></td>
                                        <td>
                                            <button 
                                                className="btn-danger-sm" 
                                                onClick={() => handleDelete(q._id)}
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal with Dynamic Form */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2>Thêm Câu Hỏi {partInfo[selectedPart].name}</h2>
                        <form onSubmit={handleSubmit}>
                            {renderQuestionForm(selectedPart, formData, setFormData)}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary">
                                    Tạo Câu Hỏi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Excel Upload Modal */}
            {showExcelModal && (
                <div className="modal-overlay" onClick={handleCloseExcelModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2>📊 Upload Câu Hỏi Từ Excel</h2>
                        <form onSubmit={handleExcelUpload}>
                            <div className="form-group">
                                <label>File Excel (.xlsx, .xls) *</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleExcelFileChange}
                                    required
                                />
                                {excelFile && (
                                    <p style={{ color: '#10B981', marginTop: '5px' }}>
                                        ✓ Đã chọn: {excelFile.name}
                                    </p>
                                )}
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    File Excel phải có các cột: questionContent, optionA, optionB, optionC, optionD, 
                                    correctOption, questionImage, questionScript, questionAudio, questionExplanation, 
                                    orderNumber, questionPassage, questionPart
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Audio Files (nhiều file) *</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    multiple
                                    onChange={handleAudioFilesChange}
                                />
                                {audioFiles.length > 0 && (
                                    <p style={{ color: '#10B981', marginTop: '5px' }}>
                                        ✓ Đã chọn {audioFiles.length} file audio
                                    </p>
                                )}
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    Upload tất cả file audio được tham chiếu trong Excel. Tên file phải khớp chính xác với tên trong cột questionAudio.
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Image Files (nhiều file)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageFilesChange}
                                />
                                {imageFiles.length > 0 && (
                                    <p style={{ color: '#10B981', marginTop: '5px' }}>
                                        ✓ Đã chọn {imageFiles.length} file ảnh
                                    </p>
                                )}
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    Upload tất cả file ảnh được tham chiếu trong Excel. Tên file phải khớp chính xác với tên trong cột questionImage.
                                </small>
                            </div>

                            <div style={{ 
                                background: '#FEF3C7', 
                                padding: '15px', 
                                borderRadius: '8px', 
                                marginBottom: '20px',
                                border: '1px solid #FCD34D'
                            }}>
                                <h4 style={{ marginTop: 0 }}>⚠️ Lưu ý:</h4>
                                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                                    <li>Tên file audio/image phải khớp chính xác với tên trong Excel (bao gồm cả phần mở rộng)</li>
                                    <li>Part 3 và Part 4: Mỗi conversation/talk cần 3 câu hỏi liên tiếp</li>
                                    <li>Part 6: Mỗi passage cần 4 câu hỏi liên tiếp</li>
                                    <li>Part 7: Mỗi passage có 2-5 câu hỏi</li>
                                    <li>Hệ thống sẽ tự động nhóm câu hỏi dựa trên questionPassage hoặc orderNumber</li>
                                </ul>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={handleCloseExcelModal}
                                    disabled={uploading}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Đang upload...' : '📤 Upload Excel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminToeicQuestions;