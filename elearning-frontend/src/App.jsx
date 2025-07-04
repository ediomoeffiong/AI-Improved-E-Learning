import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/global.css';

// Layout components
import Footer from './components/layout/Footer';
import SmartHeader from './components/layout/SmartHeader';
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
import TakeQuiz from './pages/quiz/TakeQuiz';
import QuizResults from './pages/quiz/QuizResults';
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
import TakePracticeTest from './pages/cbt/TakePracticeTest';
import PracticeTestResults from './pages/cbt/PracticeTestResults';
import TakeAssessment from './pages/cbt/TakeAssessment';
import TakeIndividualAssessment from './pages/cbt/TakeIndividualAssessment';
import AssessmentResults from './pages/cbt/AssessmentResults';
import ViewResults from './pages/cbt/ViewResults';

// Progress pages
import ProgressDashboard from './pages/progress/ProgressDashboard';
import PerformanceReports from './pages/progress/PerformanceReports';
import ActivityLogs from './pages/progress/ActivityLogs';
import PersonalizedRecommendations from './pages/progress/PersonalizedRecommendations';

// User pages
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

// Super Admin pages
import SuperAdminProfile from './pages/admin/SuperAdminProfile';
import SuperAdminSettings from './pages/admin/SuperAdminSettings';

// Super Admin Management pages
import AllCourses from './pages/admin/super-admin/AllCourses';
import CreateCourse from './pages/admin/super-admin/CreateCourse';
import Categories from './pages/admin/super-admin/Categories';
import CourseAnalytics from './pages/admin/super-admin/CourseAnalytics';
import AllQuizzes from './pages/admin/super-admin/AllQuizzes';
import CreateQuiz from './pages/admin/super-admin/CreateQuiz';
import SuperAdminQuizResults from './pages/admin/super-admin/QuizResults';
import ProgressOverview from './pages/admin/super-admin/ProgressOverview';
import CourseCompletions from './pages/admin/super-admin/CourseCompletions';
import LearningPaths from './pages/admin/super-admin/LearningPaths';
import InterventionTools from './pages/admin/super-admin/InterventionTools';

// Support pages
import Support from './pages/support/Support';

// Legal pages
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';

// Super Admin pages
import SuperAdminLogin from './pages/auth/SuperAdminLogin';

// Role-based components
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard';

// Protected route components
import SuperAdminProtectedRoute from './components/auth/SuperAdminProtectedRoute';

