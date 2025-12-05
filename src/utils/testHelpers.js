/**
 * TOEIC Test Helper Functions
 * Utility functions for formatting, grouping, and validating questions
 */

/**
 * Group questions by part
 * @param {Array} questions - All questions from database
 * @returns {Object} Questions grouped by part number
 */
export const groupQuestionsByPart = (questions) => {
    const grouped = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: []
    };

    questions.forEach(question => {
        if (question.part >= 1 && question.part <= 7) {
            grouped[question.part].push(question);
        }
    });

    return grouped;
};

/**
 * Group Part 3 questions by conversation
 * @param {Array} part3Questions - Part 3 questions
 * @returns {Array} Conversations with their 3 questions
 */
export const groupPart3ByConversation = (part3Questions) => {
    const conversations = {};

    part3Questions.forEach(question => {
        const convNum = question.conversationNumber;
        if (!conversations[convNum]) {
            conversations[convNum] = {
                conversationNumber: convNum,
                audioUrl: question.audioUrl,
                imageUrl: question.imageUrl,
                questions: []
            };
        }
        conversations[convNum].questions.push(...question.questions);
    });

    return Object.values(conversations).sort((a, b) => 
        a.conversationNumber - b.conversationNumber
    );
};

/**
 * Group Part 4 questions by talk
 * @param {Array} part4Questions - Part 4 questions
 * @returns {Array} Talks with their 3 questions
 */
export const groupPart4ByTalk = (part4Questions) => {
    const talks = {};

    part4Questions.forEach(question => {
        const talkNum = question.talkNumber;
        if (!talks[talkNum]) {
            talks[talkNum] = {
                talkNumber: talkNum,
                audioUrl: question.audioUrl,
                imageUrl: question.imageUrl,
                questions: []
            };
        }
        talks[talkNum].questions.push(...question.questions);
    });

    return Object.values(talks).sort((a, b) => 
        a.talkNumber - b.talkNumber
    );
};

/**
 * Group Part 6 questions by passage
 * @param {Array} part6Questions - Part 6 questions
 * @returns {Array} Passages with their 4 questions
 */
export const groupPart6ByPassage = (part6Questions) => {
    const passages = {};

    part6Questions.forEach(question => {
        const passageNum = question.passageNumber;
        if (!passages[passageNum]) {
            passages[passageNum] = {
                passageNumber: passageNum,
                passageText: question.passageText,
                questions: []
            };
        }
        passages[passageNum].questions.push(...question.questions);
    });

    return Object.values(passages).sort((a, b) => 
        a.passageNumber - b.passageNumber
    );
};

/**
 * Group Part 7 questions by passage set
 * @param {Array} part7Questions - Part 7 questions
 * @returns {Array} Passage sets with their questions
 */
export const groupPart7ByPassage = (part7Questions) => {
    const passages = {};

    part7Questions.forEach(question => {
        const passageNum = question.passageNumber;
        if (!passages[passageNum]) {
            passages[passageNum] = {
                passageNumber: passageNum,
                passageType: question.passageType,
                passages: question.passages,
                questions: []
            };
        }
        passages[passageNum].questions.push(...question.questions);
    });

    return Object.values(passages).sort((a, b) => 
        a.passageNumber - b.passageNumber
    );
};

/**
 * Get current question based on part and index
 * @param {Array} allQuestions - All questions grouped by part
 * @param {number} part - Current part (1-7)
 * @param {number} index - Question index in part
 * @returns {Object} Current question(s) to display
 */
export const getCurrentQuestion = (allQuestions, part, index) => {
    const partQuestions = allQuestions[part];
    
    if (!partQuestions || index >= partQuestions.length) {
        return null;
    }

    // For Part 3, 4, 6, 7 - return grouped questions
    if ([3, 4, 6, 7].includes(part)) {
        return partQuestions[index];
    }

    // For Part 1, 2, 5 - return single question
    return partQuestions[index];
};

/**
 * Calculate total questions for a part
 * @param {number} part - Part number
 * @returns {number} Total questions in part
 */
export const getPartTotalQuestions = (part) => {
    const totals = {
        1: 6,
        2: 25,
        3: 39,
        4: 30,
        5: 30,
        6: 16,
        7: 54
    };
    return totals[part] || 0;
};

/**
 * Get part information
 * @param {number} part - Part number
 * @returns {Object} Part info
 */
export const getPartInfo = (part) => {
    const partInfo = {
        1: { name: 'Part 1 - Photographs', count: 6, hasAudio: true, hasImage: true, section: 'listening' },
        2: { name: 'Part 2 - Question-Response', count: 25, hasAudio: true, hasImage: false, section: 'listening' },
        3: { name: 'Part 3 - Short Conversations', count: 39, hasAudio: true, hasImage: true, section: 'listening', grouped: true },
        4: { name: 'Part 4 - Short Talks', count: 30, hasAudio: true, hasImage: true, section: 'listening', grouped: true },
        5: { name: 'Part 5 - Incomplete Sentences', count: 30, hasAudio: false, hasImage: false, section: 'reading' },
        6: { name: 'Part 6 - Text Completion', count: 16, hasAudio: false, hasImage: false, section: 'reading', grouped: true },
        7: { name: 'Part 7 - Reading Comprehension', count: 54, hasAudio: false, hasImage: false, section: 'reading', grouped: true }
    };
    return partInfo[part] || {};
};

/**
 * Check if audio can be played multiple times (practice mode vs real exam)
 * @param {string} mode - Test mode ('practice' or 'real_exam')
 * @param {number} part - Part number
 * @param {number} questionNumber - Question number
 * @param {Object} audioPlayed - Tracking object of played audios
 * @returns {Object} { canPlay: boolean, timesPlayed: number, message: string }
 */
export const checkAudioPlayPermission = (mode, part, questionNumber, audioPlayed = {}) => {
    const key = `${part}-${questionNumber}`;
    const timesPlayed = audioPlayed[key] || 0;

    if (mode === 'practice') {
        return {
            canPlay: true,
            timesPlayed,
            message: 'Unlimited plays'
        };
    }

    // Real exam mode
    if (timesPlayed >= 1) {
        return {
            canPlay: false,
            timesPlayed,
            message: 'Audio has been played once (real exam mode)'
        };
    }

    return {
        canPlay: true,
        timesPlayed,
        message: 'Play audio (real exam mode - 1 time only)'
    };
};

/**
 * Format time from seconds
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export const formatTime = (seconds) => {
    // Validate input and default to 0 if invalid
    const validSeconds = isNaN(seconds) || seconds < 0 ? 0 : Math.floor(seconds);
    
    const hours = Math.floor(validSeconds / 3600);
    const minutes = Math.floor((validSeconds % 3600) / 60);
    const secs = validSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Get time warning status
 * @param {number} secondsRemaining - Seconds remaining
 * @returns {Object} { status: 'normal'|'warning'|'critical', color: string, message: string }
 */
export const getTimeWarningStatus = (secondsRemaining) => {
    const minutesRemaining = Math.floor(secondsRemaining / 60);

    if (minutesRemaining <= 0) {
        return {
            status: 'critical',
            color: '#FF0000',
            message: 'Time is up!'
        };
    }

    if (minutesRemaining <= 5) {
        return {
            status: 'critical',
            color: '#EF4444',
            message: `${minutesRemaining}m remaining - HURRY!`
        };
    }

    if (minutesRemaining <= 10) {
        return {
            status: 'warning',
            color: '#F59E0B',
            message: `${minutesRemaining}m remaining`
        };
    }

    return {
        status: 'normal',
        color: '#6B7280',
        message: `${minutesRemaining}m remaining`
    };
};

/**
 * Validate answer format
 * @param {string} answer - Answer to validate
 * @returns {boolean} Is valid answer
 */
export const isValidAnswer = (answer) => {
    return /^[A-D]$/.test(answer);
};

/**
 * Get next question index
 * @param {number} currentIndex - Current question index
 * @param {number} totalQuestions - Total questions in part
 * @returns {number} Next index (or same if last question)
 */
export const getNextIndex = (currentIndex, totalQuestions) => {
    return Math.min(currentIndex + 1, totalQuestions - 1);
};

/**
 * Get previous question index
 * @param {number} currentIndex - Current question index
 * @returns {number} Previous index (or 0 if first question)
 */
export const getPreviousIndex = (currentIndex) => {
    return Math.max(currentIndex - 1, 0);
};

/**
 * Build answer summary for submission
 * @param {Object} answers - User answers object
 * @param {Array} allQuestions - All questions
 * @returns {Array} Array of answer objects
 */
export const buildAnswerArray = (answers, allQuestions) => {
    const answerArray = [];

    // For each part
    for (let part = 1; part <= 7; part++) {
        const partQuestions = allQuestions[part];
        if (!partQuestions) continue;

        // Get all question numbers in this part
        const questionNumbers = new Set();

        if ([3, 4, 6, 7].includes(part)) {
            // Grouped questions
            partQuestions.forEach(group => {
                group.questions.forEach(q => {
                    questionNumbers.add(q.questionNumber);
                });
            });
        } else {
            // Single questions
            partQuestions.forEach(q => {
                questionNumbers.add(q.questionNumber);
            });
        }

        // Build answer entries
        questionNumbers.forEach(qNum => {
            const userAnswer = answers[qNum];
            if (userAnswer) {
                answerArray.push({
                    questionNumber: qNum,
                    part,
                    userAnswer: userAnswer.toUpperCase()
                });
            }
        });
    }

    return answerArray;
};

/**
 * Count answered questions per part
 * @param {Object} answers - User answers object
 * @param {Array} allQuestions - All questions grouped by part
 * @returns {Object} Count of answered questions per part
 */
export const countAnsweredPerPart = (answers, allQuestions) => {
    const counts = {};

    for (let part = 1; part <= 7; part++) {
        counts[part] = 0;
        const partQuestions = allQuestions[part];
        
        if (!partQuestions) continue;

        // Get all question numbers
        const questionNumbers = new Set();

        if ([3, 4, 6, 7].includes(part)) {
            partQuestions.forEach(group => {
                group.questions.forEach(q => {
                    questionNumbers.add(q.questionNumber);
                });
            });
        } else {
            partQuestions.forEach(q => {
                questionNumbers.add(q.questionNumber);
            });
        }

        // Count answered
        questionNumbers.forEach(qNum => {
            if (answers[qNum]) {
                counts[part]++;
            }
        });
    }

    return counts;
};

/**
 * Get part icon/emoji
 * @param {number} part - Part number
 * @returns {string} Icon emoji
 */
export const getPartIcon = (part) => {
    const icons = {
        1: '📸',
        2: '🎤',
        3: '👥',
        4: '🎙️',
        5: '✏️',
        6: '📝',
        7: '📖'
    };
    return icons[part] || '❓';
};

/**
 * Check if part is listening or reading
 * @param {number} part - Part number
 * @returns {string} 'listening' or 'reading'
 */
export const getPartSection = (part) => {
    if (part >= 1 && part <= 4) return 'listening';
    if (part >= 5 && part <= 7) return 'reading';
    return null;
};
