// src/components/StudentCourseCard.tsx
import React from "react";
import { Link } from "react-router-dom";

interface Course {
  _id: string;
  name: string;
  description?: string;
}

interface StudentCourseCardProps {
  course: Course;
}

const StudentCourseCard: React.FC<StudentCourseCardProps> = ({ course }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-gray-800">{course.name}</h3>
      {course.description && (
        <p className="text-sm text-gray-600 mt-2">{course.description}</p>
      )}
      <Link
        to={`/student/course/${course._id}`}
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        View Details →
      </Link>
    </div>
  );
};

export default StudentCourseCard;