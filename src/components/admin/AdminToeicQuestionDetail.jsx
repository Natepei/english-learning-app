import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import './AdminToeicQuestionDetail.css';

const AdminToeicQuestionDetail = () => {
    const { examId, questionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewAudio, setPreviewAudio] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchQuestion();
    }, [questionId]);

    const fetchQuestion = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${getApiBaseUrl()}/questions/${questionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuestion(response.data);
            initializeFormData(response.data);
        } catch (error) {
            console.error('Error fetching question:', error);
            alert('Lỗi khi tải câu hỏi');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const initializeFormData = (q) => {
        setFormData({
            questionNumber: q.questionNumber || '',
            questionContent: q.questionText || q.sentence || '',
            optionA: q.options?.A || '',
            optionB: q.options?.B || '',
            optionC: q.options?.C || '',
            optionD: q.options?.D || '',
            correctOption: q.correctAnswer || '',
            questionExplanation: q.explanation || '',
            orderNumber: q.orderNumber || q.questionNumber || '',
            questionPart: q.part || '',
            questionPassage: q.passage || '',
            groupNumber: q.groupNumber || '',
            questionScript: q.questionScript || q.transcript || ''
        });
        
        if (q.audioUrl) {
            setPreviewAudio(q.audioUrl);
        }
        if (q.imageUrl) {
            setPreviewImage(q.imageUrl);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTextAreaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewAudio(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataToSend = new FormData();
            
            // Add form fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add files if changed
            if (audioFile) {
                formDataToSend.append('audio', audioFile);
            }
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const response = await axios.put(
                `${getApiBaseUrl()}/questions/${questionId}`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            alert('✅ Cập nhật câu hỏi thành công!');
            navigate(-1);
        } catch (error) {
            console.error('Error saving question:', error);
            alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật câu hỏi'));
        } finally {
            setSaving(false);
        }
    };

    const getPartName = (part) => {
        const parts = {
            1: 'Part 1 - Photographs',
            2: 'Part 2 - Question-Response',
            3: 'Part 3 - Short Conversations',
            4: 'Part 4 - Short Talks',
            5: 'Part 5 - Incomplete Sentences',
            6: 'Part 6 - Text Completion',
            7: 'Part 7 - Reading Comprehension'
        };
        return parts[part] || `Part ${part}`;
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!question) return <div className="error">Không tìm thấy câu hỏi</div>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
                <h1>Chỉnh Sửa Câu Hỏi</h1>
                <p className="subtitle">{getPartName(formData.questionPart)}</p>
            </div>

            <form onSubmit={handleSubmit} className="detail-form">
                {/* Question Number & Order */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Số Câu Hỏi *</label>
                        <input
                            type="number"
                            name="questionNumber"
                            value={formData.questionNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Thứ Tự (Order) *</label>
                        <input
                            type="number"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Part</label>
                        <input
                            type="number"
                            name="questionPart"
                            value={formData.questionPart}
                            onChange={handleInputChange}
                            disabled
                        />
                    </div>
                </div>

                {/* Group Number - for Parts 3, 4, 7 */}
                {[3, 4, 7].includes(formData.questionPart) && (
                    <div className="form-group info-box">
                        <label>Nhóm Câu Hỏi (Group Number)</label>
                        <input
                            type="number"
                            name="groupNumber"
                            value={formData.groupNumber}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: 1, 2, 3..."
                        />
                        <p className="help-text">
                            ℹ️ Dùng để nhóm các câu hỏi cùng audio/passage. 
                            Ví dụ: Part 3 Q35-Q37 có group=2 (3 câu dùng chung 1 audio)
                        </p>
                    </div>
                )}

                {/* Question Content */}
                <div className="form-group">
                    <label>Nội Dung Câu Hỏi / Câu Văn *</label>
                    <textarea
                        name="questionContent"
                        value={formData.questionContent}
                        onChange={handleTextAreaChange}
                        rows="4"
                        placeholder="Nhập nội dung câu hỏi hoặc câu văn cần điền..."
                        required
                    />
                    {formData.questionContent && formData.questionContent.includes('<') && (
                        <div className="html-preview" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '14px' }}>
                            <strong>Preview:</strong>
                            <div style={{ marginTop: '5px' }} dangerouslySetInnerHTML={{ __html: formData.questionContent }} />
                        </div>
                    )}
                </div>

                {/* Options */}
                <div className="form-section">
                    <h3>📋 Đáp Án / Options</h3>
                    <div className="options-grid">
                        <div className="form-group">
                            <label>Lựa Chọn A *</label>
                            <textarea
                                name="optionA"
                                value={formData.optionA}
                                onChange={handleTextAreaChange}
                                rows="2"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Lựa Chọn B *</label>
                            <textarea
                                name="optionB"
                                value={formData.optionB}
                                onChange={handleTextAreaChange}
                                rows="2"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Lựa Chọn C *</label>
                            <textarea
                                name="optionC"
                                value={formData.optionC}
                                onChange={handleTextAreaChange}
                                rows="2"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Lựa Chọn D *</label>
                            <textarea
                                name="optionD"
                                value={formData.optionD}
                                onChange={handleTextAreaChange}
                                rows="2"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Đáp Án Đúng *</label>
                        <select
                            name="correctOption"
                            value={formData.correctOption}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn đáp án đúng --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>

                {/* Explanation */}
                <div className="form-group">
                    <label>Giải Thích / Explanation</label>
                    <textarea
                        name="questionExplanation"
                        value={formData.questionExplanation}
                        onChange={handleTextAreaChange}
                        rows="4"
                        placeholder="Giải thích chi tiết về đáp án..."
                    />
                </div>

                {/* Audio File */}
                {[1, 2, 3, 4].includes(formData.questionPart) && (
                    <div className="form-section">
                        <h3>🔊 File Audio</h3>
                        <div className="file-upload-group">
                            <div className="form-group">
                                <label>Tải Audio Lên</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                />
                                {previewAudio && (
                                    <div className="file-preview">
                                        <p>✓ Audio Preview:</p>
                                        <audio 
                                            controls 
                                            src={previewAudio.startsWith('data:') || previewAudio.startsWith('blob:') ? previewAudio : `http://localhost:5000${previewAudio}`} 
                                            style={{ maxWidth: '100%' }} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Image File */}
                {[1, 3, 4].includes(formData.questionPart) && (
                    <div className="form-section">
                        <h3>🖼️ Ảnh Câu Hỏi</h3>
                        <div className="file-upload-group">
                            <div className="form-group">
                                <label>Tải Ảnh Lên</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {previewImage && (
                                    <div className="file-preview">
                                        <p>✓ Image Preview:</p>
                                        <img 
                                            src={previewImage.startsWith('data:') || previewImage.startsWith('blob:') ? previewImage : `http://localhost:5000${previewImage}`} 
                                            alt="Question" 
                                            style={{ maxWidth: '100%', maxHeight: '300px' }} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate(-1)}
                        disabled={saving}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminToeicQuestionDetail;
