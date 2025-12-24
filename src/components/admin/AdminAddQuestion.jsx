import React, { useState } from 'react';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import './AdminAddQuestion.css';

const AdminAddQuestion = ({ examId, part, onClose, onSuccess }) => {
    const token = localStorage.getItem('token');
    const [saving, setSaving] = useState(false);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        questionNumber: '',
        questionContent: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: '',
        questionExplanation: '',
        groupNumber: '',
        questionScript: ''
    });
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const partInfo = {
        1: { name: 'Part 1 - Photographs', hasAudio: true, hasImage: true },
        2: { name: 'Part 2 - Question-Response', hasAudio: true, hasImage: false },
        3: { name: 'Part 3 - Short Conversations', hasAudio: true, hasImage: true },
        4: { name: 'Part 4 - Short Talks', hasAudio: true, hasImage: true },
        5: { name: 'Part 5 - Incomplete Sentences', hasAudio: false, hasImage: false },
        6: { name: 'Part 6 - Text Completion', hasAudio: false, hasImage: false },
        7: { name: 'Part 7 - Reading Comprehension', hasAudio: false, hasImage: false }
    };

    // Fetch exam overview to check question count
    React.useEffect(() => {
        const fetchExamOverview = async () => {
            try {
                const response = await axios.get(`${getApiBaseUrl()}/exams/${examId}/questions-overview`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTotalQuestions(response.data.totalQuestions || 0);
            } catch (error) {
                console.error('Error fetching exam overview:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamOverview();
    }, [examId, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAudioChange = (e) => {
        setAudioFile(e.target.files[0]);
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (partInfo[part].hasAudio && !audioFile) {
            alert(`❌ Part ${part} yêu cầu file audio!`);
            return;
        }
        if (partInfo[part].hasImage && !imageFile) {
            alert(`❌ Part ${part} yêu cầu file hình ảnh!`);
            return;
        }

        setSaving(true);

        try {
            const submitData = new FormData();
            
            // Add required fields
            submitData.append('examId', examId);
            submitData.append('part', part);
            submitData.append('questionNumber', parseInt(formData.questionNumber));
            submitData.append('questionText', formData.questionContent);
            submitData.append('optionA', formData.optionA);
            submitData.append('optionB', formData.optionB);
            submitData.append('optionC', formData.optionC);
            submitData.append('optionD', formData.optionD);
            submitData.append('correctAnswer', formData.correctOption.toUpperCase());
            submitData.append('explanation', formData.questionExplanation || '');
            
            // Add optional fields
            if (formData.groupNumber) {
                submitData.append('groupNumber', parseInt(formData.groupNumber));
            }
            if (formData.questionScript) {
                submitData.append('questionScript', formData.questionScript);
            }

            // Add files
            if (audioFile) {
                submitData.append('audio', audioFile);
            }
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            console.log('📤 Submitting question:', {
                examId,
                part,
                questionNumber: formData.questionNumber,
                hasAudio: !!audioFile,
                hasImage: !!imageFile
            });

            // Use universal create endpoint
            await axios.post(
                getApiBaseUrl() + '/questions/create',
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            alert('✅ Thêm câu hỏi thành công!');
            onSuccess(); // Refresh the questions list
            onClose();   // Close modal
        } catch (error) {
            console.error('❌ Error adding question:', error);
            console.error('Response:', error.response?.data);
            
            // Handle 400 error for exceeding limit
            if (error.response?.status === 400 && error.response?.data?.details?.max) {
                alert(`❌ ${error.response.data.message}`);
            } else {
                alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể thêm câu hỏi'));
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>➕ Thêm Câu Hỏi Mới</h2>
                    <p className="subtitle">{partInfo[part].name}</p>
                </div>

                {/* Question Count Warning - Disabled State */}
                {totalQuestions >= 200 && (
                    <div style={{
                        background: '#FEE2E2',
                        borderLeft: '4px solid #DC2626',
                        padding: '15px',
                        borderRadius: '6px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ 
                            margin: '0 0 8px 0',
                            fontWeight: '600',
                            color: '#DC2626'
                        }}>
                            ❌ Đã đạt giới hạn tối đa
                        </p>
                        <p style={{ 
                            margin: '0',
                            color: '#991B1B'
                        }}>
                            Đề thi này đã có <strong>{totalQuestions}/200</strong> câu hỏi. Không thể thêm câu hỏi mới. Vui lòng xóa một số câu hỏi cũ trước.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Question Number */}
                    <div className="form-group">
                        <label>Số Câu Hỏi *</label>
                        <input
                            type="number"
                            name="questionNumber"
                            value={formData.questionNumber}
                            onChange={handleInputChange}
                            placeholder="VD: 1, 2, 3..."
                            min="1"
                            max="200"
                            required
                        />
                    </div>

                    {/* Group Number for grouped parts */}
                    {[3, 4, 6, 7].includes(part) && (
                        <div className="form-group">
                            <label>Số Nhóm</label>
                            <input
                                type="number"
                                name="groupNumber"
                                value={formData.groupNumber}
                                onChange={handleInputChange}
                                placeholder="VD: 1, 2, 3... (dùng để nhóm câu hỏi)"
                            />
                            <small style={{ color: '#6B7280', fontSize: '12px' }}>
                                💡 Các câu hỏi cùng nhóm sẽ dùng chung audio/passage
                            </small>
                        </div>
                    )}

                    {/* Question Text */}
                    <div className="form-group">
                        <label>Nội Dung Câu Hỏi *</label>
                        <textarea
                            name="questionContent"
                            value={formData.questionContent}
                            onChange={handleInputChange}
                            placeholder="Nhập nội dung câu hỏi hoặc mô tả hình ảnh"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Script for listening parts */}
                    {[1, 2, 3, 4].includes(part) && (
                        <div className="form-group">
                            <label>Đoạn Văn Bản (Script)</label>
                            <textarea
                                name="questionScript"
                                value={formData.questionScript}
                                onChange={handleInputChange}
                                placeholder="Nhập đoạn văn bản ghi âm (transcript)"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Options */}
                    <div className="form-row">
                        {['A', 'B', 'C', 'D'].map(option => (
                            <div key={option} className="form-group">
                                <label>Tùy Chọn {option} *</label>
                                <input
                                    type="text"
                                    name={`option${option}`}
                                    value={formData[`option${option}`]}
                                    onChange={handleInputChange}
                                    placeholder={`Lựa chọn ${option}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    {/* Correct Answer */}
                    <div className="form-group">
                        <label>Đáp Án Đúng *</label>
                        <select
                            name="correctOption"
                            value={formData.correctOption}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn đáp án --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>

                    {/* Explanation */}
                    <div className="form-group">
                        <label>Giải Thích</label>
                        <textarea
                            name="questionExplanation"
                            value={formData.questionExplanation}
                            onChange={handleInputChange}
                            placeholder="Giải thích đáp án đúng"
                            rows={3}
                        />
                    </div>

                    {/* Audio File */}
                    {partInfo[part].hasAudio && (
                        <div className="form-group">
                            <label>File Âm Thanh {partInfo[part].hasAudio && '*'}</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioChange}
                                required={partInfo[part].hasAudio}
                            />
                            {audioFile && (
                                <p className="file-selected">✓ {audioFile.name}</p>
                            )}
                        </div>
                    )}

                    {/* Image File */}
                    {partInfo[part].hasImage && (
                        <div className="form-group">
                            <label>File Hình Ảnh {part === 1 && '*'}</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required={part === 1}
                            />
                            {imageFile && (
                                <p className="file-selected">✓ {imageFile.name}</p>
                            )}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={saving || totalQuestions >= 200}
                            title={totalQuestions >= 200 ? 'Đã đạt giới hạn 200 câu hỏi' : ''}
                        >
                            {saving ? '⏳ Đang lưu...' : '➕ Thêm Câu Hỏi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAddQuestion;