import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Types
interface Course {
  _id: string;
  name: string;
  description?: string;
}

const Course: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Redux auth
  const { token } = useSelector((state: any) => state.auth);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/teacher/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Access res.data.courses and ensure it's an array
        if (Array.isArray(res.data.courses)) {
          setCourses(res.data.courses);
        } else {
          console.error("Expected array but got:", res.data);
          setCourses([]);
        }

      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  // Handle create course
  const handleCreate = async () => {
    if (!newCourse.name.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/teacher/courses",
        newCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCourses([...courses, res.data]);
      setNewCourse({ name: "", description: "" });
    } catch (err) {
      setError("Failed to create course");
    }
  };

  // Handle update course
  const handleUpdate = async () => {
    if (!editingCourse || !editingCourse._id) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/teacher/courses/${editingCourse._id}`,
        editingCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(
        courses.map((c) => (c._id === editingCourse._id ? res.data : c))
      );
      setEditingCourse(null);
    } catch (err) {
      setError("Failed to update course");
    }
  };

  // Handle delete course
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/teacher/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(courses.filter((c) => c._id !== id));
    } catch (err) {
      setError("Failed to delete course");
    }
  };

  // Auth check
  if (!token) {
    return <p className="text-center text-red-500">You are not authorized.</p>;
  }

  if (loading) {
    return <p className="text-center">Loading courses...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
        <Link
          to="/teacher/dashboard"
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Create New Course */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-500">Add New Course</h2>
        <div className="space-y-4 text-black">
          <input
            type="text"
            placeholder="Course Name"
            value={newCourse.name}
            onChange={(e) =>
              setNewCourse({ ...newCourse, name: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            placeholder="Description (optional)"
            value={newCourse.description}
            onChange={(e) =>
              setNewCourse({ ...newCourse, description: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
          />
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Add Course
          </button>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Course List</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Course Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-600">
                    {course.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {course.description || "-"}
                  </td>
                  <td className="px-4 py-2 text-sm space-x-2">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
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
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow-lg text-black">
            <h3 className="text-lg font-bold mb-4">Edit Course</h3>
            <input
              type="text"
              value={editingCourse.name}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  name: e.target.value,
                })
              }
              className="w-full border px-4 py-2 rounded mb-4"
            />
            <textarea
              value={editingCourse.description || ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  description: e.target.value,
                })
              }
              className="w-full border px-4 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

export default Course;