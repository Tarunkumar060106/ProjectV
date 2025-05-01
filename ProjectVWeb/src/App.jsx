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
      </Routes>
    </Router>
  );
}

export default App;
