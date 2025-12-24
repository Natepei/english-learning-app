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
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://english-learning-app-theta.vercel.app',
    'https://english-learning-app-server.onrender.com'
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
    const audioFileName = `audio_${videoId}.mp3`;
    const audioFilePath = path.join(__dirname, audioFileName);

    try {
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        console.log(`\n🎬 Downloading audio for video: ${videoId}...`);

        // Delete existing file if present to prevent errors
        if (fs.existsSync(audioFilePath)) {
            try { fs.unlinkSync(audioFilePath); } catch (e) {}
        }

        // Download audio using @distube/ytdl-core
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const info = await ytdl.getInfo(videoUrl, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        });
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        
        console.log(`✅ Audio format selected: ${audioFormat.qualityLabel || 'audio only'}`);

        // Stream audio to file
        await new Promise((resolve, reject) => {
            const audioStream = ytdl.downloadFromInfo(info, { 
                format: audioFormat,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                }
            });
            const writeStream = fs.createWriteStream(audioFilePath);

            audioStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);

            audioStream.pipe(writeStream);
        });

        // Verify file exists
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('Audio file not found after download process finished.');
        }

        const fileSizeInMB = (fs.statSync(audioFilePath).size / (1024 * 1024)).toFixed(2);
        console.log(`✅ Audio downloaded successfully: ${audioFilePath} (${fileSizeInMB} MB)`);

        // Upload to AssemblyAI
        console.log('📤 Uploading audio to AssemblyAI...');
        console.log('🔑 API Key:', process.env.ASSEMBLYAI_API_KEY ? `✅ SET (${process.env.ASSEMBLYAI_API_KEY.substring(0, 10)}...)` : '❌ MISSING');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
            headers: {
                authorization: process.env.ASSEMBLYAI_API_KEY,
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        console.log('✅ File uploaded to AssemblyAI');
        const { upload_url } = uploadResponse.data;

        // Request transcription
        console.log('⏳ Requesting transcription...');
        const transcriptResponse = await axios.post(
            'https://api.assemblyai.com/v2/transcript',
            { 
                audio_url: upload_url, 
                language_code: 'en'
            },
            { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
        );

        const transcriptId = transcriptResponse.data.id;
        console.log(`🆔 Transcript ID: ${transcriptId}`);

        // Polling transcript
        let transcriptCompleted = false;
        let transcriptData = null;
        let attempts = 0;
        const maxAttempts = 120;

        while (!transcriptCompleted && attempts < maxAttempts) {
            const pollResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
            );

            const pollData = pollResponse.data;

            if (pollData.status === 'completed') {
                transcriptData = pollData;
                transcriptCompleted = true;
                console.log('✅ Transcription completed');
            } else if (pollData.status === 'error') {
                throw new Error(`Transcription failed: ${pollData.error}`);
            }

            if (!transcriptCompleted) {
                process.stdout.write('.');
                await new Promise((resolve) => setTimeout(resolve, 3000));
                attempts++;
            }
        }

        if (!transcriptCompleted) {
            throw new Error('Transcription timeout - exceeded maximum attempts');
        }

        // Cleanup
        try {
            if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
            console.log('\n🗑️ Audio file deleted successfully');
        } catch (err) {
            console.error('Error deleting audio file:', err);
        }

        res.json({ transcript: transcriptData });
    } catch (err) {
        console.error('\n❌ Error in transcribe route:', err.message);
        
        // Log full error details
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Status Text:', err.response.statusText);
            console.error('Response data:', JSON.stringify(err.response.data, null, 2));
            console.error('Response headers:', JSON.stringify(err.response.headers, null, 2));
        } else if (err.request) {
            console.error('No response from server:', err.request);
        } else {
            console.error('Error details:', err);
        }
        
        // Cleanup in case of error
        try {
            if (fs.existsSync(audioFilePath)) {
                fs.unlinkSync(audioFilePath);
            }
        } catch (cleanupErr) {}

        // Send detailed error to frontend
        res.status(500).json({ 
            error: err.message || 'Failed to transcribe audio',
            details: err.response?.data || null,
            status: err.response?.status || null
        });
    }
});

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));