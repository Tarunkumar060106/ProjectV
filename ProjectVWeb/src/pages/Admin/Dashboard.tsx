import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import LogoutButton from "../../components/LogoutButton";

interface DashboardData {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  totalExams: number;
  pendingUsersCount: number; // Count of pending users
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Access Redux state for the token
  const { token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token from Redux state
          },
        });
        setDashboardData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
  };

  if (!token) {
    return <p className="text-center text-red-500">You are not authorized to view this page.</p>;
  }

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <LogoutButton onLogout={handleLogout} />
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700">Total Users</h3>
          <p className="text-2xl font-bold text-blue-500">{dashboardData?.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700">Total Students</h3>
          <p className="text-2xl font-bold text-green-500">{dashboardData?.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-700">Total Teachers</h3>
          <p className="text-2xl font-bold text-indigo-500">{dashboardData?.totalTeachers}</p>
        </div>
      </div>

      {/* Pending Users Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Pending Users</h2>
          <Link
            to="/admin/pending-users"
            className="text-blue-500 hover:underline font-medium"
          >
            View All ({dashboardData?.pendingUsersCount})
          </Link>
        </div>
        <p className="text-gray-500">
          There are currently{" "}
          <span className="font-bold text-black">{dashboardData?.pendingUsersCount}</span>{" "}
          users awaiting approval.
        </p>
      </div>

      {/* All Users Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Users</h2>
        <p className="text-gray-500">
          View and manage all registered users in the{" "}
          <Link to="/admin/all-users" className="text-blue-500 underline">
            All Users Page
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;