// Admin management components
import UserApprovalSystem from './pages/admin/UserApprovalSystem';
import UniversityVerificationSystem from './pages/admin/UniversityVerificationSystem';
import AdminVerificationSystem from './pages/admin/AdminVerificationSystem';
import ModeratorVerificationSystem from './pages/admin/ModeratorVerificationSystem';
import SuperAdminUserManagement from './pages/admin/SuperAdminUserManagement';
import SuperAdminInstitutionManagement from './pages/admin/SuperAdminInstitutionManagement';
import SuperAdminInstitutionPage from './pages/admin/SuperAdminInstitutionPage';
import SuperAdminUserApprovals from './pages/admin/SuperAdminUserApprovals';
import SuperAdminActivityMonitor from './pages/admin/SuperAdminActivityMonitor';
import InstitutionManagement from './components/admin/InstitutionManagement';
import ErrorBoundary from './components/common/ErrorBoundary';
import InstitutionJoinRequest from './pages/user/InstitutionJoinRequest';

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <Router>
        <ScrollToTop />
        <PWAPrompt />
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <SmartHeader />
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

              {/* Super Admin Routes */}
              <Route path="/super-admin-login" element={<SuperAdminLogin />} />

              {/* Admin Management Routes */}
              <Route path="/admin/approvals" element={<ProtectedRoute><UserApprovalSystem /></ProtectedRoute>} />
              <Route path="/admin/moderators" element={<ProtectedRoute><ModeratorVerificationSystem /></ProtectedRoute>} />

              {/* Super Admin Protected Routes */}
              <Route path="/super-admin/users" element={<SuperAdminProtectedRoute><ErrorBoundary><SuperAdminUserManagement /></ErrorBoundary></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/user-approvals" element={<SuperAdminProtectedRoute><ErrorBoundary><SuperAdminUserApprovals /></ErrorBoundary></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/institutions" element={<SuperAdminProtectedRoute><SuperAdminInstitutionPage /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/activity-monitor" element={<SuperAdminProtectedRoute><ErrorBoundary><SuperAdminActivityMonitor /></ErrorBoundary></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/universities" element={<SuperAdminProtectedRoute><UniversityVerificationSystem /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/admins" element={<SuperAdminProtectedRoute><AdminVerificationSystem /></SuperAdminProtectedRoute>} />

              {/* Super Admin Course Management Routes */}
              <Route path="/super-admin/courses" element={<SuperAdminProtectedRoute><AllCourses /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/courses/create" element={<SuperAdminProtectedRoute><CreateCourse /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/categories" element={<SuperAdminProtectedRoute><Categories /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/course-analytics" element={<SuperAdminProtectedRoute><CourseAnalytics /></SuperAdminProtectedRoute>} />

              {/* Super Admin Quiz Management Routes */}
              <Route path="/super-admin/quizzes" element={<SuperAdminProtectedRoute><AllQuizzes /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/quizzes/create" element={<SuperAdminProtectedRoute><CreateQuiz /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/quiz-results" element={<SuperAdminProtectedRoute><SuperAdminQuizResults /></SuperAdminProtectedRoute>} />

              {/* Super Admin Progress Routes */}
              <Route path="/super-admin/progress-overview" element={<SuperAdminProtectedRoute><ProgressOverview /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/course-completions" element={<SuperAdminProtectedRoute><CourseCompletions /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/learning-paths" element={<SuperAdminProtectedRoute><LearningPaths /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/intervention-tools" element={<SuperAdminProtectedRoute><InterventionTools /></SuperAdminProtectedRoute>} />

              {/* User Institution Routes */}
              <Route path="/join-institution" element={<ProtectedRoute><InstitutionJoinRequest /></ProtectedRoute>} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<RoleBasedDashboard />} />

              {/* Protected Courses Routes */}
              <Route path="/courses/dashboard" element={<ProtectedRoute><CoursesDashboard /></ProtectedRoute>} />
              <Route path="/courses/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/courses/materials" element={<ProtectedRoute><CourseMaterials /></ProtectedRoute>} />
              <Route path="/courses/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
              <Route path="/courses/discussion/:threadId" element={<ProtectedRoute><ThreadDetail /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
              
              {/* Protected Quiz Routes */}
              <Route path="/quiz" element={<ProtectedRoute><QuizDashboard /></ProtectedRoute>} />
              <Route path="/quiz/dashboard" element={<ProtectedRoute><QuizDashboard /></ProtectedRoute>} />
              <Route path="/quiz/:id" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
              <Route path="/quiz/:id/results/:attemptId" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
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
              <Route path="/cbt/practice/:id" element={<InstitutionProtectedRoute><TakePracticeTest /></InstitutionProtectedRoute>} />
              <Route path="/cbt/practice/:id/results/:attemptId" element={<InstitutionProtectedRoute><PracticeTestResults /></InstitutionProtectedRoute>} />
              <Route path="/cbt/take-assessment" element={<InstitutionProtectedRoute><TakeAssessment /></InstitutionProtectedRoute>} />
              <Route path="/cbt/assessment/:id" element={<InstitutionProtectedRoute><TakeIndividualAssessment /></InstitutionProtectedRoute>} />
              <Route path="/cbt/assessment/:id/results/:attemptId" element={<InstitutionProtectedRoute><AssessmentResults /></InstitutionProtectedRoute>} />
              <Route path="/cbt/view-results" element={<InstitutionProtectedRoute><ViewResults /></InstitutionProtectedRoute>} />
              
              {/* Protected Progress Routes */}
              <Route path="/progress/dashboard" element={<ProtectedRoute><ProgressDashboard /></ProtectedRoute>} />
              <Route path="/progress/reports" element={<ProtectedRoute><PerformanceReports /></ProtectedRoute>} />
              <Route path="/progress/activity" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
              <Route path="/progress/recommendations" element={<ProtectedRoute><PersonalizedRecommendations /></ProtectedRoute>} />

              {/* Protected User Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Super Admin Profile and Settings Routes */}
              <Route path="/super-admin/profile" element={<SuperAdminProtectedRoute><SuperAdminProfile /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/settings" element={<SuperAdminProtectedRoute><SuperAdminSettings /></SuperAdminProtectedRoute>} />
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




