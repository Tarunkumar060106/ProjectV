import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔍 Type Definitions
interface Teacher {
  _id: string;
  first_name: string;
  last_name: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  teacher_id: string;
}

const StudentRegistration: React.FC = () => {
  // State
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    teacher_id: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fetchingTeachers, setFetchingTeachers] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/teacher/approved");
        setTeachers(res.data.teachers || []);
      } catch (err) {
        console.error("Failed to load teachers:", err);
        setError("Could not load teacher list. Please try again later.");
      } finally {
        setFetchingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register/student", formData);
      navigate("/waiting-approval"); // Redirect to waiting approval page
      setSuccessMessage(response.data.message || "Student registered successfully!");
      
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        teacher_id: "",
      });
    } catch (err: any) {
      console.error("Registration error:", err.response?.data);
      setError(err.response?.data?.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Register as Student</h2>

      {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
      {successMessage && <p className="mb-4 text-green-500 text-center">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div>
          <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
            Select Teacher
          </label>
          {fetchingTeachers ? (
            <p className="text-gray-500 italic">Loading teachers...</p>
          ) : teachers.length === 0 ? (
            <p className="text-gray-500 italic">No teachers found.</p>
          ) : (
            <select
              id="teacher_id"
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">-- Select a Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-200 ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Registering..." : "Register as Student"}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistration;