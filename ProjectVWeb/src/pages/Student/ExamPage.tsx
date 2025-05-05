import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface Question {
  _id: string;
  question_text: string;
  type: "MCQ" | "Numerical";
  marks: number;
  options?: Array<{ _id: string; option_text: string; is_correct?: boolean }>;
  answer_value?: number;
}

interface Answer {
  questionId: string;
  selectedOption?: string;
  numericalAnswer?: number;
}

const ExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>("");

  // Load exam details and questions
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Fetch exam details
        const examRes = await axios.get(
          `http://localhost:5000/api/student/exams/${examId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const exam = examRes.data.exam;
        if (!exam) throw new Error("Exam not found");

        setExamTitle(exam.title || "Exam");
        setTimeRemaining(exam.duration * 60); // Convert minutes to seconds

        // Fetch questions
        const questionsRes = await axios.get(
          `http://localhost:5000/api/student/exams/${examId}/questions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setQuestions(questionsRes.data.questions || []);
      } catch (err) {
        console.error("Failed to load exam:", err);
        setError("Failed to load exam data.");
      } finally {
        setLoading(false);
      }
    };

    if (token && examId) {
      fetchExamData();
    }
  }, [token, examId]);

  // Countdown timer logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (questionId: string, value: string | number) => {
    const existingAnswerIndex = answers.findIndex((a) => a.questionId === questionId);

    if (existingAnswerIndex > -1) {
      const updatedAnswers = [...answers];
      if (typeof value === "string") {
        updatedAnswers[existingAnswerIndex].selectedOption = value;
      } else {
        updatedAnswers[existingAnswerIndex].numericalAnswer = value;
      }
      setAnswers(updatedAnswers);
    } else {
      setAnswers([ 
        ...answers, 
        typeof value === "string" 
          ? { questionId, selectedOption: value } 
          : { questionId, numericalAnswer: value }
      ]);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/student/exams/${examId}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        navigate(`/student/exam/${examId}/result`);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Failed to submit exam. Please try again.");
      } else {
        setError("Network error. Please check your internet connection and try again.");
      }
    }
  }, [answers, examId, token, navigate]);

  if (loading) return <div>Loading exam...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center">{error}</div>
    );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{examTitle}</h1>
        <div className="text-xl font-mono bg-red-100 text-red-600 px-4 py-2 rounded">
          ⏰ {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-black">
        <h2 className="text-xl font-semibold mb-4">
          Q{currentQuestionIndex + 1}: {currentQuestion?.question_text}
        </h2>

        {currentQuestion?.type === "MCQ" && (
          <div className="space-y-3">
            {currentQuestion.options?.map((opt) => (
              <div key={opt._id} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${opt._id}`}
                  name={`q-${currentQuestion._id}`}
                  value={opt._id}
                  checked={answers.find((a) => a.questionId === currentQuestion._id)?.selectedOption === opt._id}
                  onChange={() => handleSelectAnswer(currentQuestion._id, opt._id)}
                  className="mr-2 h-5 w-5"
                />
                <label htmlFor={`option-${opt._id}`} className="text-gray-700">
                  {opt.option_text}
                </label>
              </div>
            ))}
          </div>
        )}

        {currentQuestion?.type === "Numerical" && (
          <div>
            <input
              type="number"
              placeholder="Enter your answer"
              step="any"
              onChange={(e) => handleSelectAnswer(currentQuestion._id, parseFloat(e.target.value))}
              className="border px-4 py-2 rounded w-full"
              defaultValue={answers.find((a) => a.questionId === currentQuestion._id)?.numericalAnswer}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPrev}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded ${currentQuestionIndex === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          Previous
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit Exam
          </button>
        ) : (
          <button
            onClick={goToNext}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
