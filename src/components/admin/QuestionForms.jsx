import React from 'react';

// Part 1 Form - Photographs
export const Part1Form = ({ formData, setFormData }) => {
    return (
        <>
            <div className="form-group">
                <label>Số Câu *</label>
                <input
                    type="number"
                    value={formData.questionNumber || ''}
                    onChange={(e) => setFormData({...formData, questionNumber: e.target.value})}
                    placeholder="VD: 1"
                    required
                />
            </div>

            <div className="form-group">
                <label>Audio File (.mp3, .wav) *</label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFormData({...formData, audio: e.target.files[0]})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Image File (.jpg, .png) *</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Đáp Án Đúng *</label>
                <select
                    value={formData.correctAnswer || ''}
                    onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                    required
                >
                    <option value="">-- Chọn --</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>

            <div className="form-group">
                <label>Giải Thích (Optional)</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                    placeholder="Giải thích đáp án..."
                />
            </div>
        </>
    );
};

// Part 2 Form - Question-Response
export const Part2Form = ({ formData, setFormData }) => {
    return (
        <>
            <div className="form-group">
                <label>Số Câu *</label>
                <input
                    type="number"
                    value={formData.questionNumber || ''}
                    onChange={(e) => setFormData({...formData, questionNumber: e.target.value})}
                    placeholder="VD: 7"
                    required
                />
            </div>

            <div className="form-group">
                <label>Audio File (.mp3, .wav) *</label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFormData({...formData, audio: e.target.files[0]})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Đáp Án Đúng *</label>
                <select
                    value={formData.correctAnswer || ''}
                    onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                    required
                >
                    <option value="">-- Chọn --</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                </select>
            </div>

            <div className="form-group">
                <label>Giải Thích (Optional)</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                />
            </div>
        </>
    );
};

