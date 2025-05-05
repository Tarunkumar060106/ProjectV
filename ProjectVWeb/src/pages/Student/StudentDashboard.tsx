import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import LogoutButton from "../../components/LogoutButton";

// Types
interface CreatedBy {
  _id: string;
  first_name: string;
  last_name: string;
}

interface Course {
  _id: string;
  name: string;
}

interface Exam {
  _id: string;
  title: string;
  date: string;
  duration: number;
  total_marks: number;
  course_id: Course;
  created_by: CreatedBy;
}

interface Result {
  score: number;
}

interface UpcomingExam extends Exam {
  canAttempt: boolean;
}

interface DashboardData {
  exams: UpcomingExam[];
  courses: Course[];
  results: Record<string, Result>; // examId => result
}

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { token, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/student/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const examsWithStatus = response.data.exams.map((exam: any) => ({
          ...exam,
          canAttempt: new Date(exam.date) <= new Date(),
        }));

        const examIds = examsWithStatus.map((e: Exam) => e._id);

        const resultsRes = await axios.post(
          "http://localhost:5000/api/student/results",
          { examIds },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resultsMap = resultsRes.data.results.reduce((acc: Record<string, Result>, res: any) => {
          acc[res.exam_id] = { score: res.score };
          return acc;
        }, {});

        setDashboardData({
          exams: examsWithStatus,
          courses: response.data.courses || [],
          results: resultsMap,
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
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <LogoutButton onLogout={handleLogout} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardData && (
          <StatCard label="Upcoming Exams" value={dashboardData.exams.length} color="bg-blue-500" />
        )}
        <StatCard label="Enrolled Courses" value={dashboardData ? dashboardData.courses.length : 0} color="bg-green-500" />
        <StatCard label="Exams Taken" value={dashboardData ? Object.keys(dashboardData.results).length : 0} color="bg-purple-500" />
      </div>

      {/* Upcoming Exams Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Exams</h2>
        {dashboardData && dashboardData.exams.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming exams found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Exam Title</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Duration (mins)</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Marks</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {dashboardData?.exams.map((exam) => {
                const result = dashboardData.results[exam._id];
                return (
                  <tr key={exam._id}>
                    <td className="px-4 py-2 text-sm">{exam.title}</td>
                    <td className="px-4 py-2 text-sm">{exam.course_id.name}</td>
                    <td className="px-4 py-2 text-sm">{new Date(exam.date).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{exam.duration}</td>
                    <td className="px-4 py-2 text-sm">{exam.total_marks}</td>
                    <td className="px-4 py-2 text-sm">
                      {result ? "Submitted" : exam.canAttempt ? "Ready" : "Scheduled"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {result ? (
                        <span>Score: {result.score}</span>
                      ) : exam.canAttempt ? (
                        <Link
                          to={`/student/exams/${exam._id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Start Exam
                        </Link>
                      ) : (
                        <span className="text-gray-400">Not yet open</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/student/courses"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
          >
            View Courses
          </Link>
          <Link
            to="/student/exams"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition"
          >
            All Exams
          </Link>
          <Link
            to="/student/results"
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition"
          >
            View Results
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

export default StudentDashboard;