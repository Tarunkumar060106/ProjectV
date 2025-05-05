import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Types
interface Course {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
  course_id: Course;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newSubject, setNewSubject] = useState<{ name: string; course_id: string }>({
    name: "",
    course_id: "",
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Redux auth
  const { token } = useSelector((state: any) => state.auth);

  // Fetch subjects and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, coursesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/teacher/subjects", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("http://localhost:5000/api/teacher/courses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (Array.isArray(subjectsRes.data.subjects)) {
          setSubjects(subjectsRes.data.subjects);
        }

        if (Array.isArray(coursesRes.data.courses)) {
          setCourses(coursesRes.data.courses);
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Handle create or update
  const handleSubmit = async () => {
    if (!newSubject.name || !newSubject.course_id) return;
  
    try {
      if (editingSubject) {
        // Update existing subject
        const res = await axios.put(
          `http://localhost:5000/api/teacher/subjects/${editingSubject._id}`,
          newSubject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        setSubjects(
          subjects.map((s) =>
            s._id === editingSubject._id ? res.data : s
          )
        );
        setEditingSubject(null);
      } else {
        // Create new subject
        const res = await axios.post(
          "http://localhost:5000/api/teacher/subjects",
          newSubject,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // ✅ Add directly to list without refetching
        setSubjects([...subjects, res.data]);
      }
  
      // Reset form
      setNewSubject({ name: "", course_id: "" });
    } catch (err: any) {
      console.error("❌ Error saving subject:", err.response?.data || err.message);
      setError("Failed to save subject");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/teacher/subjects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubjects(subjects.filter((s) => s._id !== id));
    } catch (err) {
      setError("Failed to delete subject");
    }
  };

  // Auth check
  if (!token) {
    return <p className="text-center text-red-500">You are not authorized.</p>;
  }

  if (loading) {
    return <p className="text-center">Loading subjects...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Subjects</h1>
        <Link
          to="/teacher/dashboard"
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Add New Subject */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-500">Add New Subject</h2>
        <div className="space-y-4 text-black">
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject.name}
            onChange={(e) =>
              setNewSubject({ ...newSubject, name: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          />

          <select
            value={newSubject.course_id}
            onChange={(e) =>
              setNewSubject({ ...newSubject, course_id: e.target.value })
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
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            {editingSubject ? "Update Subject" : "Add Subject"}
          </button>
        </div>
      </div>

      {/* Subject List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Subject List</h2>
        {subjects.length === 0 ? (
          <p className="text-gray-500">No subjects found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Subject Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Course
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject._id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-600">
                    {subject.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {subject.course_id?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm space-x-2">
                    <button
                      onClick={() => {
                        setEditingSubject(subject);
                        setNewSubject({
                            name: subject.name,
                            course_id:
                              typeof subject.course_id === "string"
                                ? subject.course_id
                                : subject.course_id._id,
                          });
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow-lg text-black">
            <h3 className="text-lg font-bold mb-4">Edit Subject</h3>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
              placeholder="Subject Name"
              className="w-full border px-4 py-2 rounded mb-4"
            />
            <select
              value={newSubject.course_id}
              onChange={(e) =>
                setNewSubject({ ...newSubject, course_id: e.target.value })
              }
              className="w-full border px-4 py-2 rounded mb-4"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingSubject(null);
                  setNewSubject({ name: "", course_id: "" });
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;

function fetchData() {
    throw new Error("Function not implemented.");
}
