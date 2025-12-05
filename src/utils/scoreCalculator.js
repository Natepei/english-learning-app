/**
 * TOEIC Score Calculator
 * Converts raw scores to TOEIC scaled scores (5-495 per section, 10-990 total)
 */

/**
 * Calculate raw scores per part
 * @param {Array} answers - Array of answer objects with part and isCorrect properties
 * @returns {Object} Raw scores per part
 */
export const calculateRawScores = (answers) => {
    const partScores = {
        part1: 0,
        part2: 0,
        part3: 0,
        part4: 0,
        part5: 0,
        part6: 0,
        part7: 0
    };

    answers.forEach(answer => {
        if (answer.isCorrect) {
            const partKey = `part${answer.part}`;
            if (partKey in partScores) {
                partScores[partKey]++;
            }
        }
    });

    return partScores;
};

/**
 * Calculate listening and reading raw scores
 * Listening: Parts 1-4 (100 total questions: 6+25+39+30)
 * Reading: Parts 5-7 (100 total questions: 30+16+54)
 * @param {Object} partScores - Raw scores per part
 * @returns {Object} { listening: {raw}, reading: {raw} }
 */
export const calculateSectionRawScores = (partScores) => {
    const listeningRaw = (partScores.part1 || 0) + (partScores.part2 || 0) + 
                         (partScores.part3 || 0) + (partScores.part4 || 0);
    
    const readingRaw = (partScores.part5 || 0) + (partScores.part6 || 0) + 
                       (partScores.part7 || 0);

    return {
        listening: {
            raw: listeningRaw,
            max: 100
        },
        reading: {
            raw: readingRaw,
            max: 100
        }
    };
};

/**
 * Convert raw scores to TOEIC scaled scores
 * Uses simplified linear conversion formula
 * Actual TOEIC uses more complex conversion tables
 * 
 * Formula: (raw/100) * 490 + 5
 * Range: 5-495 per section
 * 
 * @param {number} rawScore - Raw score out of 100
 * @returns {number} Scaled score (5-495)
 */
export const convertToScaledScore = (rawScore) => {
    const scaled = Math.round((rawScore / 100) * 490 + 5);
    return Math.min(495, Math.max(5, scaled));
};

/**
 * Calculate all scores including total
 * @param {Array} answers - Array of answer objects
 * @returns {Object} Complete score breakdown
 */
export const calculateAllScores = (answers) => {
    const partScores = calculateRawScores(answers);
    const sectionRaw = calculateSectionRawScores(partScores);

    const listeningScaled = convertToScaledScore(sectionRaw.listening.raw);
    const readingScaled = convertToScaledScore(sectionRaw.reading.raw);

    return {
        parts: partScores,
        listening: {
            raw: sectionRaw.listening.raw,
            scaled: listeningScaled
        },
        reading: {
            raw: sectionRaw.reading.raw,
            scaled: readingScaled
        },
        total: listeningScaled + readingScaled
    };
};

/**
 * Get score level description in Vietnamese
 * @param {number} totalScore - Total TOEIC score (10-990)
 * @returns {Object} { level, description, color }
 */
export const getScoreLevel = (totalScore) => {
    if (totalScore >= 850) {
        return {
            level: 'Xuất sắc',
            description: 'Excellent - Advanced Professional',
            color: '#10B981',
            range: '850-990'
        };
    }
    if (totalScore >= 700) {
        return {
            level: 'Tốt',
            description: 'Good - Upper Intermediate',
            color: '#3B82F6',
            range: '700-849'
        };
    }
    if (totalScore >= 550) {
        return {
            level: 'Trung bình',
            description: 'Fair - Intermediate',
            color: '#F59E0B',
            range: '550-699'
        };
    }
    return {
        level: 'Cần cải thiện',
        description: 'Poor - Elementary to Lower Intermediate',
        color: '#EF4444',
        range: '10-549'
    };
};

/**
 * Calculate percentage of correct answers per part
 * @param {Object} partScores - Raw scores per part
 * @returns {Object} Percentage correct per part
 */
export const calculatePartPercentages = (partScores) => {
    const maxScores = {
        part1: 6,
        part2: 25,
        part3: 39,
        part4: 30,
        part5: 30,
        part6: 16,
        part7: 54
    };

    const percentages = {};
    Object.keys(partScores).forEach(part => {
        const max = maxScores[part];
        const raw = partScores[part];
        percentages[part] = Math.round((raw / max) * 100);
    });

    return percentages;
};

/**
 * Get weakest and strongest parts
 * @param {Object} partScores - Raw scores per part
 * @returns {Object} { weakest, strongest }
 */
export const getPartAnalysis = (partScores) => {
    const percentages = calculatePartPercentages(partScores);
    const parts = Object.entries(percentages);
    
    const strongest = parts.reduce((prev, current) => 
        current[1] > prev[1] ? current : prev
    );
    
    const weakest = parts.reduce((prev, current) => 
        current[1] < prev[1] ? current : prev
    );

    return {
        strongest: {
            part: strongest[0],
            percentage: strongest[1],
            score: partScores[strongest[0]]
        },
        weakest: {
            part: weakest[0],
            percentage: weakest[1],
            score: partScores[weakest[0]]
        }
    };
};

/**
 * Format score with comma separator
 * @param {number} score - Score to format
 * @returns {string} Formatted score
 */
export const formatScore = (score) => {
    return Math.round(score).toString();
};

/**
 * Get score color based on percentage
 * @param {number} percentage - Percentage correct (0-100)
 * @returns {string} Hex color code
 */
export const getPercentageColor = (percentage) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#3B82F6'; // Blue
    if (percentage >= 40) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
};

/**
 * Calculate improvement between two submissions
 * @param {Object} newScores - New submission scores
 * @param {Object} oldScores - Previous submission scores
 * @returns {Object} Improvement data
 */
export const calculateImprovement = (newScores, oldScores) => {
    const totalDiff = newScores.total - oldScores.total;
    const listeningDiff = newScores.listening.scaled - oldScores.listening.scaled;
    const readingDiff = newScores.reading.scaled - oldScores.reading.scaled;

    return {
        total: {
            difference: totalDiff,
            percentage: oldScores.total ? Math.round((totalDiff / oldScores.total) * 100) : 0,
            improved: totalDiff > 0
        },
        listening: {
            difference: listeningDiff,
            percentage: oldScores.listening.scaled ? 
                Math.round((listeningDiff / oldScores.listening.scaled) * 100) : 0,
            improved: listeningDiff > 0
        },
        reading: {
            difference: readingDiff,
            percentage: oldScores.reading.scaled ? 
                Math.round((readingDiff / oldScores.reading.scaled) * 100) : 0,
            improved: readingDiff > 0
        }
    };
};