// Part 3 Form - Short Conversations
export const Part3Form = ({ formData, setFormData }) => {
    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        if (field === 'option') {
            newQuestions[index].options[value.option] = value.text;
        } else {
            newQuestions[index][field] = value;
        }
        setFormData({...formData, questions: newQuestions});
    };

    return (
        <>
            <div className="form-group">
                <label>Số Conversation *</label>
                <input
                    type="number"
                    value={formData.conversationNumber || ''}
                    onChange={(e) => setFormData({...formData, conversationNumber: e.target.value})}
                    placeholder="VD: 1"
                    required
                />
            </div>

            <div className="form-group">
                <label>Audio File *</label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFormData({...formData, audio: e.target.files[0]})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Image File (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                />
            </div>

            <hr style={{margin: '2rem 0'}} />
            <h3>3 Câu Hỏi:</h3>

            {formData.questions && formData.questions.map((q, index) => (
                <div key={index} style={{background: '#F9FAFB', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                    <h4>Câu {index + 1}</h4>
                    
                    <div className="form-group">
                        <label>Số Câu *</label>
                        <input
                            type="number"
                            value={q.questionNumber || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionNumber', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nội Dung *</label>
                        <textarea
                            value={q.questionText || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                            rows="2"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option A *</label>
                        <input
                            type="text"
                            value={q.options?.A || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'A', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option B *</label>
                        <input
                            type="text"
                            value={q.options?.B || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'B', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option C *</label>
                        <input
                            type="text"
                            value={q.options?.C || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'C', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option D *</label>
                        <input
                            type="text"
                            value={q.options?.D || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'D', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Đáp Án *</label>
                        <select
                            value={q.correctAnswer || ''}
                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                            required
                        >
                            <option value="">-- Chọn --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
            ))}

            <div className="form-group">
                <label>Giải Thích (Optional)</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                />
            </div>
        </>
    );
};

// Part 4 Form - Short Talks
export const Part4Form = ({ formData, setFormData }) => {
    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        if (field === 'option') {
            newQuestions[index].options[value.option] = value.text;
        } else {
            newQuestions[index][field] = value;
        }
        setFormData({...formData, questions: newQuestions});
    };

    return (
        <>
            <div className="form-group">
                <label>Số Talk *</label>
                <input
                    type="number"
                    value={formData.talkNumber || ''}
                    onChange={(e) => setFormData({...formData, talkNumber: e.target.value})}
                    placeholder="VD: 1"
                    required
                />
            </div>

            <div className="form-group">
                <label>Audio File *</label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFormData({...formData, audio: e.target.files[0]})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Image File (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                />
            </div>

            <hr style={{margin: '2rem 0'}} />
            <h3>3 Câu Hỏi:</h3>

            {formData.questions && formData.questions.map((q, index) => (
                <div key={index} style={{background: '#F9FAFB', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                    <h4>Câu {index + 1}</h4>
                    
                    <div className="form-group">
                        <label>Số Câu *</label>
                        <input
                            type="number"
                            value={q.questionNumber || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionNumber', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nội Dung *</label>
                        <textarea
                            value={q.questionText || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                            rows="2"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option A *</label>
                        <input
                            type="text"
                            value={q.options?.A || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'A', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option B *</label>
                        <input
                            type="text"
                            value={q.options?.B || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'B', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option C *</label>
                        <input
                            type="text"
                            value={q.options?.C || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'C', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option D *</label>
                        <input
                            type="text"
                            value={q.options?.D || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'D', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Đáp Án *</label>
                        <select
                            value={q.correctAnswer || ''}
                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                            required
                        >
                            <option value="">-- Chọn --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
            ))}

            <div className="form-group">
                <label>Giải Thích (Optional)</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                />
            </div>
        </>
    );
};

// Part 5 Form - Incomplete Sentences
export const Part5Form = ({ formData, setFormData }) => {
    const handleOptionChange = (option, value) => {
        setFormData({
            ...formData,
            options: { ...formData.options, [option]: value }
        });
    };

    return (
        <>
            <div className="form-group">
                <label>Số Câu *</label>
                <input
                    type="number"
                    value={formData.questionNumber || ''}
                    onChange={(e) => setFormData({...formData, questionNumber: e.target.value})}
                    placeholder="VD: 101"
                    required
                />
            </div>

            <div className="form-group">
                <label>Câu Văn *</label>
                <textarea
                    value={formData.sentence || ''}
                    onChange={(e) => setFormData({...formData, sentence: e.target.value})}
                    rows="3"
                    placeholder="VD: He _____ the report yesterday."
                    required
                />
            </div>

            <div className="form-group">
                <label>Option A *</label>
                <input
                    type="text"
                    value={formData.options?.A || ''}
                    onChange={(e) => handleOptionChange('A', e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Option B *</label>
                <input
                    type="text"
                    value={formData.options?.B || ''}
                    onChange={(e) => handleOptionChange('B', e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Option C *</label>
                <input
                    type="text"
                    value={formData.options?.C || ''}
                    onChange={(e) => handleOptionChange('C', e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Option D *</label>
                <input
                    type="text"
                    value={formData.options?.D || ''}
                    onChange={(e) => handleOptionChange('D', e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Đáp Án Đúng *</label>
                <select
                    value={formData.correctAnswer || ''}
                    onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                    required
                >
                    <option value="">-- Chọn --</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>

            <div className="form-group">
                <label>Điểm Ngữ Pháp</label>
                <input
                    type="text"
                    value={formData.grammarPoint || ''}
                    onChange={(e) => setFormData({...formData, grammarPoint: e.target.value})}
                    placeholder="VD: Verb tense"
                />
            </div>

            <div className="form-group">
                <label>Giải Thích</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                />
            </div>
        </>
    );
};

// Part 6 Form - Text Completion
export const Part6Form = ({ formData, setFormData }) => {
    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        if (field === 'option') {
            newQuestions[index].options[value.option] = value.text;
        } else {
            newQuestions[index][field] = value;
        }
        setFormData({...formData, questions: newQuestions});
    };

    return (
        <>
            <div className="form-group">
                <label>Số Passage *</label>
                <input
                    type="number"
                    value={formData.passageNumber || ''}
                    onChange={(e) => setFormData({...formData, passageNumber: e.target.value})}
                    placeholder="VD: 1"
                    required
                />
            </div>

            <div className="form-group">
                <label>Đoạn Văn *</label>
                <textarea
                    value={formData.passageText || ''}
                    onChange={(e) => setFormData({...formData, passageText: e.target.value})}
                    rows="8"
                    placeholder="Sử dụng ----(131)---- cho chỗ trống"
                    required
                />
            </div>

            <hr style={{margin: '2rem 0'}} />
            <h3>4 Câu Hỏi:</h3>

            {formData.questions && formData.questions.map((q, index) => (
                <div key={index} style={{background: '#F9FAFB', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                    <h4>Câu {index + 1}</h4>
                    
                    <div className="form-group">
                        <label>Số Câu *</label>
                        <input
                            type="number"
                            value={q.questionNumber || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionNumber', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option A *</label>
                        <input
                            type="text"
                            value={q.options?.A || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'A', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option B *</label>
                        <input
                            type="text"
                            value={q.options?.B || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'B', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option C *</label>
                        <input
                            type="text"
                            value={q.options?.C || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'C', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option D *</label>
                        <input
                            type="text"
                            value={q.options?.D || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'D', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Đáp Án *</label>
                        <select
                            value={q.correctAnswer || ''}
                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                            required
                        >
                            <option value="">-- Chọn --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
            ))}

            <div className="form-group">
                <label>Giải Thích (Optional)</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                />
            </div>
        </>
    );
};

// Part 7 Form - Reading Comprehension  
export const Part7Form = ({ formData, setFormData }) => {
    const handlePassageChange = (index, field, value) => {
        const newPassages = [...formData.passages];
        newPassages[index][field] = value;
        setFormData({...formData, passages: newPassages});
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        if (field === 'option') {
            newQuestions[index].options[value.option] = value.text;
        } else {
            newQuestions[index][field] = value;
        }
        setFormData({...formData, questions: newQuestions});
    };

    const addPassage = () => {
        if (formData.passages.length < 3) {
            setFormData({
                ...formData,
                passages: [...formData.passages, { title: '', content: '', type: '' }]
            });
        }
    };

    const removePassage = (index) => {
        if (formData.passages.length > 1) {
            const newPassages = formData.passages.filter((_, i) => i !== index);
            setFormData({...formData, passages: newPassages});
        }
    };

    const addQuestion = () => {
        if (formData.questions.length < 5) {
            setFormData({
                ...formData,
                questions: [...formData.questions, {
                    questionNumber: '',
                    questionText: '',
                    options: { A: '', B: '', C: '', D: '' },
                    correctAnswer: ''
                }]
            });
        }
    };

    const removeQuestion = (index) => {
        if (formData.questions.length > 2) {
            const newQuestions = formData.questions.filter((_, i) => i !== index);
            setFormData({...formData, questions: newQuestions});
        }
    };

    return (
        <>
            <div className="form-group">
                <label>Số Passage *</label>
                <input
                    type="number"
                    value={formData.passageNumber || ''}
                    onChange={(e) => setFormData({...formData, passageNumber: e.target.value})}
                    required
                />
            </div>

            <div className="form-group">
                <label>Loại *</label>
                <select
                    value={formData.passageType || 'single'}
                    onChange={(e) => setFormData({...formData, passageType: e.target.value})}
                    required
                >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                </select>
            </div>

            <hr style={{margin: '2rem 0'}} />
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>Passages:</h3>
                {formData.passages.length < 3 && (
                    <button type="button" onClick={addPassage} className="btn-secondary">
                        + Thêm
                    </button>
                )}
            </div>

            {formData.passages && formData.passages.map((passage, index) => (
                <div key={index} style={{background: '#FEF3C7', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem', marginTop: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h4>Passage {index + 1}</h4>
                        {formData.passages.length > 1 && (
                            <button type="button" onClick={() => removePassage(index)} className="btn-danger">
                                Xóa
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Tiêu Đề</label>
                        <input
                            type="text"
                            value={passage.title || ''}
                            onChange={(e) => handlePassageChange(index, 'title', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Loại</label>
                        <input
                            type="text"
                            value={passage.type || ''}
                            onChange={(e) => handlePassageChange(index, 'type', e.target.value)}
                            placeholder="Email, Article..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Nội Dung *</label>
                        <textarea
                            value={passage.content || ''}
                            onChange={(e) => handlePassageChange(index, 'content', e.target.value)}
                            rows="8"
                            required
                        />
                    </div>
                </div>
            ))}

            <hr style={{margin: '2rem 0'}} />
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>Câu Hỏi:</h3>
                {formData.questions.length < 5 && (
                    <button type="button" onClick={addQuestion} className="btn-secondary">
                        + Thêm
                    </button>
                )}
            </div>

            {formData.questions && formData.questions.map((q, index) => (
                <div key={index} style={{background: '#F9FAFB', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem', marginTop: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h4>Câu {index + 1}</h4>
                        {formData.questions.length > 2 && (
                            <button type="button" onClick={() => removeQuestion(index)} className="btn-danger">
                                Xóa
                            </button>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>Số Câu *</label>
                        <input
                            type="number"
                            value={q.questionNumber || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionNumber', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nội Dung *</label>
                        <textarea
                            value={q.questionText || ''}
                            onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                            rows="2"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option A *</label>
                        <input
                            type="text"
                            value={q.options?.A || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'A', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option B *</label>
                        <input
                            type="text"
                            value={q.options?.B || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'B', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option C *</label>
                        <input
                            type="text"
                            value={q.options?.C || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'C', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Option D *</label>
                        <input
                            type="text"
                            value={q.options?.D || ''}
                            onChange={(e) => handleQuestionChange(index, 'option', {option: 'D', text: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Đáp Án *</label>
                        <select
                            value={q.correctAnswer || ''}
                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                            required
                        >
                            <option value="">-- Chọn --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
            ))}

            <div className="form-group">
                <label>Giải Thích (Optional)</label>
                <textarea
                    value={formData.explanation || ''}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    rows="3"
                />
            </div>
        </>
    );
};

// Render question form based on part number
export const renderQuestionForm = (part, formData, setFormData) => {
    switch (part) {
        case 1:
            return <Part1Form formData={formData} setFormData={setFormData} />;
        case 2:
            return <Part2Form formData={formData} setFormData={setFormData} />;
        case 3:
            return <Part3Form formData={formData} setFormData={setFormData} />;
        case 4:
            return <Part4Form formData={formData} setFormData={setFormData} />;
        case 5:
            return <Part5Form formData={formData} setFormData={setFormData} />;
        case 6:
            return <Part6Form formData={formData} setFormData={setFormData} />;
        case 7:
            return <Part7Form formData={formData} setFormData={setFormData} />;
        default:
            return <Part1Form formData={formData} setFormData={setFormData} />;
    }
};
