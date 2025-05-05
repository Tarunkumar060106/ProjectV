import React, { useEffect, useState } from "react";
import axios from "axios"; // You were using fetch before; axios is consistent with other files
import { Link } from "react-router-dom";

// Types
interface Course {
  _id: string;
  name: string;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  duration: number;
  total_marks: number;
  course_id: string | Course; // Can be just ID or populated object
  canAttempt?: boolean;
  result?: {
    total_score: number;
  };
}

interface ExamCardProps {
  exam: Exam;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  const [result, setResult] = useState<{ total_score: number } | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(true);

  // Extract course name safely
  const courseName =
    typeof exam.course_id === "string"
      ? "N/A"
      : exam.course_id?.name || "N/A";

  // Format exam date
  const formattedDate = isNaN(new Date(exam.date).getTime())
    ? "Invalid Date"
    : new Date(exam.date).toLocaleString();

  // Check if exam is live
  const isLive = exam.canAttempt ?? false;

  // Fetch result from backend
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/results/${exam._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // use axios + Bearer token
            },
          }
        );

        if (res.data && res.data.total_score !== undefined) {
          setResult({ total_score: res.data.total_score });
        }
      } catch (err) {
        console.error("Failed to load result:", err);
      } finally {
        setIsLoadingResult(false);
      }
    };

    fetchResult();
  }, [exam._id]);

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-gray-800">{exam.title}</h3>
      <p className="text-sm text-gray-600">Course: {courseName}</p>
      <p className="text-sm text-gray-600">Date: {formattedDate}</p>
      <p className="text-sm text-gray-600">Duration: {exam.duration} mins</p>
      <p className="text-sm text-gray-600">Total Marks: {exam.total_marks}</p>

      <div className="mt-4">
        {/* Show loading spinner while fetching result */}
        {isLoadingResult ? (
          <span className="text-gray-400">Checking result...</span>
        ) : result ? (
          <div className="flex items-center">
            <span className="text-green-600 font-medium text-lg">
              Score: {result.total_score} / {exam.total_marks}
            </span>
          </div>
        ) : isLive ? (
          <Link
            to={`/student/exams/${exam._id}`}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Exam
          </Link>
        ) : (
          <span className="text-gray-400">Not yet open</span>
        )}
      </div>
    </div>
  );
};

export default ExamCard;