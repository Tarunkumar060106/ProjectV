// src/pages/student/ExamRulesPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExamRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();

  const handleStartExam = () => {
    navigate(`/student/exam/${examId}/start`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exam Instructions</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Read all instructions carefully.</li>
          <li>You cannot go back once you start the exam.</li>
          <li>Each question has only one correct answer.</li>
          <li>No negative marking in this exam.</li>
          <li>Do not refresh or close the browser during the test.</li>
          <li>Click on “Next” to move forward.</li>
        </ul>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleStartExam}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamRulesPage;