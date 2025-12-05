import { useState, useCallback, useRef, useEffect } from 'react';
import {
    groupQuestionsByPart,
    groupPart3ByConversation,
    groupPart4ByTalk,
    groupPart6ByPassage,
    groupPart7ByPassage,
    countAnsweredPerPart
} from '../utils/testHelpers';

/**
 * Custom hook for managing TOEIC test session state
 * Handles:
 * - Question grouping and navigation
 * - Answer tracking and auto-save
 * - Progress tracking
 * - Time management
 */
export const useTestSession = (questions = [], submission = null) => {
    // State
    const [questionsGrouped, setQuestionsGrouped] = useState({});
    const [currentPart, setCurrentPart] = useState(1);
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [answeredCount, setAnsweredCount] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Ref for tracking changes
    const autoSaveRef = useRef(null);

    // Initialize questions on load
    useEffect(() => {
        if (questions.length > 0) {
            initializeQuestions();
        }
    }, [questions]);

    // Load existing answers from submission
    useEffect(() => {
        if (submission && submission.answers) {
            const existingAnswers = {};
            submission.answers.forEach(ans => {
                if (ans.userAnswer) {
                    existingAnswers[ans.questionNumber] = ans.userAnswer;
                }
            });
            setAnswers(existingAnswers);
            updateAnsweredCount(existingAnswers);
        }
        setIsLoading(false);
    }, [submission]);

    /**
     * Initialize and group all questions by part
     */
    const initializeQuestions = useCallback(() => {
        const grouped = groupQuestionsByPart(questions);

        // Further group grouped parts
        if (grouped[3].length > 0) {
            grouped[3] = groupPart3ByConversation(grouped[3]);
        }
        if (grouped[4].length > 0) {
            grouped[4] = groupPart4ByTalk(grouped[4]);
        }
        if (grouped[6].length > 0) {
            grouped[6] = groupPart6ByPassage(grouped[6]);
        }
        if (grouped[7].length > 0) {
            grouped[7] = groupPart7ByPassage(grouped[7]);
        }

        setQuestionsGrouped(grouped);
        updateAnsweredCount(answers);
    }, [questions, answers]);

    /**
     * Update answered count per part
     */
    const updateAnsweredCount = useCallback((currentAnswers) => {
        const counts = countAnsweredPerPart(currentAnswers, questionsGrouped);
        setAnsweredCount(counts);
    }, [questionsGrouped]);

    /**
     * Handle answer change
     * @param {number} questionNumber - Question number
     * @param {string} answer - Answer (A, B, C, or D)
     * @param {Function} onAutoSave - Callback for auto-save
     */
    const handleAnswer = useCallback((questionNumber, answer, onAutoSave = null) => {
        setAnswers(prev => {
            const updated = { ...prev, [questionNumber]: answer };
            updateAnsweredCount(updated);

            // Trigger auto-save
            if (onAutoSave && autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
            if (onAutoSave) {
                autoSaveRef.current = setTimeout(() => {
                    onAutoSave(questionNumber, answer);
                }, 500); // Debounce 500ms
            }

            return updated;
        });
    }, [updateAnsweredCount]);

    /**
     * Navigate to a specific part
     * @param {number} part - Part number (1-7)
     */
    const goToPart = useCallback((part) => {
        if (part >= 1 && part <= 7) {
            setCurrentPart(part);
            setCurrentPartIndex(0);
        }
    }, []);

    /**
     * Navigate to next part
     */
    const goToNextPart = useCallback(() => {
        if (currentPart < 7) {
            setCurrentPart(currentPart + 1);
            setCurrentPartIndex(0);
        }
    }, [currentPart]);

    /**
     * Navigate to previous part
     */
    const goToPreviousPart = useCallback(() => {
        if (currentPart > 1) {
            setCurrentPart(currentPart - 1);
            setCurrentPartIndex(0);
        }
    }, [currentPart]);

    /**
     * Navigate to next question/group in current part
     */
    const goToNext = useCallback(() => {
        const partQuestions = questionsGrouped[currentPart];
        if (partQuestions && currentPartIndex < partQuestions.length - 1) {
            setCurrentPartIndex(currentPartIndex + 1);
        }
    }, [currentPart, currentPartIndex, questionsGrouped]);

    /**
     * Navigate to previous question/group in current part
     */
    const goToPrevious = useCallback(() => {
        if (currentPartIndex > 0) {
            setCurrentPartIndex(currentPartIndex - 1);
        }
    }, [currentPartIndex]);

    /**
     * Get current question(s) to display
     */
    const getCurrentQuestion = useCallback(() => {
        const partQuestions = questionsGrouped[currentPart];
        if (!partQuestions || currentPartIndex >= partQuestions.length) {
            return null;
        }
        return partQuestions[currentPartIndex];
    }, [currentPart, currentPartIndex, questionsGrouped]);

    /**
     * Get total questions for current part
     */
    const getPartTotalQuestions = useCallback(() => {
        const partQuestions = questionsGrouped[currentPart];
        if (!partQuestions) return 0;

        // For grouped parts, count actual questions
        if ([3, 4, 6, 7].includes(currentPart)) {
            let total = 0;
            partQuestions.forEach(group => {
                total += group.questions.length;
            });
            return total;
        }

        return partQuestions.length;
    }, [currentPart, questionsGrouped]);

    /**
     * Get total items in current part (for navigation)
     */
    const getPartItemCount = useCallback(() => {
        const partQuestions = questionsGrouped[currentPart];
        return partQuestions ? partQuestions.length : 0;
    }, [currentPart, questionsGrouped]);

    /**
     * Check if at end of part
     */
    const isAtEndOfPart = useCallback(() => {
        const partQuestions = questionsGrouped[currentPart];
        return !partQuestions || currentPartIndex >= partQuestions.length - 1;
    }, [currentPart, currentPartIndex, questionsGrouped]);

    /**
     * Check if at start of part
     */
    const isAtStartOfPart = useCallback(() => {
        return currentPartIndex === 0;
    }, [currentPartIndex]);

    /**
     * Get all answers as array for submission
     */
    const getAnswersArray = useCallback(() => {
        const answerArray = [];

        for (let part = 1; part <= 7; part++) {
            const partQuestions = questionsGrouped[part];
            if (!partQuestions) continue;

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

            questionNumbers.forEach(qNum => {
                if (answers[qNum]) {
                    answerArray.push({
                        questionNumber: qNum,
                        part,
                        userAnswer: answers[qNum].toUpperCase()
                    });
                }
            });
        }

        return answerArray;
    }, [answers, questionsGrouped]);

    /**
     * Get progress data
     */
    const getProgress = useCallback(() => {
        let totalAnswered = 0;
        const partCounts = {
            1: 6, 2: 25, 3: 39, 4: 30,
            5: 30, 6: 16, 7: 54
        };

        Object.keys(answeredCount).forEach(part => {
            totalAnswered += answeredCount[part] || 0;
        });

        return {
            answeredQuestions: totalAnswered,
            totalQuestions: 200,
            completionPercentage: Math.round((totalAnswered / 200) * 100),
            byPart: answeredCount
        };
    }, [answeredCount]);

    /**
     * Check if all questions answered
     */
    const allAnswered = useCallback(() => {
        const progress = getProgress();
        return progress.answeredQuestions === progress.totalQuestions;
    }, [getProgress]);

    /**
     * Get answer for specific question
     */
    const getAnswer = useCallback((questionNumber) => {
        return answers[questionNumber] || null;
    }, [answers]);

    /**
     * Clear all answers (reset test)
     */
    const clearAnswers = useCallback(() => {
        setAnswers({});
        updateAnsweredCount({});
    }, [updateAnsweredCount]);

    return {
        // State
        questionsGrouped,
        currentPart,
        currentPartIndex,
        answers,
        answeredCount,
        isLoading,

        // Navigation
        goToPart,
        goToNextPart,
        goToPreviousPart,
        goToNext,
        goToPrevious,
        isAtEndOfPart,
        isAtStartOfPart,

        // Question access
        getCurrentQuestion,
        getPartTotalQuestions,
        getPartItemCount,
        getAnswer,

        // Answer handling
        handleAnswer,
        clearAnswers,
        getAnswersArray,

        // Progress
        getProgress,
        allAnswered
    };
};

export default useTestSession;
