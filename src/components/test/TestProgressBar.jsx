import React, { useMemo } from 'react';
import './TestProgressBar.css';

const TestProgressBar = ({
    answeredCount = 0,
    totalQuestions = 200,
    byPart = {}
}) => {
    const percentage = useMemo(() => {
        return Math.round((answeredCount / totalQuestions) * 100);
    }, [answeredCount, totalQuestions]);

    const partTotals = {
        1: 6, 2: 25, 3: 39, 4: 30,
        5: 30, 6: 16, 7: 54
    };

    // Calculate listening progress (Parts 1-4: 100 total)
    const listeningAnswered = (byPart[1] || 0) + (byPart[2] || 0) + 
                              (byPart[3] || 0) + (byPart[4] || 0);
    const listeningPercentage = Math.round((listeningAnswered / 100) * 100);

    // Calculate reading progress (Parts 5-7: 100 total)
    const readingAnswered = (byPart[5] || 0) + (byPart[6] || 0) + (byPart[7] || 0);
    const readingPercentage = Math.round((readingAnswered / 100) * 100);

    return (
        <div className="test-progress">
            {/* Overall Progress */}
            <div className="progress-section overall">
                <div className="progress-header">
                    <span className="label">Overall Progress</span>
                    <span className="count">{answeredCount}/{totalQuestions}</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="progress-percentage">{percentage}%</div>
                </div>
            </div>

            {/* Section Progress */}
            <div className="progress-sections">
                {/* Listening */}
                <div className="progress-section listening">
                    <div className="progress-header">
                        <span className="label">🎧 Listening</span>
                        <span className="count">{listeningAnswered}/100</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill listening"
                                style={{ width: `${listeningPercentage}%` }}
                            />
                        </div>
                        <div className="progress-percentage">{listeningPercentage}%</div>
                    </div>
                    
                    {/* Part breakdown */}
                    <div className="part-breakdown">
                        {[1, 2, 3, 4].map(part => (
                            <div key={part} className="part-mini" title={`Part ${part}: ${byPart[part] || 0}/${partTotals[part]}`}>
                                <span className="part-num">P{part}</span>
                                <div className="mini-bar">
                                    <div
                                        className="mini-fill"
                                        style={{
                                            width: `${((byPart[part] || 0) / partTotals[part]) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reading */}
                <div className="progress-section reading">
                    <div className="progress-header">
                        <span className="label">📖 Reading</span>
                        <span className="count">{readingAnswered}/100</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill reading"
                                style={{ width: `${readingPercentage}%` }}
                            />
                        </div>
                        <div className="progress-percentage">{readingPercentage}%</div>
                    </div>

                    {/* Part breakdown */}
                    <div className="part-breakdown">
                        {[5, 6, 7].map(part => (
                            <div key={part} className="part-mini" title={`Part ${part}: ${byPart[part] || 0}/${partTotals[part]}`}>
                                <span className="part-num">P{part}</span>
                                <div className="mini-bar">
                                    <div
                                        className="mini-fill"
                                        style={{
                                            width: `${((byPart[part] || 0) / partTotals[part]) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestProgressBar;
