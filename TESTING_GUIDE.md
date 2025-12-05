# TOEIC Test Feature - Quick Start Testing Guide

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend server running on http://localhost:5000
- Frontend server running on http://localhost:5173 (Vite)

### Installation
```bash
# Navigate to project directory
cd english-learning-app

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

---

## 📋 Testing Workflow

### Phase 1: Load Test Data

#### Option A: Using Existing Exam
1. Log in to the application
2. Navigate to "Dashboard" or "Courses"
3. Find a TOEIC exam that has been created
4. Verify it has 200 questions (Parts 1-7)

#### Option B: Create Test Exam (Admin)
1. Go to Admin Panel → TOEIC Exams
2. Create new exam:
   - Title: "Sample TOEIC Test"
   - Duration: 120 minutes
   - Description: "Practice exam"
3. Go to Admin Panel → TOEIC Questions
4. Add questions for all 7 parts:
   - Part 1: 6 questions
   - Part 2: 25 questions
   - Part 3: 39 questions (13 conversations)
   - Part 4: 30 questions (10 talks)
   - Part 5: 30 questions
   - Part 6: 16 questions (4 passages)
   - Part 7: 54 questions (multiple passage sets)

---

### Phase 2: Start Test

1. Click on TOEIC exam → "Start Test"
   - ✅ Submission should be created
   - ✅ Timer should start (120 minutes)
   - ✅ Current Part 1 question should display

2. Verify page loads:
   - ✅ TestTimer appears in header
   - ✅ TestNavigation shows 7 parts
   - ✅ TestProgressBar shows 0/200
   - ✅ Current question displays
   - ✅ Submit button visible at bottom

---

### Phase 3: Test Question Types

#### Part 1: Photo Description
```
[ Test Image ] → Should display photo
[ Audio Button ] → Should play once in real exam
A | B | C | D → Should show 4 button options (no text)
```
- [ ] Image displays correctly
- [ ] Audio plays without text labels
- [ ] Selecting option saves answer
- [ ] Progress updates to 1/6 for Part 1

#### Part 2: Short Conversation Responses
```
[ Audio Button ] → Should play once in real exam
A | B | C → Should show 3 button options
```
- [ ] Audio plays without text
- [ ] Only 3 options available (not D)
- [ ] Answer selection works
- [ ] Can navigate to next question

#### Part 3: Conversations with Questions
```
[ Conversation Audio ]
Question 1 of 3:
[ Question text with 4 options ]
[ Previous/Next Conversation buttons ]
```
- [ ] Audio plays for conversation
- [ ] Shows 3 questions per conversation
- [ ] Can navigate through conversations
- [ ] Answers for all 3 questions saved together

#### Part 4: Short Talks with Questions
```
[ Talk Audio ]
Question 1 of 3:
[ Question text with 4 options ]
[ Previous/Next Talk buttons ]
```
- [ ] Similar to Part 3 but with talks
- [ ] 10 talks total
- [ ] All answers persist correctly

#### Part 5: Incomplete Sentences
```
[ Full sentence with one blank ]
A. option1 | B. option2 | C. option3 | D. option4
```
- [ ] Sentence displays with blank
- [ ] 4 word options available
- [ ] Selection saves immediately
- [ ] Can navigate to next sentence

#### Part 6: Text Completion
```
[ Full passage text with inline [131] [132] [133] [134] ]
Questions appear below for each blank
```
- [ ] Passage displays with inline number markers
- [ ] Questions show below passage
- [ ] Can answer all 4 blanks
- [ ] Answers save separately

#### Part 7: Reading Comprehension
```
[ 1-3 passages displayed side-by-side or stacked ]
[ Expandable questions ]
Quick-select buttons: A B C D
```
- [ ] Passages display correctly (single, double, or triple)
- [ ] Questions collapse/expand
- [ ] Can answer multiple questions
- [ ] Layout responsive on mobile

---

### Phase 4: Test Navigation

1. **Part Tabs (TestNavigation)**
   - [ ] Click Part 1 tab → Jumps to Part 1 Q1
   - [ ] Click Part 5 tab → Jumps to Part 5 Q1
   - [ ] Part tabs show progress: "5/6 answered"
   - [ ] ✓ Checkmark appears when part complete

2. **Previous/Next Buttons**
   - [ ] Click "Next" → Moves to next question
   - [ ] Click "Previous" → Moves to previous question
   - [ ] At start: "Previous" disabled
   - [ ] At end: "Next" disabled (or wraps to Part 2)

3. **Progress Indicators**
   - [ ] Listening: 87/100 (Parts 1-4)
   - [ ] Reading: 38/100 (Parts 5-7)
   - [ ] Overall: 125/200
   - [ ] Updates as you answer questions

---

### Phase 5: Test Audio (Real Exam vs Practice)

#### Real Exam Mode
```javascript
submission.mode === 'real_exam'
```
- [ ] Audio plays once only
- [ ] Display shows: 🔒 1/1
- [ ] Second play attempt blocked
- [ ] Visual warning: "Audio already played"
- [ ] No playback controls visible

#### Practice Mode
```javascript
submission.mode === 'practice'
```
- [ ] Audio plays unlimited times
- [ ] Display shows: ♾️ Unlimited
- [ ] Playback controls always available
- [ ] No restrictions on plays

**To Test Both Modes**:
1. Check `submission.mode` in API response
2. Change in database if needed: `mode: 'real_exam'` or `'practice'`

---

### Phase 6: Test Timer

1. **Timer Display**
   - [ ] Shows HH:MM:SS format
   - [ ] Counts down every second
   - [ ] Sticky at top of page

2. **Timer Colors**
   - [ ] Green: Normal (> 10 minutes)
   - [ ] Orange: Warning (10:00 - 5:00)
   - [ ] Red: Critical (< 5:00)
   - [ ] Pulse animation on red

3. **Auto-Submit**
   - [ ] Change submission time to near expiry
   - [ ] Wait for timer to reach 0:00
   - [ ] Test should auto-submit automatically
   - [ ] Should redirect to results page

---

### Phase 7: Test Auto-Save

1. **Answer Selection**
   - [ ] Select answer in Part 1
   - [ ] Check browser Network tab
   - [ ] Should see PUT request to `/api/submissions/:id/answer` after 2-3 seconds
   - [ ] Server returns 200 OK

2. **Rapid Clicks**
   - [ ] Click different answers quickly
   - [ ] Should only save the final answer
   - [ ] Only one API call (debounced)
   - [ ] Database reflects final answer

3. **Page Refresh**
   - [ ] Answer question, wait for auto-save
   - [ ] Refresh page (Ctrl+R)
   - [ ] Submission should still have the answer
   - [ ] Verify in MongoDB: `db.submissions.findOne({_id: ...}).answers`

---

### Phase 8: Test Answer Review

1. **Review Modal**
   - [ ] Click "Review Answers" button
   - [ ] Modal appears with all answers
   - [ ] Organized by parts (7 tabs)
   - [ ] Unanswered questions highlighted in red

2. **Review Content**
   - [ ] Shows all questions answered so far
   - [ ] Shows question number, part, user answer
   - [ ] Can scroll through review
   - [ ] Can see what questions are unanswered

3. **Close Review**
   - [ ] Click X or "Cancel" to close
   - [ ] Return to test page
   - [ ] Can continue answering
   - [ ] Can open review again

---

### Phase 9: Test Submission

1. **Click Submit Button**
   - [ ] Button should be enabled
   - [ ] Click "Submit Test"
   - [ ] Review modal appears (optional review)
   - [ ] Confirmation message

2. **Calculate Scores**
   - [ ] System calculates scores
   - [ ] Converts raw → TOEIC scaled (5-495)
   - [ ] Determines proficiency level
   - [ ] Saves to database

3. **Results Page**
   - [ ] Redirects to `/toeic-result/{submissionId}`
   - [ ] Displays:
     - [ ] Listening score (5-495)
     - [ ] Reading score (5-495)
     - [ ] Total score (10-990)
     - [ ] Proficiency level
   - [ ] Shows part-by-part breakdown

---

### Phase 10: Test Responsive Design

#### Mobile (iPhone 375px)
```bash
# In Chrome DevTools: Toggle device toolbar
```
- [ ] Layout stacks vertically
- [ ] Sidebar moves to top or bottom
- [ ] Buttons are touch-friendly (large)
- [ ] Text readable without zoom
- [ ] Audio/image controls work

#### Tablet (iPad 768px)
- [ ] Sidebar and content visible
- [ ] Proper spacing maintained
- [ ] All buttons clickable
- [ ] Images scale appropriately

#### Desktop (1920px)
- [ ] Full 2-column layout
- [ ] Sidebar sticky on left
- [ ] Content wide and readable
- [ ] Professional appearance

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Test (All 200 Questions)
```
Time: ~60 minutes
Steps:
1. Start fresh test
2. Answer all 200 questions (one answer per question)
3. Navigate through all 7 parts
4. Review answers before submit
5. Submit and verify scores
6. Check results page
```

### Scenario 2: Partial Test (50% Complete)
```
Time: ~30 minutes
Steps:
1. Start test
2. Answer some questions in each part
3. Click review - verify some unanswered
4. Continue answering
5. Submit with unanswered questions
6. Verify scoring handles unanswered (0 points)
```

### Scenario 3: Quick Navigation
```
Time: ~5 minutes
Steps:
1. Start test
2. Jump to Part 5
3. Jump to Part 1
4. Jump to Part 7
5. Verify questions load quickly
6. Verify no data loss
```

### Scenario 4: Audio Restrictions (Real Exam)
```
Time: ~10 minutes
Steps:
1. Ensure mode is 'real_exam'
2. Go to Part 1 question with audio
3. Click play - should work
4. Click play again - should be blocked
5. See error message
6. Verify button disabled
```

### Scenario 5: Time Management
```
Time: ~120 minutes (full exam)
Steps:
1. Take full 120-minute test
2. Watch timer count down
3. Let it auto-submit at 0:00
4. Verify no errors
5. Check results calculated
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Questions not loading | Check API endpoint, verify questions exist in DB |
| Audio not playing | Verify audio file exists in `/uploads/audio/`, check CORS |
| Answers not saving | Check Network tab, verify API endpoint, check server logs |
| Timer not counting down | Verify timeRemaining state updates, check browser console |
| Scores incorrect | Verify formula: (raw/100) × 490 + 5, check database |
| Mobile layout broken | Check CSS media queries, verify viewport meta tag |
| Page slow | Check Redux dev tools, optimize component renders |

---

## ✅ Final Checklist

Before marking as complete, verify:

- [ ] All 7 part types display correctly
- [ ] Audio plays in both real exam and practice modes
- [ ] Answers auto-save without errors
- [ ] Navigation between parts works smoothly
- [ ] Timer counts down and auto-submits
- [ ] Score calculation matches expected values
- [ ] Results page displays scores correctly
- [ ] Layout is responsive on mobile
- [ ] No console errors
- [ ] No network errors
- [ ] Database updates correctly
- [ ] All features work as documented

---

## 📞 Support

If you encounter issues:

1. **Check Console**: Open Chrome DevTools (F12) → Console tab
2. **Check Network**: DevTools → Network tab → Look for failed requests
3. **Check Database**: Verify submission and answers saved
4. **Check Logs**: Backend console for server errors
5. **Review Code**: Check imports, props, state management

---

## 🎉 Success Indicators

When testing is complete and all scenarios pass:

✅ TOEIC test feature is ready for production
✅ Users can take full 120-minute exams
✅ Scores are calculated accurately
✅ Results are displayed properly
✅ Mobile experience is smooth
✅ No critical bugs found

---

**Testing Guide Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Quality Assurance
