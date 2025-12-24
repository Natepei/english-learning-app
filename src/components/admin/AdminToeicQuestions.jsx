import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminAddQuestion from './AdminAddQuestion';
import { downloadToeicTemplate, TEMPLATE_INSTRUCTIONS } from '../../utils/excelTemplateGenerator';
import './AdminToeicQuestions.css';

const AdminToeicQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [selectedPart, setSelectedPart] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [audioFiles, setAudioFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadResults, setUploadResults] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [approvingExam, setApprovingExam] = useState(false);

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

    const handleDelete = async (questionId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/questions/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Xóa câu hỏi thành công!');
            fetchQuestions();
            fetchExamData();
        } catch (error) {
            console.error('Error deleting question:', error);
            const errorMessage = error.response?.data?.message || 'Không thể xóa câu hỏi';
            alert(`❌ Lỗi: ${errorMessage}`);
        }
    };

    const handleApproveExam = async () => {
        if (!overview?.isComplete) {
            alert('❌ Đề thi chưa đủ 200 câu hỏi, không thể duyệt!');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn duyệt đề thi này?\n\nSau khi duyệt, người dùng sẽ có thể làm bài.')) {
            return;
        }

        try {
            setApprovingExam(true);
            const response = await axios.put(
                `http://localhost:5000/api/exams/${examId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('✅ Duyệt đề thi thành công!');
            fetchExamData();
        } catch (error) {
            console.error('Error approving exam:', error);
            alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể duyệt đề thi'));
        } finally {
            setApprovingExam(false);
        }
    };

    const handleOpenExcelModal = () => {
        setExcelFile(null);
        setAudioFiles([]);
        setImageFiles([]);
        setUploadProgress(0);
        setUploadStatus('');
        setUploadResults(null);
        setShowExcelModal(true);
    };
    
    const handleCloseExcelModal = () => {
        setShowExcelModal(false);
        setExcelFile(null);
        setAudioFiles([]);
        setImageFiles([]);
        setUploadProgress(0);
        setUploadStatus('');
        setUploadResults(null);
    };

    const handleExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
                setExcelFile(file);
            } else {
                alert('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)');
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
        setUploadStatus('uploading');
        setUploadProgress(0);
        setUploadResults(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('excel', excelFile);
            formDataToSend.append('examId', examId);

            audioFiles.forEach(file => {
                formDataToSend.append('audio', file);
            });

            imageFiles.forEach(file => {
                formDataToSend.append('image', file);
            });

            console.log('📤 Uploading:', {
                excel: excelFile.name,
                audioCount: audioFiles.length,
                imageCount: imageFiles.length
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
                        setUploadProgress(percentCompleted);
                        if (percentCompleted === 100) {
                            setUploadStatus('processing');
                        }
                    }
                }
            );

            setUploadStatus('complete');
            setUploadResults(response.data.results);

            const { success, failed } = response.data.results;
            alert(`✅ Upload thành công!\n\n📊 Kết quả:\n- Thành công: ${success} câu hỏi\n- Thất bại: ${failed} câu hỏi${failed > 0 ? '\n\n⚠️ Xem console để biết chi tiết lỗi' : ''}`);

            if (failed > 0) {
                console.group('❌ Upload Errors');
                response.data.results.errors.forEach(error => console.error(error));
                console.groupEnd();
            }

            if (success > 0) {
                console.group('✅ Upload Success');
                response.data.results.details?.forEach(detail => console.log(detail));
                console.groupEnd();

                setTimeout(() => {
                    handleCloseExcelModal();
                    fetchQuestions();
                    fetchExamData();
                }, 2000);
            }
        } catch (error) {
            setUploadStatus('error');
            console.error('❌ Error:', error);
            alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể upload'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        downloadToeicTemplate();
        alert('✅ Đã tải template thành công!\n\nVui lòng xem hướng dẫn sử dụng bằng cách nhấn nút "📖 Hướng dẫn"');
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
                        <button 
                            className="btn-primary" 
                            onClick={() => setShowAddModal(true)}
                            style={{ backgroundColor: '#3B82F6' }}
                        >
                            ➕ Add Question
                        </button>
                        <button 
                            className="btn-success" 
                            onClick={handleOpenExcelModal} 
                            style={{ backgroundColor: '#10B981' }}
                        >
                            📊 Upload Excel
                        </button>
                    </div>
                </div>

                <div className="questions-list">
                    {questions.length === 0 ? (
                        <div className="empty-state">
                            <p>Chưa có câu hỏi nào. Hãy upload file Excel!</p>
                            <button className="btn-primary" onClick={handleOpenExcelModal}>
                                📤 Upload Questions
                            </button>
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
                                        <td style={{ maxWidth: '500px', wordBreak: 'break-word' }}>
                                            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                {q.questionText && q.questionText.includes('<') ? (
                                                    <div dangerouslySetInnerHTML={{ __html: q.questionText }} />
                                                ) : (
                                                    <div>{q.questionText && q.questionText.substring(0, 150)}</div>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
                                                {q.audioUrl && <span className="badge-audio">🔊 Audio</span>}
                                                {q.imageUrl && <span className="badge-image">🖼️ Image</span>}
                                                {q.groupNumber && <span className="badge-multi">Group {q.groupNumber}</span>}
                                            </div>
                                        </td>
                                        <td><strong>{q.correctAnswer}</strong></td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn-edit-sm"
                                                onClick={() => navigate(`/dashboard/questions-management/${examId}/edit/${q._id}`)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button 
                                                className="btn-danger-sm" 
                                                onClick={() => handleDelete(q._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}
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

            {/* Excel Upload Modal */}
            {showExcelModal && (
                <div className="modal-overlay" onClick={handleCloseExcelModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2>📊 Upload Câu Hỏi Từ Excel</h2>
                        
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={handleDownloadTemplate}
                                style={{
                                    padding: '10px 20px',
                                    background: '#3B82F6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                📥 Download Template
                            </button>
                            <button 
                                onClick={() => setShowInstructions(!showInstructions)}
                                style={{
                                    padding: '10px 20px',
                                    background: '#8B5CF6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                📖 {showInstructions ? 'Ẩn' : 'Hiện'} Hướng dẫn
                            </button>
                        </div>

                        {showInstructions && (
                            <div style={{
                                background: '#F3F4F6',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                maxHeight: '300px',
                                overflow: 'auto'
                            }}>
                                {TEMPLATE_INSTRUCTIONS}
                            </div>
                        )}

                        <form onSubmit={handleExcelUpload}>
                            <div className="form-group">
                                <label>File Excel (.xlsx, .xls, .csv) *</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleExcelFileChange}
                                    required
                                />
                                {excelFile && (
                                    <p style={{ color: '#10B981', marginTop: '5px' }}>
                                        ✓ Đã chọn: {excelFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Audio Files (nhiều file)</label>
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
                            </div>

                            {uploadStatus === 'uploading' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ 
                                        width: '100%', 
                                        height: '30px', 
                                        background: '#E5E7EB', 
                                        borderRadius: '15px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${uploadProgress}%`,
                                            height: '100%',
                                            background: '#10B981',
                                            transition: 'width 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {uploadProgress}%
                                        </div>
                                    </div>
                                    <p style={{ textAlign: 'center', marginTop: '5px', color: '#6B7280' }}>
                                        Đang upload...
                                    </p>
                                </div>
                            )}

                            {uploadStatus === 'processing' && (
                                <p style={{ textAlign: 'center', color: '#F59E0B', marginBottom: '15px' }}>
                                    ⚙️ Đang xử lý dữ liệu...
                                </p>
                            )}

                            {uploadStatus === 'complete' && uploadResults && (
                                <div style={{ 
                                    background: '#D1FAE5', 
                                    padding: '15px', 
                                    borderRadius: '8px',
                                    marginBottom: '15px'
                                }}>
                                    <h4 style={{ color: '#065F46', marginTop: 0 }}>✅ Kết quả:</h4>
                                    <p>✓ Thành công: {uploadResults.success} câu hỏi</p>
                                    <p>✗ Thất bại: {uploadResults.failed} câu hỏi</p>
                                </div>
                            )}

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

            {/* Add Question Modal */}
            {showAddQuestionModal && (
                <AdminAddQuestion
                    examId={examId}
                    part={selectedPart}
                    onClose={() => setShowAddQuestionModal(false)}
                    onSuccess={() => {
                        fetchQuestions();
                        fetchExamData();
                    }}
                />
            )}
            {showAddModal && (
                <AdminAddQuestion
                    examId={examId}
                    part={selectedPart}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchQuestions();
                        fetchExamData();
                    }}
                />
            )}
        </div>
    );
};

export default AdminToeicQuestions;