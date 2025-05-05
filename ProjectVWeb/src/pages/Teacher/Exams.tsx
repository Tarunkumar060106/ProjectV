import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

// Types
interface Course {
  _id: string;
  name: string;
}

interface Section {
  _id: string;
  title: string;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  duration: number;
  total_marks: number;
  course_id: Course | string;
  sections?: Section[];
}

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dateTime: string;
    duration: number;
    total_marks: number;
    course_id: string;
  }>({
    title: "",
    description: "",
    dateTime: "",
    duration: 0,
    total_marks: 0,
    course_id: "",
  });
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { token } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, coursesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/teacher/exams", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/teacher/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setExams(examsRes.data.exams || []);
        setCourses(coursesRes.data.courses || []);
      } catch (err: any) {
        console.error("Failed to load data:", err.message);
        setError("Failed to load exams and courses");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  // Handle form submit (Add/Edit)
  const handleSubmit = async () => {
    const { title, description, dateTime, duration, total_marks, course_id } = formData;

    if (!title || !dateTime || !duration || !total_marks || !course_id) {
      setError("All required fields must be filled.");
      return;
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime())) {
      setError("Please select a valid date and time.");
      return;
    }

    const fullDateTime = parsedDate.toISOString();

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const payload = {
        title,
        description,
        date: fullDateTime,
        duration,
        total_marks,
        course_id,
      };

      let res;
      if (editingExam) {
        res = await axios.put(
          `http://localhost:5000/api/teacher/exams/${editingExam._id}`,
          payload,
          config
        );
        setExams(exams.map((e) => (e._id === editingExam._id ? res.data : e)));
        setEditingExam(null);
      } else {
        res = await axios.post("http://localhost:5000/api/teacher/exams", payload, config);
        setExams([...exams, res.data]);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        dateTime: "",
        duration: 0,
        total_marks: 0,
        course_id: "",
      });
      setError("");
    } catch (err: any) {
      console.error("Error saving exam:", err.response?.data || err.message);
      setError("Failed to save exam");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/teacher/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(exams.filter((e) => e._id !== id));
    } catch (err) {
      setError("Failed to delete exam");
    }
  };

  // Render UI
  if (loading) {
    return <p className="text-center">Loading exams...</p>;
  }

  if (error && !exams.length) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Exams</h1>
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">
          {editingExam ? "Edit Exam" : "Add New Exam"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4 text-black">
          <input
            type="text"
            placeholder="Exam Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) =>
              setFormData({ ...formData, dateTime: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                duration: parseInt(e.target.value) || 0,
              })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Total Marks"
            value={formData.total_marks || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_marks: parseInt(e.target.value) || 0,
              })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <select
            value={formData.course_id}
            onChange={(e) =>
              setFormData({ ...formData, course_id: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.course_id}
            className={`w-full md:w-auto px-4 py-2 rounded text-white ${
              !formData.title || !formData.course_id
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {editingExam ? "Update Exam" : "Add Exam"}
          </button>
        </div>
      </div>

      {/* Exam List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Exam List</h2>
        {exams.length === 0 ? (
          <p className="text-gray-500">No exams found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Exam Title
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Course
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Date & Time
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Duration
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Total Marks
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td className="px-4 py-2 text-sm text-gray-600">{exam.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {typeof exam.course_id === "string"
                      ? "N/A"
                      : exam.course_id?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(exam.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {exam.duration} mins
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {exam.total_marks}
                  </td>
                  <td className="px-4 py-2 text-sm space-x-2">
                    <button
                      onClick={() => {
                        setEditingExam(exam);
                        setFormData({
                          title: exam.title,
                          description: exam.description || "",
                          dateTime: new Date(exam.date).toISOString().slice(0, 16),
                          duration: exam.duration,
                          total_marks: exam.total_marks,
                          course_id:
                            typeof exam.course_id === "string"
                              ? exam.course_id
                              : exam.course_id?._id || "",
                        });
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="text-red-500 hover:underline ml-2"
                    >
                      Delete
                    </button>
                    <Link
                      to={`/teacher/exams/${exam._id}/add-question`}
                      className="text-green-600 hover:underline ml-2"
                    >
                      Add Questions
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Exams;