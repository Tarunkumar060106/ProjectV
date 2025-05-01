import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: {
    role_name: string; // Role name is nested under `role_id`
  };
  status: string;
}

const PendingUsersPage = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Access Redux state for the token
  const { token } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/pending-users", {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token from Redux state
          },
        });

        // Extract the `users` array from the response
        setPendingUsers(response.data.users || []); // Fallback to empty array if `users` is undefined
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load pending users");
        setLoading(false);
      }
    };

    if (token) {
      fetchPendingUsers();
    }
  }, [token]);

  // Handle search input changes
  useEffect(() => {
    const filtered = pendingUsers.filter(
      (user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, pendingUsers]);

  // Approve a user
  const handleApproveUser = async (userId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/approve-user/${userId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the local state to remove the approved user
      setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      alert("User approved successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve user");
    }
  };

  // Reject a user
  const handleRejectUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to reject and remove this user?")){

      try {
        await axios.put(`http://localhost:5000/api/admin/reject-user/${userId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Update the local state to remove the rejected user
        setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        alert("User rejected successfully!");
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to reject user");
      }
    }
  };

  if (!token) {
    return <p className="text-center text-red-500">You are not authorized to view this page.</p>;
  }

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Pending Users</h1>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Pending Users Table */}
      {filteredUsers.length === 0 ? (
        <p className="text-gray-500 text-lg">No pending users to review.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition duration-300 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {`${user.first_name} ${user.last_name}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {user.role_id.role_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleApproveUser(user._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectUser(user._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingUsersPage;