import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

// Define types
interface AuthState {
  auth: {
    token: string;
    id: string;
    role: string;
  };
}

interface SubjectOption {
  _id: string;
  name: string;
}

interface SectionOption {
  _id: string;
  title: string;
}

interface OptionType {
  _id: string;
  option_text: string;
  is_correct: boolean;
  option_img?: string;
}

interface NumericalDataType {
  answer_value: number;
  tolerance?: number;
}

interface QuestionType {
  _id: string;
  question_text: string;
  marks: number;
  type: "MCQ" | "Numerical";
  options?: OptionType[];
  numericalData?: NumericalDataType;
}

const AddQuestionPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { token } = useSelector((state: AuthState) => state.auth);

  const [questionType, setQuestionType] = useState<"mcq" | "numerical">("mcq");
  const [questionText, setQuestionText] = useState<string>("");
  const [marks, setMarks] = useState<number>(1);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [numericalAnswer, setNumericalAnswer] = useState<string>("");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Handle option change
  const handleOptionChange = (index: number, value: string): void => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Submit handler
  const handleSubmit = async (): Promise<void> => {
    if (!selectedSection || !questionText || !marks) {
      setMessage("Please select a section and fill all required fields.");
      return;
    }

    const payload =
      questionType === "mcq"
        ? {
            type: "MCQ",
            question_text: questionText,
            marks,
            options: options.map((text, index) => ({
              text,
              isCorrect: index === parseInt(correctAnswer),
              img: null,
            })),
          }
        : {
            type: "Numerical",
            question_text: questionText,
            marks,
            answer_value: parseFloat(numericalAnswer),
          };

    try {
      await axios.post(
        `http://localhost:5000/api/teacher/questions`,
        {
          ...payload,
          section_id: selectedSection,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form
      setQuestionText("");
      setMarks(1);
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setNumericalAnswer("");
      setMessage("Question added successfully.");

      fetchQuestions(selectedSection); // Refresh question list
    } catch (error: any) {
      console.error("Error submitting question:", error.response?.data || error.message);
      setMessage("Failed to save question.");
    }
  };

  // Fetch subjects for the exam
  useEffect(() => {
    const fetchSubjects = async (): Promise<void> => {
      try {
        const res = await axios.get<{ subjects: SubjectOption[] }>(
          `http://localhost:5000/api/teacher/subjects/exam/${examId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubjects(res.data.subjects || []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [examId, token]);

  // Fetch sections when subject changes
  useEffect(() => {
    if (!selectedSubject) return;

    const fetchSections = async (): Promise<void> => {
      try {
        const res = await axios.get<{ sections: SectionOption[] }>(
          `http://localhost:5000/api/teacher/sections/subject/${selectedSubject}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSections(res.data.sections || []);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
        setSections([]);
      }
    };

    fetchSections();
  }, [selectedSubject, token]);

  // Fetch questions function
  const fetchQuestions = async (sectionId: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await axios.get<{ questions: QuestionType[] }>(
        `http://localhost:5000/api/teacher/questions/section/${sectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get detailed info for each question
      const detailedQuestions = await Promise.all(
        res.data.questions.map(async (q) => {
          if (q.type === "MCQ") {
            const optRes = await axios.get<{ options: OptionType[] }>(
              `http://localhost:5000/api/teacher/mcq-options/question/${q._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return { ...q, options: optRes.data.options };
          } else if (q.type === "Numerical") {
            const numRes = await axios.get<{ numericalData: NumericalDataType }>(
              `http://localhost:5000/api/teacher/numerical-question/question/${q._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return { ...q, numericalData: numRes.data.numericalData };
          }
          return q;
        })
      );

      setQuestions(detailedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions when section changes
  useEffect(() => {
    if (!selectedSection) return;
    fetchQuestions(selectedSection);
  }, [selectedSection, token]);

  // Delete question
  const handleDelete = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/teacher/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions(questions.filter((q) => q._id !== questionId));
      setMessage("Question deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting question:", error.response?.data || error.message);
      setMessage("Failed to delete question.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Questions</h1>
        <Link
          to="/teacher/exams"
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          ← Back to Exams
        </Link>
      </div>

      <div className="bg-white p-6 rounded shadow-md space-y-4 text-black">
        {message && (
          <div className="text-sm text-blue-600 font-medium">{message}</div>
        )}

        {/* Subject Selection */}
        <div>
          <label className="block mb-1 font-semibold">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedSection(""); // Clear section when changing subject
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Choose a subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Section Selection */}
        <div>
          <label className="block mb-1 font-semibold">Select Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={!selectedSubject}
          >
            <option value="">Choose a section</option>
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        {/* Question Form */}
        {selectedSection && (
          <>
            <hr className="border-gray-300 my-4" />
            <h2 className="text-lg font-semibold mb-4">Add New Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) =>
                    setQuestionType(e.target.value as "mcq" | "numerical")
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="mcq">MCQ</option>
                  <option value="numerical">Numerical</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Question Text</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter the question text"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Marks</label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter marks for this question"
                />
              </div>

              {/* MCQ Options */}
              {questionType === "mcq" && (
                <>
                  {options.map((opt, index) => (
                    <div key={index}>
                      <label className="block mb-1 font-semibold">
                        Option {index + 1}
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block mb-1 font-semibold">Correct Answer</label>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="">Select correct option</option>
                      {options.map((_, index) => (
                        <option key={index} value={index.toString()}>
                          Option {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Numerical Answer */}
              {questionType === "numerical" && (
                <div>
                  <label className="block mb-1 font-semibold">Correct Answer</label>
                  <input
                    type="number"
                    value={numericalAnswer}
                    onChange={(e) => setNumericalAnswer(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Enter the numerical answer"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
                disabled={!selectedSection}
              >
                Save and Add Next
              </button>
            </div>
          </>
        )}

        {/* Question List with Answers */}
        {selectedSection && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Existing Questions</h2>
            {loading ? (
              <p>Loading questions...</p>
            ) : questions.length === 0 ? (
              <p>No questions found in this section.</p>
            ) : (
              <ul className="space-y-6">
                {questions.map((q) => (
                  <li key={q._id} className="border p-5 rounded bg-gray-50 relative">
                    <div className="flex justify-between items-start">
                      <strong className="text-gray-800">{q.question_text}</strong>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {q.type} ({q.marks} marks)
                      </span>
                    </div>

                    {/* MCQ Display */}
                    {q.type === "MCQ" && q.options && (
                      <div className="mt-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span>{opt.option_text}</span>
                            {opt.is_correct && (
                              <span className="text-green-600 font-semibold">(Correct)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Numerical Display */}
                    {q.type === "Numerical" && q.numericalData && (
                      <div className="mt-2 text-gray-600">
                        Correct Answer: <strong>{q.numericalData.answer_value}</strong>
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="absolute top-12 right-5 text-red-500 text-sm hover:text-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuestionPage;