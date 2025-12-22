import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
// import ytdl from 'youtube-dl-exec'; // Removed: causing hanging issues
import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'ffmpeg-static';
import { exec } from 'child_process'; // Changed: Using native exec
import util from 'util'; // Added: To promisify exec
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
import passageRoutes from './routes/passages.js'
import submissionRoutes from './routes/submissions.js';

import { errorHandler } from './middleware/error.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Create a Promise-based exec function
const execPromise = util.promisify(exec);

// --- CONFIGURATION PATHS ---
// NOTE: We use double backslashes (\\) for Windows paths in JavaScript strings
const ytDlPath = "D:\\DACN_HuynhNhatHuy_1050080136_THMT2\\english-learning-app\\static\\yt-dlp.exe";
const cookiesPath = "D:\\DACN_HuynhNhatHuy_1050080136_THMT2\\english-learning-app\\static\\www.youtube.com_cookies.txt";

console.log('MongoDB URI:', process.env.MONGODB_URI);

// Check FFmpeg
const ffmpegPath = ffmpeg.replace('app.asar', 'app.asar.unpacked');
console.log('FFmpeg path:', ffmpegPath);

try {
    // We use quotes around path in case of spaces
    // execSync(`"${ffmpegPath}" -version`); 
    console.log('FFmpeg check skipped for now (assuming working based on logs)');
} catch (error) {
    console.error('FFmpeg error:', error);
}

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/passages', passageRoutes);
app.use('/api/submissions', submissionRoutes);

app.post('/api/transcribe', async (req, res) => {
    const { videoId } = req.body;
    // Use absolute path for safety
    const audioFileName = `audio_${videoId}.mp3`;
    const audioFilePath = path.join(__dirname, audioFileName);

    try {
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        console.log(`Downloading audio for video: ${videoId}...`);

        // Delete existing file if present to prevent errors
        if (fs.existsSync(audioFilePath)) {
            try { fs.unlinkSync(audioFilePath); } catch (e) {}
        }

        // --- NEW DOWNLOAD LOGIC USING COOKIES ---
        // 1. Construct the command string
        // 2. We use --cookies to authenticate as a real user
        // 3. We use --user-agent to look like a browser
        const command = `"${ytDlPath}" "https://www.youtube.com/watch?v=${videoId}" -x --audio-format mp3 -o "${audioFilePath}" --ffmpeg-location "${ffmpegPath}" --cookies "${cookiesPath}" --no-check-certificates --force-overwrites --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;

        console.log('Executing yt-dlp command...');
        
        // Execute the command
        await execPromise(command);

        // Check if file exists
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('Audio file not found after download process finished.');
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
        const maxAttempts = 120; // Increased timeout duration

        while (!transcriptCompleted && attempts < maxAttempts) {
            const pollResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: process.env.VITE_ASSEMBLYAI_API_KEY } }
            );

            const pollData = pollResponse.data;
            // console.log('Transcript status:', pollData.status); // Uncomment to see status updates

            if (pollData.status === 'completed') {
                transcriptData = pollData;
                transcriptCompleted = true;
            } else if (pollData.status === 'error') {
                throw new Error(`Transcription failed: ${pollData.error}`);
            }

            if (!transcriptCompleted) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                attempts++;
            }
        }

        // Cleanup
        try {
            if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
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
        } catch (cleanupErr) {}

        // Send detailed error to frontend
        res.status(500).json({ error: err.message || 'Failed to transcribe audio' });
    }
});

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));