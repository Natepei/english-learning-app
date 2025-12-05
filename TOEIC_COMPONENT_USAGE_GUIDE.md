# TOEIC Test Component Usage Guide

## Quick Reference for Component Integration

### 1. Main Test Page Component

**File**: `src/pages/ToeicTest.jsx`

```jsx
// Already fully implemented - handles:
// - Loading submission and questions
// - Managing timer countdown
// - Orchestrating part-specific components
// - Answer selection and auto-save
// - Score calculation and submission
```

**Key Functions**:
- `fetchTestData()` - Load submission and questions
- `handleSelectAnswer(qNum, answer)` - Save answer with debounce
- `handleSubmitTest()` - Calculate scores and submit
- `renderPartComponent()` - Switch to correct part component

**State Management**:
```javascript
const testSession = useTestSession(questions, submission);
// Access: testSession.currentPart, testSession.answers, testSession.getProgress()
```

---

## 2. Using useTestSession Hook

**Import**:
```javascript
import useTestSession from '../../hooks/useTestSession';
```

**Initialization**:
```javascript
const testSession = useTestSession(questions, submission);
```

**Available Methods**:

| Method | Purpose | Returns |
|--------|---------|---------|
| `handleAnswer(qNum, ans, onSave)` | Record answer & auto-save | void |
| `goToPart(part)` | Jump to part 1-7 | void |
| `goToNext()` | Move to next question/group | void |
| `goToPrevious()` | Move to previous question/group | void |
| `getCurrentQuestion()` | Get current question/group | Object |
| `getAnswer(qNum)` | Get user's answer for question | String or null |
| `getProgress()` | Get progress metrics | Object |
| `getAnswersArray()` | Export all answers | Array |
| `getPartTotalQuestions()` | Get question count in current part | Number |
| `isAtStartOfPart()` | Check if at first item | Boolean |
| `isAtEndOfPart()` | Check if at last item | Boolean |
| `getPartItemCount()` | Get total items in part (groups for P3/4/6/7) | Number |

**Available Properties**:
```javascript
testSession.currentPart           // Current part (1-7)
testSession.currentPartIndex      // Index within part (0-based)
testSession.questionsGrouped      // Organized by part: { 1: [], 2: [], ... }
testSession.answers               // Map: { qNum: answer, ... }
testSession.answeredCount         // Count per part: { 1: 5, 2: 12, ... }
testSession.totalAnswered         // Total questions answered
```

---

## 3. Shared Components

### AudioPlayer
**File**: `src/components/test/AudioPlayer.jsx`

**Props**:
```javascript
{
  audioUrl: String,              // URL to audio file
  mode: 'real_exam' | 'practice', // Exam mode
  onPlay: (qNum) => void,        // Play event handler
  questionNumber: Number,        // Question identifier
  showFormat: 'button' | 'player' // Display style
}
```

**Usage**:
```jsx
<AudioPlayer 
  audioUrl="/uploads/audio/part1_q1.mp3"
  mode="real_exam"
  questionNumber={1}
  onPlay={handleAudioPlay}
/>
```

### TestTimer
**File**: `src/components/test/TestTimer.jsx`

**Props**:
```javascript
{
  timeRemaining: Number,  // Seconds
  onTimeUp: () => void,   // Auto-submit callback
  examTitle: String       // (Optional) Display in header
}
```

**Usage**:
```jsx
<TestTimer 
  timeRemaining={timeRemaining}
  onTimeUp={handleSubmitTest}
  examTitle="TOEIC Test"
/>
```

### TestNavigation
**File**: `src/components/test/TestNavigation.jsx`

**Props**:
```javascript
{
  currentPart: Number,                    // Current part (1-7)
  onPartSelect: (part: Number) => void,   // Part change handler
  questionsGrouped: Object,               // From testSession
  answers: Object                         // From testSession
}
```

**Usage**:
```jsx
<TestNavigation
  currentPart={testSession.currentPart}
  onPartSelect={testSession.goToPart}
  questionsGrouped={testSession.questionsGrouped}
  answers={testSession.answers}
/>
```

### TestProgressBar
**File**: `src/components/test/TestProgressBar.jsx`

**Props**:
```javascript
{
  currentProgress: Object,  // From testSession.getProgress()
  totalQuestions: Number    // 200 for TOEIC
}
```

**Usage**:
```jsx
const progress = testSession.getProgress();
<TestProgressBar 
  currentProgress={progress}
  totalQuestions={200}
/>
```

### AnswerReview
**File**: `src/components/test/AnswerReview.jsx`

**Props**:
```javascript
{
  questionsGrouped: Object,              // From testSession
  answers: Object,                       // From testSession
  onClose: () => void,                   // Close modal
  onSubmit: () => void,                  // Confirm submission
  isSubmitting: Boolean                  // (Optional) Disable on submit
}
```

