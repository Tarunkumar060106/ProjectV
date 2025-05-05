// src/pages/student/StudentCoursesPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentCourseCard from "../../components/StudentCourseCard";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorCard from "../../components/ErrorCard";

interface Course {
  _id: string;
  name: string;
  description?: string;
}

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Ensure response is an array
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
    } else {
      window.location.href = "/login";
    }
  }, [token]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorCard message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Courses</h1>

      {courses.length === 0 ? (
        <p className="text-gray-500 italic">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <StudentCourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;