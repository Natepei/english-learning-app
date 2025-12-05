import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import ytdl from 'youtube-dl-exec';
import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'ffmpeg-static';
import { execSync } from 'child_process';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/course.js';
import lessonRoutes from './routes/lesson.js';
import exerciseRoutes from './routes/exercise.js';
import progressRoutes from './routes/progress.js';
import favoriteRoutes from './routes/favorite.js';
import blogRoutes from './routes/blog.js';

// ✅ TOEIC Routes
import bookRoutes from './routes/books.js';
import examRoutes from './routes/exams.js';
import questionRoutes from './routes/questions.js';
import submissionRoutes from './routes/submissions.js';

import { errorHandler } from './middleware/error.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Kiểm tra và log đường dẫn ffmpeg
const ffmpegPath = ffmpeg.replace('app.asar', 'app.asar.unpacked');
console.log('FFmpeg path:', ffmpegPath);

try {
    execSync(`"${ffmpegPath}" -version`);
    console.log('FFmpeg is installed and working');
} catch (error) {
    console.error('FFmpeg error:', error);
}

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files (for uploaded images and audio)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/blogs', blogRoutes);

// ✅ TOEIC Routes
app.use('/api/books', bookRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);

// Route to transcribe video audio
const ytDlPath = "D:\\EnglishStudyWeb\\yt-dlp.exe";

app.post('/api/transcribe', async (req, res) => {
    const { videoId } = req.body;
    const audioFilePath = `./audio_${videoId}.mp3`;

    try {
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        console.log(`Downloading audio for video: ${videoId}...`);

        // Chạy yt-dlp
        await ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
            noCheckCertificates: true,
            preferFreeFormats: true,
            extractAudio: true,
            audioFormat: 'mp3',
            output: audioFilePath,
            ffmpegLocation: ffmpegPath
        });

        // Kiểm tra xem tệp đã được tạo chưa
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('Audio file not found after download');
        }

        console.log('Audio downloaded successfully:', audioFilePath);

        // Upload to AssemblyAI
        console.log('Uploading audio to AssemblyAI...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
            headers: {
                authorization: process.env.VITE_ASSEMBLYAI_API_KEY,
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        console.log('File uploaded to AssemblyAI:', uploadResponse.data);
        const { upload_url } = uploadResponse.data;

        // Request transcription
        console.log('Requesting transcription...');
        const transcriptResponse = await axios.post(
            'https://api.assemblyai.com/v2/transcript',
            { 
                audio_url: upload_url, 
                language_code: 'en'
            },
            { headers: { authorization: process.env.VITE_ASSEMBLYAI_API_KEY } }
        );

        const transcriptId = transcriptResponse.data.id;
        console.log('Transcript ID:', transcriptId);

        // Polling transcript
        let transcriptCompleted = false;
        let transcriptData = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (!transcriptCompleted && attempts < maxAttempts) {
            const pollResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: process.env.VITE_ASSEMBLYAI_API_KEY } }
            );

            const pollData = pollResponse.data;
            console.log('Transcript status:', pollData.status);

            if (pollData.status === 'completed') {
                transcriptData = pollData;
                transcriptCompleted = true;
            } else if (pollData.status === 'error') {
                throw new Error(`Transcription failed: ${pollData.error}`);
            }

            if (!transcriptCompleted) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                attempts++;
            }
        }

        // Cleanup
        try {
            fs.unlinkSync(audioFilePath);
            console.log('Audio file deleted successfully');
        } catch (err) {
            console.error('Error deleting audio file:', err);
        }

        res.json({ transcript: transcriptData });
    } catch (err) {
        console.error('Error in transcribe route:', err);

        // Cleanup in case of error
        try {
            if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
            }
        } catch (cleanupErr) {
            console.error('Error during cleanup:', cleanupErr);
        }

        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));