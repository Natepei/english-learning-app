import { Passage } from '../models/Passage.js';
import { Question } from '../models/Question.js';

// @desc    Get all passages for an exam
// @access  Public
export const getPassagesByExam = async (req, res) => {
    try {
        const passages = await Passage.find({ examId: req.params.examId }).sort({ part: 1, passageNumber: 1 });
        res.json(passages);
    } catch (error) {
        console.error('Error fetching passages:', error);
        res.status(500).json({ message: 'Lỗi khi lấy passages' });
    }
};

// @desc    Get a single passage
// @access  Public
export const getPassageById = async (req, res) => {
    try {
        const passage = await Passage.findById(req.params.id);

        if (!passage) {
            return res.status(404).json({ message: 'Không tìm thấy passage' });
        }

        res.json(passage);
    } catch (error) {
        console.error('Error fetching passage:', error);
        res.status(500).json({ message: 'Lỗi khi lấy passage' });
    }
};

// @desc    Create a new passage
// @access  Private/Admin
export const createPassage = async (req, res) => {
    try {
        const { examId, part, passageNumber, passageType, passages, questionNumbers } = req.body;

        // Validate required fields
        if (!examId || !part || !passageNumber || !passages || !questionNumbers) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Validate part is 6 or 7
        if (![6, 7].includes(parseInt(part))) {
            return res.status(400).json({ message: 'Part phải là 6 hoặc 7' });
        }

        const passageData = {
            examId,
            part: parseInt(part),
            passageNumber: parseInt(passageNumber),
            passageType: passageType || 'single',
            passages,
            questionNumbers: questionNumbers.map(q => parseInt(q))
        };

        const passage = await Passage.create(passageData);

        res.status(201).json({
            message: 'Tạo passage thành công',
            passage
        });
    } catch (error) {
        console.error('Error creating passage:', error);
        res.status(500).json({ message: 'Lỗi khi tạo passage: ' + error.message });
    }
};

// @desc    Update a passage
// @access  Private/Admin
export const updatePassage = async (req, res) => {
    try {
        const { part, passageNumber, passageType, passages, questionNumbers } = req.body;

        let passage = await Passage.findById(req.params.id);

        if (!passage) {
            return res.status(404).json({ message: 'Không tìm thấy passage' });
        }

        // Update fields if provided
        if (part && [6, 7].includes(parseInt(part))) passage.part = parseInt(part);
        if (passageNumber) passage.passageNumber = parseInt(passageNumber);
        if (passageType) passage.passageType = passageType;
        if (passages) passage.passages = passages;
        if (questionNumbers) passage.questionNumbers = questionNumbers.map(q => parseInt(q));

        await passage.save();

        res.json({
            message: 'Cập nhật passage thành công',
            passage
        });
    } catch (error) {
        console.error('Error updating passage:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật passage: ' + error.message });
    }
};

// @desc    Delete a passage
// @access  Private/Admin
export const deletePassage = async (req, res) => {
    try {
        const passage = await Passage.findById(req.params.id);

        if (!passage) {
            return res.status(404).json({ message: 'Không tìm thấy passage' });
        }

        // Delete associated questions
        await Question.deleteMany({ 
            examId: passage.examId,
            questionNumber: { $in: passage.questionNumbers }
        });

        await Passage.findByIdAndDelete(req.params.id);

        res.json({ message: 'Xóa passage thành công' });
    } catch (error) {
        console.error('Error deleting passage:', error);
        res.status(500).json({ message: 'Lỗi khi xóa passage: ' + error.message });
    }
};
