# TOEIC Test Debug Checklist

Follow these steps to find and fix the problem.

---

## Step 1: Check Browser Console (CRITICAL!)

**Instructions:**
1. Open your browser to http://localhost:5173/toeic
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Try to start a test and watch for errors
5. **Screenshot/copy any red error messages**

**Common errors you might see:**
- `Cannot read property 'map' of undefined` → Questions not loaded
- `examId is undefined` → Exam not linked to questions
- `404 Not Found` → API endpoint wrong
- `Unexpected token < in JSON` → Backend not responding

---

## Step 2: Check Network Tab

**Instructions:**
1. In DevTools, click **Network** tab
2. Reload the page
3. Start a test
4. Look for API calls:
   - `submissions` - Should return 200 ✅
   - `questions/exam/` - Check if it's 200 or 404 ❌
   - Filter by XHR to see only API calls

**What to check:**
- Red failed requests (404, 500, etc.)
- Click each request to see the response
- If `questions/exam/xxxxx` returns 404, the exam ID is wrong

---

## Step 3: Verify Backend Server

**In a terminal, run:**

```powershell
# Check if backend is running on port 5000
netstat -ano | findstr :5000
```

**Expected output:**
- Should show a process listening on port 5000
- If nothing appears, backend is NOT running

**To start backend:**
```bash
cd server
npm start
# or
node server.js
```

---

## Step 4: Check Database Connection

**Open MongoDB Compass and run this query:**

```javascript
// In Compass > english_learning_db > exams collection
db.exams.findOne()
```

**You should see:**
```javascript
{
  _id: ObjectId("..."),
  title: "ETS2020 - Test 1",
  status: "draft",        // ← Should be "draft" or "published"
  isActive: true,         // ← Should be true
  duration: 120,
  totalQuestions: 200,
  bookId: ObjectId("...")
}
```

**Then check questions:**
```javascript
// In questions collection
db.questions.findOne()
```

**You should see:**
```javascript
{
  _id: ObjectId("..."),
  examId: ObjectId("..."),  // ← MUST match exam._id above!
  part: 1,
  questionNumber: 1,
  correctAnswer: "A",
  ...
}
```

**If examId is missing or wrong → That's the problem!**

---

## Step 5: Test API Endpoints Manually

**Use this online tool or Postman:**
https://httpie.io/ or install `curl`

**Test 1: Get an exam**
```bash
curl http://localhost:5000/api/exams
```

**Expected:** List of exams with their IDs

**Test 2: Get questions for an exam**
```bash
# Replace EXAM_ID with an actual ID from Test 1
curl http://localhost:5000/api/questions/exam/EXAM_ID
```

**Expected:** Array of questions
**If 404:** The exam ID is not matching questions in DB

**Test 3: Create a submission**
```bash
curl -X POST http://localhost:5000/api/submissions/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"examId": "EXAM_ID", "mode": "practice"}'
```

---

## Step 6: Check File Imports in ToeicTest.jsx

**File:** `src/pages/ToeicTest.jsx`

**Verify these imports exist:**
```javascript
✓ import useTestSession from '../../hooks/useTestSession'
✓ import TestTimer from '../../components/test/TestTimer'
✓ import TestNavigation from '../../components/test/TestNavigation'
✓ import TestProgressBar from '../../components/test/TestProgressBar'
✓ import AnswerReview from '../../components/test/AnswerReview'
✓ import Part1Question from '../../components/test/Part1Question'
... (all 7 parts)
```

**If any red squiggly lines → Files are missing or path is wrong**

---

## Step 7: Check Loading State

**In browser console, add this to ToeicTest.jsx temporarily:**

Find this line:
```javascript
if (loading) return <div className="test-loading">Loading test...</div>;
```

Add a console.log before it:
```javascript
useEffect(() => {
    console.log('Test page mounted, submissionId:', submissionId);
}, [submissionId]);

useEffect(() => {
    console.log('Loading state:', loading);
    console.log('Questions count:', questions.length);
    console.log('Submission:', submission);
}, [loading, questions, submission]);
```

**Then check console:**
- Does `submissionId` appear? If not, URL routing is wrong
- Does `Loading state` show `true` then `false`? If it stays `true`, data fetch failed
- Does `Questions count` show > 0? If 0, questions endpoint returned empty

---

## Most Likely Problems (In Order)

### ❌ Problem #1: **examId Not Set on Questions**
**Check:** MongoDB questions collection - do they have `examId` field?
**Fix:** Re-create questions with correct exam ID selected

### ❌ Problem #2: **Wrong URL Path in API Calls**
**Check:** Browser Network tab - what URL is being called?
**Fix:** Verify URLs match your backend routes exactly

### ❌ Problem #3: **Backend Not Running**
**Check:** Can you access http://localhost:5000?
**Fix:** Start backend server with `node server.js`

### ❌ Problem #4: **Questions Array Empty**
**Check:** Did you actually create questions in admin panel?
**Fix:** Go to admin → Create questions for each part

### ❌ Problem #5: **useTestSession Hook Not Working**
**Check:** Does the hook file exist at `src/hooks/useTestSession.js`?
**Fix:** Verify the hook imports and exports

---

## Quick Debugging Script

Add this to browser console (F12) while on the test page:

```javascript
// Check submission ID
console.log('Submission ID:', document.location.pathname);

// Check local storage token
console.log('Auth token:', localStorage.getItem('token'));

// Make a test API call
fetch('http://localhost:5000/api/exams')
  .then(r => r.json())
  .then(d => console.log('Exams:', d))
  .catch(e => console.log('API Error:', e));
```

---

## Tell Me These Things

When you message back, include:

1. **Browser console error messages** (screenshot or copy text)
2. **Network tab - which requests failed?** (404, 500, etc)
3. **Does `console.log('Loading state:')` print?** (Yes/No)
4. **How many questions show in MongoDB?** (Count from Compass)
5. **Are questions linked to exam?** (Do they have examId field?)

This will help me fix it quickly! 🎯

---

**Most Common Fix:**
90% of the time, the problem is **questions don't have the examId field set correctly** in MongoDB.

Check this:
1. Open MongoDB Compass
2. View `questions` collection
3. Look for `examId` field in a question document
4. If missing → Re-create questions from admin panel
5. If wrong ID → All questions have wrong exam linked

