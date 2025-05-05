const express = require("express");
const mongoose = require("mongoose");
const { Types } = mongoose;
const { ObjectId } = Types;

const router = express.Router();

// Models
const User = require("../models/User");
const Exam = require("../models/Exam");
const Course = require("../models/Course");
const Question = require("../models/Question");
const MCQOption = require("../models/MCQOptions");
const NumericalQuestion = require("../models/NumericalQuestion");
const Section = require("../models/Section");
const UserAttempt = require("../models/UserAttempt"); // Replaces Result
const authMiddleware = require("../middleware/authMiddleware");

// Middleware: Ensure only students can access these routes
const studentAuth = authMiddleware(["student"]);

// ========================
// 📋 Student Dashboard
// ========================

// 🔹 GET - Student Dashboard Overview
router.get("/dashboard", studentAuth, async (req, res) => {
    try {
        const studentId = req.user.id;

        // Find student's teacher
        const student = await User.findById(studentId).select("teacher_id").lean();
        if (!student || !student.teacher_id) {
            return res.status(404).json({ message: "Teacher not assigned" });
        }

        const now = new Date();

        // Fetch upcoming exams from assigned teacher
        const exams = await Exam.find({
            created_by: student.teacher_id,
            date: { $gte: now }
        })
        .populate("course_id", "name")
        .sort({ date: 1 })
        .limit(5)
        .lean();

        // Optionally fetch enrolled courses (you can refine this logic as needed)
        const courses = await Course.find()
            .where('_id')
            .in(exams.map(e => e.course_id._id))
            .distinct('_id')
            .lean();

        res.json({ exams, courses });
    } catch (error) {
        console.error("❌ Error fetching student dashboard:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ========================
// 📝 Exam Management
// ========================

// 🔹 GET - All Exams from Teacher
router.get("/exams", studentAuth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId).select("teacher_id").lean();
        if (!student || !student.teacher_id) {
            return res.status(404).json({ message: "Teacher not assigned" });
        }

        const exams = await Exam.find({ created_by: student.teacher_id })
            .populate("course_id", "name")
            .populate("created_by", "first_name last_name")
            .lean();

        res.json({ exams });
    } catch (error) {
        console.error("❌ Error fetching all exams:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 GET - Single Exam Details
router.get("/exams/:examId", studentAuth, async (req, res) => {
    const { examId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({ message: "Invalid exam ID" });
    }

    try {
        const exam = await Exam.findById(examId)
            .populate("course_id", "name")  // Populating course name
            .populate("sections")          // Populating sections with all section details
            .lean();

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const now = new Date();
        const canAttempt = now >= new Date(exam.date);

        res.json({ exam, canAttempt });
    } catch (error) {
        console.error("❌ Error fetching exam details:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 GET - Get Questions for Exam
router.get("/exams/:examId/questions", studentAuth, async (req, res) => {
  const { examId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
      // Step 1: Fetch exam and its sections
      const exam = await Exam.findById(examId)
          .populate({
              path: "sections",
              populate: {
                  path: "questions", // make sure your Section model has questions: [{ type: ObjectId, ref: "Question" }]
              }
          })
          .lean();

      if (!exam) {
          return res.status(404).json({ message: "Exam not found" });
      }

      // Step 2: Flatten questions
      const allQuestions = exam.sections.flatMap(section => section.questions || []);

      // Step 3: Enrich MCQ/Numerical
      const enrichedQuestions = await Promise.all(
          allQuestions.map(async (q) => {
              if (q.type === "MCQ") {
                  q.options = await MCQOption.find({ question_id: q._id }).lean();
              } else if (q.type === "Numerical") {
                  const numData = await NumericalQuestion.findOne({ question_id: q._id }).lean();
                  q.answer_value = numData?.answer_value;
              }
              return q;
          })
      );

      res.json({ questions: enrichedQuestions });
  } catch (error) {
      console.error("❌ Error fetching exam questions:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// POST /api/student/exams/:examId/submit
router.post("/exams/:examId/submit", studentAuth, async (req, res) => {
  const { examId } = req.params;
  const { answers } = req.body;

  // Validate examId
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
    let score = 0;
    const formattedAnswers = [];

    // Grade answers and build formattedAnswers array
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId).lean();
      if (!question) continue;

      let isCorrect = false;

      // Grade MCQ questions
      if (question.type === "MCQ") {
        const correctOption = await MCQOption.findOne({
          question_id: ans.questionId,
          is_correct: true
        });

        // Check if selected option matches the correct option
        isCorrect = correctOption && correctOption._id.toString() === ans.selectedOption?.toString();

        // Add marks if the answer is correct
        if (isCorrect) score += question.marks;

        // Push the answer to the formattedAnswers array
        formattedAnswers.push({
          question_id: ans.questionId,
          selected_option: ans.selectedOption
        });
      }
      
      // Grade Numerical questions
      else if (question.type === "Numerical") {
        const numericalData = await NumericalQuestion.findOne({
          question_id: ans.questionId
        });

        // Use a small tolerance for numerical comparison
        const tolerance = 0.0001;
        isCorrect = numericalData && Math.abs(numericalData.answer_value - parseFloat(ans.numericalAnswer)) < tolerance;

        // Add marks if the answer is correct
        if (isCorrect) score += question.marks;

        // Push the numerical answer to the formattedAnswers array
        formattedAnswers.push({
          question_id: ans.questionId,
          numerical_answer: ans.numericalAnswer ? parseFloat(ans.numericalAnswer) : null
        });
      }
    }

    // Find existing attempt
    const existingAttempt = await UserAttempt.findOne({
      student_id: req.user.id,
      exam_id: examId
    });

    let timeSpentSeconds = 0;

    // Calculate time spent if the attempt exists
    if (existingAttempt && existingAttempt.started_at) {
      const start = new Date(existingAttempt.started_at);
      const end = new Date();

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        timeSpentSeconds = Math.floor((end - start) / 1000); // Calculate time in seconds
      } else {
        console.warn("Invalid date format for time spent calculation");
      }
    } else {
      console.log("No previous attempt found. Using default started_at.");
    }

    // Update existing attempt if it exists
    if (existingAttempt) {
      existingAttempt.answers = formattedAnswers;
      existingAttempt.total_score = score;
      existingAttempt.status = "submitted";
      existingAttempt.finished_at = new Date();
      existingAttempt.time_spent_seconds = timeSpentSeconds;
      existingAttempt.auto_graded = true;

      await existingAttempt.save();

      return res.json({ message: "Exam submitted successfully", score });
    }

    // Create new attempt if none exists
    const now = new Date();

    const newAttempt = new UserAttempt({
      student_id: req.user.id,
      exam_id: examId,
      answers: formattedAnswers,
      total_score: score,
      status: "submitted",
      started_at: now,
      finished_at: now,
      time_spent_seconds: 0, // Default value for time spent
      auto_graded: true
    });

    await newAttempt.save();

    return res.json({ message: "Exam submitted successfully", score });
  } catch (error) {
    console.error("❌ Error submitting exam:", error.stack || error.message);
    return res.status(500).json({ message: "Server error" });
  }
});


// 🔹 GET - View Exam Score / Attempt
router.get("/results/:examId", studentAuth, async (req, res) => {
    const { examId } = req.params;

    try {
        const result = await UserAttempt.findOne({
            student_id: req.user.id,
            exam_id: examId
        }).lean();

        if (!result) {
            return res.status(404).json({ message: "No attempt found" });
        }

        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching result:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 POST - Bulk Fetch Results for Dashboard
router.post("/results", studentAuth, async (req, res) => {
    const { examIds } = req.body;

    try {
        const results = await UserAttempt.find({
            student_id: req.user.id,
            exam_id: { $in: examIds }
        }).lean();

        const resultsMap = results.reduce((acc, r) => {
            acc[r.exam_id] = { score: r.total_score };
            return acc;
        }, {});

        res.json({ results });
    } catch (error) {
        console.error("❌ Error fetching bulk results:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/courses", studentAuth, async (req, res) => {
    try {
      const studentId = req.user.id;
  
      // Find student's teacher
      const student = await User.findById(studentId).select("teacher_id").lean();
      if (!student || !student.teacher_id) {
        return res.status(404).json({ message: "Teacher not assigned" });
      }
  
      // Fetch all exams from the assigned teacher
      const exams = await Exam.find({
        created_by: student.teacher_id,
      })
      .populate("course_id", "name description")
      .lean();
  
      // Extract unique courses
      const courseMap = new Map();
      exams.forEach(exam => {
        const course = exam.course_id;
        if (course && !courseMap.has(course._id.toString())) {
          courseMap.set(course._id.toString(), course);
        }
      });
  
      const courses = Array.from(courseMap.values());
  
      res.json({ courses });
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // 🔹 GET - Start an Exam (Initializes UserAttempt with started_at)
router.get("/exams/:examId/start", studentAuth, async (req, res) => {
  const { examId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(examId)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let attempt = await UserAttempt.findOne({
      student_id: req.user.id,
      exam_id: examId
    });

    if (!attempt) {
      attempt = new UserAttempt({
        student_id: req.user.id,
        exam_id: examId,
        started_at: new Date()
      });
      await attempt.save();
    }

    res.json({
      message: "Exam started",
      attempt_id: attempt._id,
      started_at: attempt.started_at
    });
  } catch (error) {
    console.error("❌ Error starting exam:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Export router
module.exports = router;