**Usage**:
```jsx
<AnswerReview
  questionsGrouped={testSession.questionsGrouped}
  answers={testSession.answers}
  onClose={() => setShowReview(false)}
  onSubmit={handleSubmitTest}
  isSubmitting={isSubmitting}
/>
```

---

## 4. Part-Specific Components

### Part 1: Photo Description
**File**: `src/components/test/Part1Question.jsx`

**Props**:
```javascript
{
  question: Object,                       // { imageUrl, audioUrl, ... }
  currentIndex: Number,                   // Position in part (1-6)
  totalQuestions: Number,                 // 6
  selectedAnswer: String,                 // Current answer (A/B/C/D)
  onSelectAnswer: (qNum, ans) => void,   // Answer handler
  onNext: () => void,
  onPrevious: () => void,
  canGoNext: Boolean,
  canGoPrevious: Boolean,
  mode: 'real_exam' | 'practice'
}
```

### Part 2: Short Conversation Responses
**File**: `src/components/test/Part2Question.jsx`

**Props**: Same as Part 1
```javascript
{
  question: Object,                       // { audioUrl, ... }
  currentIndex: Number,                   // Position (1-25)
  totalQuestions: Number,                 // 25
  selectedAnswer: String,                 // A/B/C only
  onSelectAnswer: (qNum, ans) => void,
  // ... other props
}
```

### Part 3: Short Talks (Conversations)
**File**: `src/components/test/Part3Question.jsx`

**Props**:
```javascript
{
  conversation: Object,                   // { audioUrl, questionNumber, questions: [] }
  conversationIndex: Number,              // Position (1-13)
  totalConversations: Number,             // 13
  selectedAnswers: Object,                // All answers from testSession
  onSelectAnswer: (qNum, ans) => void,   // Answer handler
  onNext: () => void,
  onPrevious: () => void,
  canGoNext: Boolean,
  canGoPrevious: Boolean,
  mode: 'real_exam' | 'practice'
}
```

### Part 4: Short Talks (Talks)
**File**: `src/components/test/Part4Question.jsx`

**Props**: Same structure as Part 3
```javascript
{
  talk: Object,                           // { audioUrl, questionNumber, questions: [] }
  talkIndex: Number,                      // Position (1-10)
  totalTalks: Number,                     // 10
  selectedAnswers: Object,
  onSelectAnswer: (qNum, ans) => void,
  // ... other props
}
```

### Part 5: Incomplete Sentences
**File**: `src/components/test/Part5Question.jsx`

**Props**:
```javascript
{
  question: Object,                       // { sentence, options: {A, B, C, D} }
  currentIndex: Number,                   // Position (1-30)
  totalQuestions: Number,                 // 30
  selectedAnswer: String,                 // A/B/C/D
  onSelectAnswer: (qNum, ans) => void,
  onNext: () => void,
  onPrevious: () => void,
  canGoNext: Boolean,
  canGoPrevious: Boolean,
  mode: 'real_exam' | 'practice'
}
```

### Part 6: Text Completion
**File**: `src/components/test/Part6Question.jsx`

**Props**:
```javascript
{
  passage: Object,                        // { passageText, questions: [{qNum, text}] }
  passageIndex: Number,                   // Position (1-4)
  totalPassages: Number,                  // 4
  selectedAnswers: Object,                // All answers
  onSelectAnswer: (qNum, ans) => void,
  onNext: () => void,
  onPrevious: () => void,
  canGoNext: Boolean,
  canGoPrevious: Boolean,
  mode: 'real_exam' | 'practice'
}
```

### Part 7: Reading Comprehension
**File**: `src/components/test/Part7Question.jsx`

**Props**:
```javascript
{
  passageSet: Object,                     // { passages: [], questions: [] }
  passageIndex: Number,                   // Position (1-?)
  totalPassages: Number,                  // Total passage sets
  selectedAnswers: Object,                // All answers
  onSelectAnswer: (qNum, ans) => void,
  onNext: () => void,
  onPrevious: () => void,
  canGoNext: Boolean,
  canGoPrevious: Boolean,
  mode: 'real_exam' | 'practice'
}
```

---

## 5. Utility Functions

### scoreCalculator.js

```javascript
import { calculateAllScores, getScoreLevel } from '../../utils/scoreCalculator';

// Calculate TOEIC scores from answers
const scores = calculateAllScores(answerAnalysis);
// Returns: { listening: 380, reading: 275, total: 655, level: 'Tốt' }

// Get proficiency level
const level = getScoreLevel(655);
// Returns: 'Tốt' (Good)
```

### testHelpers.js

