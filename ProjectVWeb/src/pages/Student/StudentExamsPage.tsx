import React, { useEffect, useState } from "react";
import axios from "axios";
import ExamCard from "../../components/ExamCard";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";

interface Exam {
  _id: string;
  title: string;
  date: string;
  duration: number;
  total_marks: number;
  course_id: {
    _id: string;
    name: string;
  };
  created_by: {
    first_name: string;
    last_name: string;
  };
  canAttempt?: boolean;
}

interface Result {
  exam_id: string;
  score: number;
}

const StudentExamsPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Record<string, { score: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Fetch upcoming exams
        const examRes = await axios.get("http://localhost:5000/api/student/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Calculate canAttempt status based on date
        const fetchedExams = examRes.data.exams.map((e: any) => ({
          ...e,
          canAttempt: new Date(e.date) <= new Date(),  // Exam can be attempted if the current date is greater than or equal to the exam date
        }));

        setExams(fetchedExams);

        // Fetch results for exams
        const examIds = fetchedExams.map((e: Exam) => e._id);
        if (examIds.length > 0) {
          const resultRes = await axios.post(
            "http://localhost:5000/api/student/results",
            { examIds },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Map the results by exam_id
          const resultMap = resultRes.data.results.reduce(
            (acc: Record<string, { score: number }>, r: Result) => {
              acc[r.exam_id] = { score: r.score };
              return acc;
            },
            {}
          );

          setResults(resultMap);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load exams:", err);
        setError(err?.response?.data?.message || "Failed to load exams.");
        setLoading(false);
      }
    };

    if (token) {
      fetchExams();
    } else {
      navigate("/login"); // Redirect if not logged in
    }
  }, [token, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length === 0 ? (
          <p>No exams found.</p>
        ) : (
          exams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={{
                ...exam,
                canAttempt: exam.canAttempt,
                course_id: {
                  ...exam.course_id,
                  _id: exam.course_id._id || "",
                },
                result: results[exam._id] ? { total_score: results[exam._id].score } : undefined,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StudentExamsPage;
