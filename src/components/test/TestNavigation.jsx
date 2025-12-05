import React, { useMemo } from 'react';
import { getPartInfo, getPartIcon } from '../../utils/testHelpers';
import './TestNavigation.css';

const TestNavigation = ({
    currentPart,
    onPartSelect,
    answeredCounts = {},
    allPartQuestions = {}
}) => {
    const partTotals = useMemo(() => {
        return {
            1: 6, 2: 25, 3: 39, 4: 30,
            5: 30, 6: 16, 7: 54
        };
    }, []);

    const handlePartClick = (part) => {
        if (onPartSelect) {
            onPartSelect(part);
        }
    };

    return (
        <div className="test-navigation">
            <div className="nav-header">
                <h3>📋 Test Navigation</h3>
            </div>

            <div className="parts-tabs">
                {[1, 2, 3, 4, 5, 6, 7].map(part => {
                    const info = getPartInfo(part);
                    const answered = answeredCounts[part] || 0;
                    const total = partTotals[part];
                    const isComplete = answered === total;
                    const isActive = currentPart === part;
                    const icon = getPartIcon(part);

                    return (
                        <button
                            key={part}
                            className={`part-tab ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                            onClick={() => handlePartClick(part)}
                            title={info.name}
                        >
                            {/* Icon */}
                            <span className="part-icon">{icon}</span>

                            {/* Part Number */}
                            <span className="part-number">Part {part}</span>

                            {/* Progress */}
                            <span className="part-progress">{answered}/{total}</span>

                            {/* Completion Checkmark */}
                            {isComplete && <span className="check-mark">✓</span>}
                        </button>
                    );
                })}
            </div>

            {/* Section Headers */}
            <div className="nav-sections">
                <div className="section-divider">
                    <span className="section-label">🎧 LISTENING (Parts 1-4)</span>
                </div>
                <div className="section-divider">
                    <span className="section-label">📖 READING (Parts 5-7)</span>
                </div>
            </div>

            {/* Stats */}
            <div className="nav-stats">
                <div className="stat">
                    <span className="label">Total Progress</span>
                    <span className="value">
                        {Object.values(answeredCounts).reduce((a, b) => a + b, 0)}/200
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TestNavigation;
