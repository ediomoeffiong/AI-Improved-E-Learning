import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/global.css';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import ScrollToTop from './components/common/ScrollToTop';

import DevModeIndicator from './components/common/DevModeIndicator';
import CacheRefreshIndicator from './components/common/CacheRefreshIndicator';
import OfflineIndicator from './components/common/OfflineIndicator';
import BackendErrorNotification from './components/common/DemoModeNotification';
import DemoModeIndicator from './components/common/DemoModeIndicator';
import PWAPrompt from './components/pwa/PWAPrompt';
import AchievementNotificationManager from './components/gamification/AchievementNotificationManager';
import { AuthProvider } from './contexts/AuthContext';
import { GamificationProvider } from './contexts/GamificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InstitutionProtectedRoute from './components/auth/InstitutionProtectedRoute';

// Main pages
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Offline from './pages/Offline';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import CoursesDashboard from './pages/courses/CoursesDashboard';
import Available from './pages/courses/Available';
import CourseDetails from './pages/courses/CourseDetails';
import MyCourses from './pages/courses/MyCourses';
import CourseMaterials from './pages/courses/CourseMaterials';
import Discussion from './pages/courses/Discussion';
import ThreadDetail from './pages/courses/ThreadDetail';

// Quiz pages
import QuizDashboard from './pages/quiz/QuizDashboard';
import Badges from './pages/quiz/Badges';
import Achievements from './pages/quiz/Achievements';
import Leaderboard from './pages/quiz/Leaderboard';

// Classroom pages
import ClassroomDashboard from './pages/classroom/ClassroomDashboard';
import ChatFeature from './pages/classroom/ChatFeature';
import SessionRecordings from './pages/classroom/SessionRecordings';

// CBT pages
import CBTDashboard from './pages/cbt/CBTDashboard';
import Practice from './pages/cbt/Practice';
import TakeAssessment from './pages/cbt/TakeAssessment';
import ViewResults from './pages/cbt/ViewResults';

// Progress pages
import ProgressDashboard from './pages/progress/ProgressDashboard';
import PerformanceReports from './pages/progress/PerformanceReports';
import ActivityLogs from './pages/progress/ActivityLogs';
import PersonalizedRecommendations from './pages/progress/PersonalizedRecommendations';

// User pages
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

// Support pages
import Support from './pages/support/Support';

// Legal pages
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <Router>
        <ScrollToTop />
        <PWAPrompt />
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow pt-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto py-6">
            <Routes>
              {/* Home and Auth Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
              <Route path="/register" element={<ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>} />
              <Route path="/offline" element={<Offline />} />
              
              {/* Public Course Routes */}
              <Route path="/courses/available" element={<Available />} />

              {/* Public Support Route */}
              <Route path="/support" element={<Support />} />

              {/* Legal Routes */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              {/* Protected Courses Routes */}
              <Route path="/courses/dashboard" element={<ProtectedRoute><CoursesDashboard /></ProtectedRoute>} />
              <Route path="/courses/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/courses/materials" element={<ProtectedRoute><CourseMaterials /></ProtectedRoute>} />
              <Route path="/courses/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
              <Route path="/courses/discussion/:threadId" element={<ProtectedRoute><ThreadDetail /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
              
              {/* Protected Quiz Routes */}
              <Route path="/quiz/dashboard" element={<ProtectedRoute><QuizDashboard /></ProtectedRoute>} />
              <Route path="/quiz/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
              <Route path="/quiz/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/quiz/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              
              {/* Protected Classroom Routes - Require Institution Functions */}
              <Route path="/classroom/dashboard" element={<InstitutionProtectedRoute><ClassroomDashboard /></InstitutionProtectedRoute>} />
              <Route path="/classroom/chat" element={<InstitutionProtectedRoute><ChatFeature /></InstitutionProtectedRoute>} />
              <Route path="/classroom/recordings" element={<InstitutionProtectedRoute><SessionRecordings /></InstitutionProtectedRoute>} />

              {/* Protected CBT Routes - Require Institution Functions */}
              <Route path="/cbt/dashboard" element={<InstitutionProtectedRoute><CBTDashboard /></InstitutionProtectedRoute>} />
              <Route path="/cbt/practice" element={<InstitutionProtectedRoute><Practice /></InstitutionProtectedRoute>} />
              <Route path="/cbt/take-assessment" element={<InstitutionProtectedRoute><TakeAssessment /></InstitutionProtectedRoute>} />
              <Route path="/cbt/view-results" element={<InstitutionProtectedRoute><ViewResults /></InstitutionProtectedRoute>} />
              
              {/* Protected Progress Routes */}
              <Route path="/progress/dashboard" element={<ProtectedRoute><ProgressDashboard /></ProtectedRoute>} />
              <Route path="/progress/reports" element={<ProtectedRoute><PerformanceReports /></ProtectedRoute>} />
              <Route path="/progress/activity" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
              <Route path="/progress/recommendations" element={<ProtectedRoute><PersonalizedRecommendations /></ProtectedRoute>} />

              {/* Protected User Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
        <Chatbot />
        <Footer />
        <OfflineIndicator />
        <CacheRefreshIndicator />
        <DevModeIndicator />
        <BackendErrorNotification />
        <DemoModeIndicator />
        <AchievementNotificationManager />
        </div>
      </Router>
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;




