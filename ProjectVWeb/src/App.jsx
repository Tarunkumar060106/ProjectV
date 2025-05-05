import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/Dashboard";
import LandingPage from "./pages/LandingPage";
import StudentRegistration from "./pages/Student/StudentRegistration";
import TeacherRegistration from "./pages/Teacher/TeacherRegistration";
import WaitingApproval from "./pages/WaitingApproval";
import PendingUsersPage from "./pages/Admin/PendingUsersPage";
import AllUsersPage from "./pages/Admin/AllUsersPage";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import Course from "./pages/Teacher/Course"
import Subjects from "./pages/Teacher/Subjects";
import Exams from "./pages/Teacher/Exams";
import AddQuestionPage from "./pages/Teacher/AddQuestionPage";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentExamsPage from "./pages/Student/StudentExamsPage";
import StudentCourseCard from "./components/StudentCourseCard";
import StudentCoursesPage from "./pages/Student/StudentCoursePage";
import ExamRulesPage from "./pages/Student/ExamRulesPage";
import ExamPage from "./pages/Student/ExamPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = useSelector((state) => state.auth.token);

  return (
    <Router>
      <Routes>
        {/* Redirect to Dashboard if logged in, else show Login */}
        <Route path="/" element={<LandingPage />}/>
        
        {/* Public Routes */}
        <Route path="/register-student" element={<StudentRegistration />} />
        <Route path="/register-teacher" element={<TeacherRegistration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        
        {/* Protected Route for Admin Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/pending-users"
          element={
            <ProtectedRoute>
              <PendingUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/all-users"
          element={
            <ProtectedRoute>
              <AllUsersPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute>
              <Course />
            </ProtectedRoute>
          }
        />
      <Route
          path="/teacher/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />
      <Route
          path="/teacher/exams"
          element={
            <ProtectedRoute>
              <Exams />
            </ProtectedRoute>
          }
        />
      <Route
          path="/teacher/exams/:examId/add-question"
          element={
            <ProtectedRoute>
              <AddQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams"
          element={
            <ProtectedRoute>
              <StudentExamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <StudentCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams/:examId"
          element={
            <ProtectedRoute>
              <ExamRulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exam/:examId/start"
          element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exam/:examId/result"
          element={
            <ProtectedRoute>
              <StudentExamsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
