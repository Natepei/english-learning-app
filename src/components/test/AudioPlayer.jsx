import React, { useRef, useState, useEffect } from 'react';
import { checkAudioPlayPermission } from '../../utils/testHelpers';
import './AudioPlayer.css';

const AudioPlayer = ({
    audioUrl,
    questionNumber,
    part,
    mode = 'practice', // 'practice' or 'real_exam'
    onPlay = null,
    className = ''
}) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioPlayed, setAudioPlayed] = useState(0);
    const [canPlay, setCanPlay] = useState(true);
    const [message, setMessage] = useState('');

    // Debug logging
    useEffect(() => {
        if (audioUrl) {
            console.log('🎵 AudioPlayer initialized:', {
                audioUrl,
                questionNumber,
                part,
                fullUrl: `http://localhost:5000${audioUrl}`
            });
        }
    }, [audioUrl]);

    if (!audioUrl) {
        return (
            <div className={`audio-player ${className}`}>
                <div className="audio-not-available">
                    🎵 Audio not available for this question
                </div>
            </div>
        );
    }

    // Update canPlay status based on mode
    useEffect(() => {
        const permission = checkAudioPlayPermission(mode, part, questionNumber, { 
            [`${part}-${questionNumber}`]: audioPlayed 
        });
        setCanPlay(permission.canPlay);
        setMessage(permission.message);
    }, [audioPlayed, mode, part, questionNumber]);

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handlePlay = () => {
        if (!canPlay) {
            alert('You can only play audio once in real exam mode');
            return;
        }

        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.play();
        }

        // Increment play count
        setAudioPlayed(prev => prev + 1);

        // Call onPlay callback
        if (onPlay) {
            onPlay(questionNumber, part);
        }
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleAudioError = (error) => {
        console.error('❌ Audio error:', error);
        console.error('Audio src:', audioRef.current?.src);
        alert('Error loading audio file');
    };

    const handleProgressChange = (e) => {
        if (audioRef.current) {
            audioRef.current.currentTime = parseFloat(e.target.value);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const playbackPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`audio-player-wrapper ${className}`}>
            <audio
                ref={audioRef}
                src={`http://localhost:5000${audioUrl}`}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                onError={handleAudioError}
            />

            <div className="audio-player">
                {/* Play Button */}
                <button
                    className={`play-button ${isPlaying ? 'playing' : ''} ${!canPlay ? 'disabled' : ''}`}
                    onClick={handlePlay}
                    disabled={!canPlay}
                    title={message}
                >
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21" />
                        </svg>
                    )}
                </button>

                {/* Time Display */}
                <div className="time-display">
                    <span className="current-time">{formatTime(currentTime)}</span>
                    <span className="duration">{formatTime(duration)}</span>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="progress-bar"
                    />
                    <div className="progress-fill" style={{ width: `${playbackPercentage}%` }} />
                </div>

                {/* Mode Indicator */}
                <div className={`mode-indicator ${mode}`}>
                    {mode === 'real_exam' ? (
                        <>
                            <span className="icon">🔒</span>
                            <span className="text">{audioPlayed}/{1}</span>
                        </>
                    ) : (
                        <>
                            <span className="icon">♾️</span>
                            <span className="text">Unlimited</span>
                        </>
                    )}
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`audio-message ${mode}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;
