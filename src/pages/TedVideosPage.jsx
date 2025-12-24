import React, { useEffect, useState, useRef } from 'react';
import { getApiUrl } from '../utils/api';
import './TedVideosPage.css';

const TedVideosPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [transcript, setTranscript] = useState(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [showTranscript, setShowTranscript] = useState(true);
    
    // Use a ref to keep track of the player instance preventing re-creation issues
    const playerRef = useRef(null);

    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                console.log('🎥 YouTube API Key:', youtubeApiKey ? `✅ SET (${youtubeApiKey.substring(0, 10)}...)` : '❌ MISSING');
                
                if (!youtubeApiKey) {
                    throw new Error('YouTube API key not configured. Using fallback videos.');
                }
                
                const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=TED+Talks&type=video&key=${youtubeApiKey}`;
                console.log('📡 Fetching from:', url.substring(0, 80) + '...');
                
                const response = await fetch(url);
                console.log('📊 Response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ YouTube API Error:', errorData);
                    throw new Error(`YouTube API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
                }
                
                const data = await response.json();
                console.log('✅ Fetched videos:', data.items?.length || 0);
                setVideos(data.items);
                setSelectedVideoId(data.items[0]?.id.videoId);
                setLoading(false);
            } catch (err) {
                console.warn('⚠️ YouTube API failed, using fallback videos:', err.message);
                
                // Fallback: Use hardcoded TED videos
                const fallbackVideos = [
                    {
                        id: { videoId: '5MuIMqhT8DM' },
                        snippet: {
                            title: 'The power of introverts',
                            thumbnails: { medium: { url: 'https://i.ytimg.com/vi/5MuIMqhT8DM/mqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: 'Z8ji9rUe_kM' },
                        snippet: {
                            title: 'Do schools kill creativity?',
                            thumbnails: { medium: { url: 'https://i.ytimg.com/vi/Z8ji9rUe_kM/mqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: 'JXeJANDKwDc' },
                        snippet: {
                            title: 'Why good leaders make you feel safe',
                            thumbnails: { medium: { url: 'https://i.ytimg.com/vi/JXeJANDKwDc/mqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: 'u--IuduAa-c' },
                        snippet: {
                            title: 'Your body language shapes who you are',
                            thumbnails: { medium: { url: 'https://i.ytimg.com/vi/u--IuduAa-c/mqdefault.jpg' } }
                        }
                    },
                    {
                        id: { videoId: 'x-HPyB4PMfQ' },
                        snippet: {
                            title: 'How to speak so that people want to listen',
                            thumbnails: { medium: { url: 'https://i.ytimg.com/vi/x-HPyB4PMfQ/mqdefault.jpg' } }
                        }
                    }
                ];
                
                setVideos(fallbackVideos);
                setSelectedVideoId(fallbackVideos[0]?.id.videoId);
                setError('Using cached TED videos (YouTube API quota exceeded). Quota will reset at midnight UTC.');
                setLoading(false);
            }
        };

        fetchVideos();
    }, [youtubeApiKey]);

    const handleTranscribe = async () => {
        if (!selectedVideoId) return;

        setIsTranscribing(true);
        setTranscript(null);

        try {
            console.log('🎬 Starting transcribe for video:', selectedVideoId);
            const url = getApiUrl('transcribe');
            console.log('📤 Calling endpoint:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId: selectedVideoId }),
            });

            console.log('📊 Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Transcribe error:', errorData);
                throw new Error(errorData.error || `Transcribe failed (${response.status})`);
            }

            const data = await response.json();
            console.log('✅ Transcription completed');
            setTranscript(data.transcript); 
        } catch (err) {
            console.error('❌ Transcribe error:', err);
            setError(`Error: ${err.message}`);
        } finally {
            setIsTranscribing(false);
        }
    };    

    // --- FIX: Improved Player Initialization ---
    useEffect(() => {
        if (!selectedVideoId) return;

        const loadVideo = () => {
            // If player exists, just load the new video
            if (playerRef.current && playerRef.current.loadVideoById) {
                playerRef.current.loadVideoById(selectedVideoId);
                return;
            }

            // Define the initialization function
            const initPlayer = () => {
                // Ensure the element exists before trying to attach
                if (!document.getElementById('ted-video-iframe')) return;

                playerRef.current = new window.YT.Player('ted-video-iframe', {
                    events: {
                        onReady: (event) => {
                            // Player is ready
                        },
                        onStateChange: (event) => {
                            // Handle state changes if needed
                        }
                    }
                });
            };

            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);
                
                // Allow global callback
                window.onYouTubeIframeAPIReady = initPlayer;
            } else {
                initPlayer();
            }
        };

        loadVideo();

        // Cleanup function
        return () => {
            // Optional: destroy player on component unmount
            // if (playerRef.current) {
            //     playerRef.current.destroy();
            //     playerRef.current = null;
            // }
        };
    }, [selectedVideoId]);

    // --- Sync Transcript with Player ---
    useEffect(() => {
        if (!transcript || !transcript.words) return;

        const interval = setInterval(() => {
            // Safely access playerRef
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                const idx = transcript.words.findIndex(
                    (word, i) =>
                        currentTime * 1000 >= word.start &&
                        (i === transcript.words.length - 1 || currentTime * 1000 < transcript.words[i + 1].start)
                );
                setCurrentWordIndex(idx);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [transcript]); // Removed 'player' from dependency, relying on ref

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="ted-videos-page-container">
            <div className="ted-videos-page">
                <h1 className="title">TED Talks Videos</h1>
                <div className="main-content-video">
                    <div className="video-transcript-container">
                        <div className={`video-player-section ${transcript && showTranscript ? 'with-transcript' : ''}`}>
                            <div className="video-player">
                                {selectedVideoId && (
                                    /* FIX: Added origin parameter to src */
                                    <iframe
                                        id="ted-video-iframe"
                                        src={`https://www.youtube.com/embed/${selectedVideoId}?enablejsapi=1&origin=${window.location.origin}`}
                                        title="TED Video Player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>
                            <div className="controls">
                                <button
                                    onClick={handleTranscribe}
                                    disabled={isTranscribing}
                                    className="transcribe-button"
                                >
                                    {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
                                </button>
                                {transcript && (
                                    <button
                                        onClick={() => setShowTranscript(!showTranscript)}
                                        className="transcribe-button"
                                    >
                                        {showTranscript ? 'Hide transcript' : 'Show transcript'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={`transcript-section ${transcript && showTranscript ? 'visible' : ''}`}>
                            <div className="transcript">
                                <div className="transcript-content">
                                    {transcript && transcript.words ? (
                                        transcript.words.map((word, idx) => (
                                            <span
                                                key={idx}
                                                className={idx === currentWordIndex ? 'transcript-line active' : 'transcript-line'}
                                            >
                                                {word.text + ' '}
                                            </span>
                                        ))
                                    ) : (
                                        transcript && transcript.text
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="video-list-section">
                    <h2 className="video-list-title">More TED Talks</h2>
                    <div className="video-list">
                        {videos.map((video) => (
                            <div
                                key={video.id.videoId}
                                className={`video-item ${video.id.videoId === selectedVideoId ? 'active' : ''}`}
                                onClick={() => setSelectedVideoId(video.id.videoId)}
                            >
                                <img
                                    src={video.snippet.thumbnails.medium.url}
                                    alt={video.snippet.title}
                                    className="video-thumbnail"
                                />
                                <h3 className="video-title">{video.snippet.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TedVideosPage;
