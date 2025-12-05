import Progress from '../models/Progress.js';

export const saveProgress = async (req, res) => {
    try {
        const { exerciseResults, score, lessonId } = req.body;
        const userId = req.user.id;

        // Tìm progress hiện có cho lesson này
        const existingProgress = await Progress.findOne({
            userId,
            lessonId
        });

        if (existingProgress) {
            // Nếu đã có progress, cập nhật với kết quả mới
            existingProgress.exerciseResults = exerciseResults;
            existingProgress.score = score;
            await existingProgress.save();
            res.status(200).json(existingProgress);
        } else {
            // Nếu chưa có progress, tạo mới
            const progress = new Progress({
                userId,
                lessonId,
                exerciseResults,
                score,
            });
            await progress.save();
            res.status(201).json(progress);
        }
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ message: 'Lỗi khi lưu quá trình học', error: error.message });
    }
};

export const getProgressByUser = async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.params.userId })
            .populate('lessonId')
            .populate('exerciseResults.exerciseId')
            .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật mới nhất

        if (!progress || progress.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu tiến trình học.' });
        }
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Lỗi khi lấy tiến trình học', error: error.message });
    }
};