import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const QuestionBuilder: React.FC = () => {
  const { token } = useSelector((state: any) => state.auth);

  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [marks, setMarks] = useState(1);
  const [mcqOptions, setMcqOptions] = useState([{ text: "", isCorrect: false }]);

  // Load exams on mount
  useEffect(() => {
    axios.get("/api/exams", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setExams(res.data.exams))
      .catch(console.error);
  }, []);

  // Load subjects when exam is selected
  useEffect(() => {
    if (selectedExam) {
      axios.get(`/api/subjects/exam/${selectedExam}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSubjects(res.data.subjects))
        .catch(console.error);
    }
  }, [selectedExam]);

  // Load sections when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      axios.get(`/api/sections/exam/${selectedExam}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSections(res.data.sections))
        .catch(console.error);
    }
  }, [selectedSubject]);

  const handleAddQuestion = async () => {
    const payload: any = {
      section_id: selectedSection,
      question_text: questionText,
      type: questionType,
      marks
    };

    if (questionType === "MCQ") {
      payload.options = mcqOptions;
    }

    try {
      await axios.post("/api/questions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reset for next question
      setQuestionText("");
      setMcqOptions([{ text: "", isCorrect: false }]);
    } catch (err) {
      console.error("Error adding question", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-4">Add Question</h1>

      {/* Step 1: Exam selection */}
      <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
        className="block mb-4 p-2 border rounded w-full">
        <option value="">Select Exam</option>
        {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
      </select>

      {/* Step 2: Subject selection */}
      <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
        className="block mb-4 p-2 border rounded w-full" disabled={!selectedExam}>
        <option value="">Select Subject</option>
        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>

      {/* Step 3: Section selection */}
      <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
        className="block mb-4 p-2 border rounded w-full" disabled={!selectedSubject}>
        <option value="">Select Section</option>
        {sections.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
      </select>

      {/* Step 4: Question Form */}
      {selectedSection && (
        <div className="bg-white p-6 rounded shadow-md space-y-4">
          <textarea
            placeholder="Question Text"
            className="w-full border px-4 py-2 rounded"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          <select value={questionType} onChange={e => setQuestionType(e.target.value)}
            className="w-full border px-4 py-2 rounded">
            <option value="MCQ">MCQ</option>
            <option value="Numerical">Numerical</option>
          </select>

          <input
            type="number"
            value={marks}
            onChange={e => setMarks(Number(e.target.value))}
            className="w-full border px-4 py-2 rounded"
            placeholder="Marks"
          />

          {/* MCQ Options */}
          {questionType === "MCQ" && mcqOptions.map((opt, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Option text"
                value={opt.text}
                onChange={e => {
                  const updated = [...mcqOptions];
                  updated[i].text = e.target.value;
                  setMcqOptions(updated);
                }}
                className="flex-1 border px-2 py-1 rounded"
              />
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={e => {
                  const updated = [...mcqOptions];
                  updated[i].isCorrect = e.target.checked;
                  setMcqOptions(updated);
                }}
              />
              <button onClick={() => setMcqOptions(mcqOptions.filter((_, idx) => idx !== i))}
                className="text-red-500">🗑</button>
            </div>
          ))}
          {questionType === "MCQ" && (
            <button
              className="text-sm text-blue-500"
              onClick={() => setMcqOptions([...mcqOptions, { text: "", isCorrect: false }])}>
              + Add Option
            </button>
          )}

          <button
            onClick={handleAddQuestion}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Save & Add Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;
