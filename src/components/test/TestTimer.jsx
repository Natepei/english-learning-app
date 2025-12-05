import React, { useEffect, useState } from 'react';
import { getTimeWarningStatus, formatTime } from '../../utils/testHelpers';
import './TestTimer.css';

const TestTimer = ({
    initialSeconds,
    onTimeUp = null,
    isPaused = false
}) => {
    const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
    const [warningStatus, setWarningStatus] = useState({});

    useEffect(() => {
        if (timeRemaining <= 0) {
            if (onTimeUp) {
                onTimeUp();
            }
            return;
        }

        if (isPaused) {
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1;
                if (newTime <= 0 && onTimeUp) {
                    onTimeUp();
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, onTimeUp, isPaused]);

    useEffect(() => {
        const status = getTimeWarningStatus(timeRemaining);
        setWarningStatus(status);
    }, [timeRemaining]);

    const displayTime = formatTime(timeRemaining);
    const [hours, minutes, seconds] = displayTime.split(':');

    return (
        <div className={`test-timer ${warningStatus.status}`}>
            <div className="timer-container">
                {/* Timer Icon */}
                <div className="timer-icon">
                    {warningStatus.status === 'critical' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            <line x1="12" y1="6" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                            <line x1="12" y1="12" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    )}
                </div>

                {/* Time Display */}
                <div className="time-display">
                    {timeRemaining <= 0 ? (
                        <div className="time expired">00:00:00</div>
                    ) : (
                        <>
                            {parseInt(hours) > 0 && (
                                <>
                                    <span className="time-unit">{hours}</span>
                                    <span className="separator">:</span>
                                </>
                            )}
                            <span className="time-unit">{minutes}</span>
                            <span className="separator">:</span>
                            <span className="time-unit">{seconds}</span>
                        </>
                    )}
                </div>

                {/* Message */}
                {warningStatus.message && (
                    <div className="timer-message">
                        {warningStatus.message}
                    </div>
                )}
            </div>

            {/* Visual Bar */}
            <div className="timer-bar">
                <div
                    className="timer-progress"
                    style={{
                        width: `${Math.max(0, (timeRemaining / initialSeconds) * 100)}%`,
                        backgroundColor: warningStatus.color
                    }}
                />
            </div>
        </div>
    );
};

export default TestTimer;