```javascript
import { 
  groupQuestionsByPart,
  groupPart3ByConversation,
  getTimeWarningStatus,
  validateAnswer 
} from '../../utils/testHelpers';

// Group questions by part
const grouped = groupQuestionsByPart(questions);
// Returns: { 1: [...], 2: [...], ..., 7: [...] }

// Group Part 3 by conversation
const convs = groupPart3ByConversation(part3Questions);
// Returns: [{ conversationNum, audioUrl, questions: [] }, ...]

// Check timer status
const status = getTimeWarningStatus(timeRemaining);
// Returns: { color: 'green|orange|red', pulse: true|false }

// Validate answer format
const isValid = validateAnswer('A', 1); // Part 1: A/B/C/D
const isValid = validateAnswer('B', 2); // Part 2: A/B/C
```

---

## 6. Integration Workflow

### Step 1: Load Test Page
```javascript
// In ToeicTest.jsx
useEffect(() => {
  fetchTestData(); // Loads submission and questions
}, [submissionId]);
```

### Step 2: Initialize Hook
```javascript
const testSession = useTestSession(questions, submission);
// Automatically groups questions and loads existing answers
```

### Step 3: Render Components
```jsx
<TestTimer timeRemaining={timeRemaining} onTimeUp={handleSubmitTest} />
<TestNavigation currentPart={testSession.currentPart} ... />
<TestProgressBar currentProgress={testSession.getProgress()} />
{renderPartComponent()}
<AnswerReview ... />
```

### Step 4: Handle Answers
```javascript
const handleSelectAnswer = (qNum, answer) => {
  testSession.handleAnswer(qNum, answer, async (qNum, ans) => {
    // Auto-save to server with debounce
    await axios.put(`/api/submissions/${id}/answer`, {
      questionNumber: qNum,
      userAnswer: ans
    });
  });
};
```

### Step 5: Submit Test
```javascript
const handleSubmitTest = async () => {
  const answers = testSession.getAnswersArray();
  const scores = calculateAllScores(analyzeAnswers(answers));
  await axios.post(`/api/submissions/${id}/submit`, { answers, scores });
  navigate(`/toeic-result/${id}`);
};
```

---

## 7. Common Patterns

### Accessing Current Question
```javascript
const current = testSession.getCurrentQuestion();
// For Parts 1, 2, 5: { questionNumber, part, ... }
// For Parts 3, 4, 6, 7: { conversationNumber/talkNumber/passageNumber, questions: [] }
```

### Checking Progress
```javascript
const progress = testSession.getProgress();
console.log(progress.totalAnswered);     // 85/200
console.log(progress.byPart);            // { 1: 6, 2: 12, 3: 9, ... }
console.log(progress.percentageComplete); // 42.5
```

### Navigation
```javascript
// Go to specific part
testSession.goToPart(3);

// Go to next question/group
testSession.goToNext();

// Check boundaries
if (testSession.isAtEndOfPart()) {
  testSession.goToNext(); // Goes to first question of next part
}
```

### Exporting Answers
```javascript
const allAnswers = testSession.getAnswersArray();
// Returns: [
//   { questionNumber: 1, userAnswer: 'A', part: 1 },
//   { questionNumber: 2, userAnswer: null, part: 1 },
//   ...
// ]
```

---

## 8. Styling Customization

### Color Scheme
```css
/* Primary Colors */
--color-primary: #4F46E5;  /* Indigo */
--color-success: #10B981;  /* Emerald */
--color-warning: #F59E0B; /* Amber */
--color-danger: #EF4444;   /* Red */
--color-gray: #6B7280;     /* Gray */
```

### Responsive Breakpoints
```css
/* Mobile First */
max-width: 375px;   /* Small phone */
max-width: 768px;   /* Tablet */
max-width: 1024px;  /* Small desktop */
max-width: 1280px;  /* Large desktop */
```

### Layout Adjustments
- Edit `ToeicTest.css` for main layout
- Edit component CSS files for individual styling
- Use CSS variables for consistent theming

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| Questions not loading | Check API endpoint, verify questions array populated |
| Answers not saving | Check auto-save timer, verify API route, check network tab |
| Audio not playing | Check audio URL format, verify file exists on server |
| Incorrect scores | Verify correctAnswer field matches submitted answers |
| Timer not updating | Check timeRemaining state update in useEffect |
| Part navigation stuck | Clear browser cache, check currentPartIndex state |

---

## 10. Performance Tips

1. **Auto-Save Debouncing**: Currently set to 2-3 seconds
   - Increase if server load is high
   - Decrease if data loss is concern

2. **Question Grouping**: Happens once on load
   - Not re-grouped on answer changes
   - Groups cached in state

3. **Component Re-renders**: Minimal due to hook structure
   - Part component only re-renders on currentPart change
   - Use React.memo for optimization if needed

4. **Bundle Size**: ~500KB for all test components + utilities
   - Consider code-splitting for lazy loading
   - Minify and compress assets

---

**Last Updated**: 2024
**Version**: 1.0.0 - Complete Implementation
