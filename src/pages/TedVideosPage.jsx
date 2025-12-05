import React, { useEffect, useState } from 'react';
import './TedVideosPage.css';

const TedVideosPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [transcript, setTranscript] = useState(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [player, setPlayer] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [showTranscript, setShowTranscript] = useState(true);

    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=TED+Talks&type=video&key=${youtubeApiKey}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch videos');
                }
                const data = await response.json();
                setVideos(data.items);
                setSelectedVideoId(data.items[0]?.id.videoId);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const handleTranscribe = async () => {
        if (!selectedVideoId) return;

        setIsTranscribing(true);
        setTranscript(null);

        try {
            const response = await fetch('http://localhost:5000/api/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId: selectedVideoId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to transcribe audio');
            }

            const data = await response.json();
            setTranscript(data.transcript); // Now an object, not just text
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsTranscribing(false);
        }
    };    

    useEffect(() => {
        if (!selectedVideoId) return;

        // Load YouTube IFrame API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        }

        // This function will be called by the YouTube API
        window.onYouTubeIframeAPIReady = () => {
            if (player) player.destroy();
            const newPlayer = new window.YT.Player('ted-video-iframe', {
                events: {
                    onReady: () => {},
                }
            });
            setPlayer(newPlayer);
        };

        // If API is already loaded
        if (window.YT && window.YT.Player) {
            if (player) player.destroy();
            const newPlayer = new window.YT.Player('ted-video-iframe', {
                events: {
                    onReady: () => {},
                }
            });
            setPlayer(newPlayer);
        }
        // eslint-disable-next-line
    }, [selectedVideoId]);

    useEffect(() => {
        if (!player || !transcript || !transcript.words) return;

        let interval = setInterval(() => {
            const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
            const idx = transcript.words.findIndex(
                (word, i) =>
                    currentTime * 1000 >= word.start &&
                    (i === transcript.words.length - 1 || currentTime * 1000 < transcript.words[i + 1].start)
            );
            setCurrentWordIndex(idx);
        }, 200);

        return () => clearInterval(interval);
    }, [player, transcript]);

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
                                    <iframe
                                        id="ted-video-iframe"
                                        src={`https://www.youtube.com/embed/${selectedVideoId}?enablejsapi=1`}
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

                {/* Video list section */}
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