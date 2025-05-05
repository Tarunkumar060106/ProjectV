import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import LogoutButton from "../../components/LogoutButton";

// Define types
interface CreatedBy {
  _id: string;
  first_name: string;
  last_name: string;
}

interface RecentExam {
  _id: string;
  title: string;
  date: string;
  total_marks: number;
  created_by: CreatedBy;
}

interface AssignedStudent {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface DashboardData {
  totalCourse: number;
  totalExam: number;
  assigned_students: AssignedStudent[];
  recentExam: RecentExam[];
}

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Redux state
  const { token, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/teacher/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Ensure correct structure
        setDashboardData({
          ...response.data,
          assigned_students: Array.isArray(response.data.assigned_students)
            ? response.data.assigned_students
            : [],
        });

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard");
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };

  if (!token) {
    return <p className="text-center text-red-500">You are not authorized.</p>;
  }

  if (loading) return <p className="text-center">Loading dashboard...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <LogoutButton onLogout={handleLogout} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardData && <StatCard label="Total Courses" value={dashboardData.totalCourse} color="bg-blue-500" />}
        <StatCard label="Total Exams" value={dashboardData?.totalExam || 0} color="bg-green-500" />
        <StatCard
          label="Assigned Students"
          value={dashboardData?.assigned_students.length || 0}
          color="bg-purple-500"
        />
      </div>

      {/* Assigned Students Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Students</h2>
          <Link
            to="/teacher/students"
            className="text-blue-500 hover:underline font-medium"
          >
            View All ({dashboardData?.assigned_students.length || 0})
          </Link>
        </div>
        {dashboardData?.assigned_students.length === 0 ? (
          <p className="text-gray-500 italic">No students assigned yet.</p>
        ) : (
          <ul className="space-y-3">
            {dashboardData?.assigned_students.map((student) => (
              <li key={student._id} className="border-b pb-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <Link to={`/teacher/student/${student._id}`} className="text-indigo-600 hover:text-indigo-800">
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Exams Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Exams</h2>
        {dashboardData?.recentExam.length === 0 ? (
          <p className="text-gray-500">No recent exams found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Exam Title</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Marks</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {dashboardData?.recentExam.map((exam) => (
                <tr key={exam._id}>
                  <td className="px-4 py-2 text-sm">{exam.title}</td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(exam.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">{exam.total_marks}</td>
                  <td className="px-4 py-2 text-sm">
                    {exam.created_by.first_name} {exam.created_by.last_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/teacher/courses"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
          >
            Manage Courses
          </Link>
          <Link
            to="/teacher/subjects"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition"
          >
            Manage Subjects
          </Link>
          <Link
            to="/teacher/exams"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition"
          >
            Manage Exams
          </Link>
          <Link
            to="/teacher/questions"
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition"
          >
            Manage Questions
          </Link>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color = "bg-blue-500" }) => (
  <div className={`rounded-lg shadow-md p-6 text-white ${color}`}>
    <h3 className="text-xl font-semibold">{label}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default TeacherDashboard;