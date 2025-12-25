import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import ytdl from '@distube/ytdl-core';
import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'ffmpeg-static';
import { exec, execSync } from 'child_process';
import util from 'util';
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

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create a Promise-based exec function
const execPromise = util.promisify(exec);

// --- CONFIGURATION ---
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Check FFmpeg
const ffmpegPath = ffmpeg.replace('app.asar', 'app.asar.unpacked');
console.log('FFmpeg path:', ffmpegPath);

try {
    console.log('FFmpeg check skipped for now (assuming working based on logs)');
} catch (error) {
    console.error('FFmpeg error:', error);
}

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://english-learning-app-theta.vercel.app',
    'https://english-learning-app-w7lk.onrender.com',
    'https://english-learning-app-git-2412-natepeis-projects.vercel.app',
    'https://english-learning-l35z4t1ku-natepeis-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ✅ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
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

// ========== UPDATED TRANSCRIBE ROUTE ==========
app.post('/api/transcribe', async (req, res) => {
    const { videoId } = req.body;
    let audioFilePath = path.join(__dirname, `audio_${videoId}.mp3`);    
    try {
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        console.log(`\n🎬 Downloading audio for video: ${videoId}...`);

        // Delete existing file
        if (fs.existsSync(audioFilePath)) {
            try { fs.unlinkSync(audioFilePath); } catch (e) {}
        }

        let downloaded = false;

        // Skip ytdl-core, go straight to yt-dlp
        try {
            console.log('📥 Using yt-dlp...');
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const safeAudioPath = audioFilePath.replace(/\\/g, '/');

            // 🔥 STRATEGY: Try multiple formats with different methods
            const formats = [
                '140',              // YouTube format ID for m4a (BEST for this video)
                'bestaudio[ext=m4a]',
                'bestaudio',
                '251',              // webm audio
                'worstaudio'        // fallback
            ];

            const ffmpegDir = path.join(__dirname, 'bin');
            const safeFfmpegDir = ffmpegDir.replace(/\\/g, '/');

const methods = [
                {
                    name: 'No Cookies (Simple)',
                    // Thêm: --extract-audio --audio-format mp3 --ffmpeg-location ...
                    cmd: (fmt) => `python -m yt_dlp -f "${fmt}" --extract-audio --audio-format mp3 --audio-quality 192K --ffmpeg-location "${safeFfmpegDir}" --no-warnings --no-check-certificate -o "${safeAudioPath}" "${videoUrl}"`
                },
                {
                    name: 'Cookies.txt',
                    cmd: (fmt) => {
                        const cookiePath = path.join(__dirname, 'cookies.txt').replace(/\\/g, '/');
                        return `python -m yt_dlp -f "${fmt}" --extract-audio --audio-format mp3 --audio-quality 192K --ffmpeg-location "${safeFfmpegDir}" --cookies "${cookiePath}" --no-warnings --no-check-certificate -o "${safeAudioPath}" "${videoUrl}"`;
                    }
                },
                {
                    name: 'Chrome Cookies',
                    cmd: (fmt) => `python -m yt_dlp -f "${fmt}" --extract-audio --audio-format mp3 --audio-quality 192K --ffmpeg-location "${safeFfmpegDir}" --cookies-from-browser chrome --no-warnings --no-check-certificate -o "${safeAudioPath}" "${videoUrl}"`
                }
            ];

            // Try each method with each format
            for (const method of methods) {
                if (downloaded) break;
                
                for (const format of formats) {
                    try {
                        console.log(`🚀 Trying: ${method.name} with format ${format}`);
                        await execPromise(method.cmd(format), { timeout: 90000 });
                        downloaded = true;
                        console.log(`✅ Success: ${method.name} + format ${format}`);
                        break;
                    } catch (err) {
                        const errMsg = err.message.split('\n')[0];
                        console.warn(`⚠️ Failed: ${errMsg.substring(0, 80)}`);
                    }
                }
            }

            if (!downloaded) {
                throw new Error('All download methods failed. Video may be restricted or unavailable.');
            }

            // Verify file
            if (!fs.existsSync(audioFilePath)) {
                throw new Error('File not created after download');
            }

            const stats = fs.statSync(audioFilePath);
            const fileSizeInMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`📊 Downloaded: ${fileSizeInMB} MB`);
            
            if (stats.size < 10000) {
                throw new Error('File too small (likely error page)');
            }

        } catch (err) {
            console.error('❌ Download failed:', err.message);
            throw new Error(`Cannot download video: ${err.message}`);
        }

        // Upload to AssemblyAI
        console.log('📤 Uploading to AssemblyAI...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        const uploadResponse = await axios.post(
            'https://api.assemblyai.com/v2/upload', 
            formData, 
            {
                headers: {
                    authorization: process.env.ASSEMBLYAI_API_KEY,
                    ...formData.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        const { upload_url } = uploadResponse.data;
        console.log('✅ Uploaded to AssemblyAI');

        // Request transcription
        const transcriptResponse = await axios.post(
            'https://api.assemblyai.com/v2/transcript',
            { audio_url: upload_url, language_code: 'en' },
            { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
        );

        const transcriptId = transcriptResponse.data.id;
        console.log(`🆔 Transcript ID: ${transcriptId}`);

        // Poll for completion
        let transcriptData = null;
        let attempts = 0;

        while (attempts < 120) {
            const pollResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
            );

            if (pollResponse.data.status === 'completed') {
                transcriptData = pollResponse.data;
                console.log('✅ Transcription completed');
                break;
            } else if (pollResponse.data.status === 'error') {
                throw new Error(`Transcription error: ${pollResponse.data.error}`);
            }

            process.stdout.write('.');
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
        }

        if (!transcriptData) {
            throw new Error('Transcription timeout');
        }

        // Cleanup
        try {
            if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
                console.log('\n🗑️ Cleaned up audio file');
            }
        } catch (e) {}

        res.json({ transcript: transcriptData });

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        
        // Cleanup
        try {
            if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
        } catch (e) {}

        res.status(500).json({ 
            error: err.message,
            videoId,
            suggestions: [
                'Update yt-dlp: python -m pip install --upgrade yt-dlp',
                'Check video is public and available',
                'Try different video ID for testing'
            ]
        });
    }
});

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));