import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import WordList from './components/layout/WordList';
import WordDetails from './components/layout/WordDetails';
import Footer from './components/layout/Footer';
import TedVideosPage from './pages/TedVideosPage';
import { AuthProvider } from './context/AuthContext';
import Profile from './components/profile/Profile';
import { AdminRoute } from './components/auth/ProtectedRoute';
import AccountManagement from './components/admin/AccountManagement';
import Dashboard from './components/admin/Dashboard';
import AdminCoursesPage from './components/admin/AdminCourses';
import AdminLessonsPage from './components/admin/AdminLessons';
import AdminExercisesPage from './components/admin/AdminExercises';
import LessonsPage from './pages/Lessons';
import ExercisesPage from './pages/Exercises';
import CoursesPage from './pages/Courses';
import ProgressPage from './pages/Progress';
import Favorite from './components/profile/Favorites';
import GrammarlyPage from './pages/GrammarlyPage';
import BasicTenses from './pages/GrammarlyPage/BasicTenses';
import PartsOfSpeech from './pages/GrammarlyPage/PartsOfSpeech';
import SentenceStructure from './pages/GrammarlyPage/SentenceStructure';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import CreateBlog from './pages/CreateBlog';
import AdminBlogs from './components/admin/AdminBlogs';

// ✅ TOEIC Admin Components
import AdminBooks from './components/admin/AdminBooks';
import AdminToeicExams from './components/admin/AdminToeicExams';
import AdminToeicQuestions from './components/admin/AdminToeicQuestions';

// ✅ TOEIC Student Components
import ToeicDashboard from './pages/ToeicDashboard';
import ToeicExamDetail from './pages/ToeicExamDetail';
import ToeicTest from './pages/ToeicTest';
import ToeicResult from './pages/ToeicResult';
import ToeicReview from './pages/ToeicReview';
import ToeicHistory from './pages/ToeicHistory';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wordlist" element={<WordList />} />
              <Route path="/dictionary/:word" element={<WordDetails />} />
              
              {/* Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                }
              >
                {/* Existing Admin Routes */}
                <Route path="account-management" element={<AccountManagement />} />
                <Route path="courses-management" element={<AdminCoursesPage />} />
                <Route path="lessons-management/:courseId" element={<AdminLessonsPage />} />
                <Route path="exercises-management/:lessonId" element={<AdminExercisesPage />} />
                <Route path="blogs-management" element={<AdminBlogs />} />

                {/* ✅ TOEIC Admin Routes */}
                <Route path="books-management" element={<AdminBooks />} />
                <Route path="exams-management/:bookId" element={<AdminToeicExams />} />
                <Route path="questions-management/:examId" element={<AdminToeicQuestions />} />
              </Route>

              {/* User Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ted-videos" element={<TedVideosPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId/lessons" element={<LessonsPage />} />
              <Route path="/lessons/:lessonId/exercises" element={<ExercisesPage />} />
              <Route path="/progress/:userId" element={<ProgressPage />} />
              <Route path="/favorites/:userId" element={<Favorite />} />
              <Route path="/grammarly" element={<GrammarlyPage />} />
              <Route path="/basic-tenses" element={<BasicTenses />} />
              <Route path="/parts-of-speech" element={<PartsOfSpeech />} />
              <Route path="/sentence-structure" element={<SentenceStructure />} />
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/create-blog" element={<CreateBlog />} />

              {/* ✅ TOEIC Student Routes */}
              <Route path="/toeic" element={<ToeicDashboard />} />
              <Route path="/toeic/exam/:examId" element={<ToeicExamDetail />} />
              <Route path="/toeic/test/:submissionId" element={<ToeicTest />} />
              <Route path="/toeic/result/:submissionId" element={<ToeicResult />} />
              <Route path="/toeic/review/:submissionId" element={<ToeicReview />} />
              <Route path="/toeic/history" element={<ToeicHistory />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;