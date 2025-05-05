const express = require("express")
const mongoose = require("mongoose");
const { Types } = mongoose;
const { ObjectId } = Types;
const User = require("../models/User")
const Exam = require("../models/Exam")
const Question = require("../models/Question");
const MCQOption = require("../models/MCQOptions");
const NumericalQuestion = require("../models/NumericalQuestion")
const Section = require("../models/Section")
const Course = require("../models/Course")
const Role = require("../models/Role")
const Subject = require("../models/Subject");

const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/dashboard", authMiddleware(["teacher"]), async (req, res) => {
    try {
        const teacherId = req.user.id; // ✅ Define teacherId first
        const teacherObjectId = new ObjectId(teacherId); // ✅ Then convert to ObjectId

        const totalCourse = await Course.countDocuments()
        const allCourse = await Course.find().select("name")

        const totalExam = await Exam.countDocuments()
        const allExam = await Exam.find().select("title")
        const recentExam = await Exam.find()
            .sort({createdAt: -1})
            .limit(5)
            .select("title date total_marks created_by")
            .populate("created_by", "first_name last_name")

        //const exams = await Exam.find().populate("assigned_students")

        const studentRole = await Role.findOne({ role_name: "student" });
          if (!studentRole) {
          return res.status(400).json({ message: "Student role not found" });
        }
        const assigned_students = await User.find({
          role_id: studentRole._id,
          teacher_id: teacherObjectId,
          status: "approved",
        })
        .select("first_name last_name email") // only needed fields
        .lean(); // return plain objects
      
        console.log("🧑‍🎓 Assigned Students:", assigned_students);
        console.log("🔍 Teacher ID:", teacherId);
        console.log("🔍 Teacher ID Type:", typeof teacherId);
        console.log("🔍 Teacher ID instanceof ObjectId:", teacherId instanceof mongoose.Types.ObjectId);

        res.json({
            totalCourse,
            allCourse,
            totalExam,
            allExam,
            assigned_students,
            recentExam,
        })
    } catch (error) {
        console.error("❌ Error fetching teacher dashboard stats:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
})

router.get("/approved", async (req, res) => {
    try {
      const teacherRole = await Role.findOne({ role_name: "teacher" });
      if (!teacherRole) {
        return res.status(400).json({ message: "Teacher role not found" });
      }
  
      const teachers = await User.find({
        role_id: teacherRole._id,
        status: "approved"
      }).select("first_name last_name _id");
  
      res.json({ teachers }); // 👈 Must wrap in { teachers: [...] }
  
    } catch (error) {
      console.error("Error fetching teachers:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  });

// ========================
// 🔹 Course Management Routes
// ========================

// ✅ Get All Courses
router.get("/courses", authMiddleware(["admin", "teacher"]), async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.json({ courses });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create New Course
router.post("/courses", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Course name is required" });
  }

  try {
    const newCourse = new Course({ name, description });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Course by ID
router.put("/courses/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(updatedCourse);
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete Course by ID
router.delete("/courses/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// 🔹 Subject Management Routes
// ========================

// ✅ Get All Subjects (with course name populated)
router.get("/subjects", authMiddleware(["admin", "teacher"]), async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("course_id", "name")
      .lean();

    res.json({ subjects });
  } catch (error) {
    console.error("❌ Error fetching subjects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create New Subject
router.post("/subjects", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { name, course_id } = req.body;

  if (!name || !course_id) {
    return res.status(400).json({ message: "Name and course ID are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(course_id)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const newSubject = new Subject({ name, course_id });
    await newSubject.save();
    const subjectObject = newSubject.toObject();
    res.status(201).json(subjectObject);

  } catch (error) {
    console.error("❌ Error creating subject:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Subject by ID
router.put("/subjects/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;
  const { name, course_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid subject ID" });
  }

  if (!name || !course_id) {
    return res.status(400).json({ message: "Name and course ID are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(course_id)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { name, course_id },
      { new: true, runValidators: true }
    ).populate("course_id", "name");

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(updatedSubject);
  } catch (error) {
    console.error("❌ Error updating subject:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete Subject by ID
router.delete("/subjects/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid subject ID" });
  }

  try {
    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting subject:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/exams", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { title, description, date, duration, total_marks, course_id } = req.body;

  if (!title || !date || !duration || !total_marks || !course_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let session;
  try {
    // Start session for transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Step 1: Create Exam
    const newExam = new Exam({
      title,
      description,
      date,
      duration,
      total_marks,
      course_id,
      created_by: req.user.id,
    });
    await newExam.save({ session });

    // Step 2: Fetch subjects linked to the course
    const subjects = await Subject.find({ course_id }).select("_id").lean().session(session);

    if (!subjects.length) {
      throw new Error("No subjects found for the given course");
    }

    // Step 3: For each subject, create default sections
    const sectionTitles = ["MCQs", "Numericals"];
    const sectionPromises = subjects.flatMap(subject =>
      sectionTitles.map(title =>
        new Section({
          title,
          subject_id: subject._id,
          exam_id: newExam._id,
        }).save({ session })
      )
    );

    const sections = await Promise.all(sectionPromises);

    // Step 4: Link section IDs back to exam
    newExam.sections = sections.map((section) => section._id);
    await newExam.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return fully populated exam
    const fullExam = await Exam.findById(newExam._id)
      .populate("sections", "title")
      .lean();

    res.status(201).json(fullExam);
  } catch (error) {
    console.error("❌ Error creating exam:", error);

    // Safely abort transaction
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) session.endSession();

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all exams with sections
router.post("/exams", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { title, description, date, duration, total_marks, course_id } = req.body;

  if (!title || !date || !duration || !total_marks || !course_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate date format
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const newExam = new Exam({
      title,
      description,
      date: parsedDate,
      duration,
      total_marks,
      course_id,
      created_by: req.user.id,
    });

    await newExam.save({ session });

    // ... rest of the route remains the same ...
  } catch (error) {
    console.error("❌ Error creating exam:", error);
    if (session && session.inTransaction()) await session.abortTransaction();
    if (session) session.endSession();
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/exams", authMiddleware(["admin", "teacher"]), async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("created_by", "first_name last_name")
      .populate("course_id", "name")
      .populate("sections", "title")
      .lean();

    res.json({ exams });
  } catch (error) {
    console.error("❌ Error fetching exams:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single exam by ID
router.get("/exams/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
    const exam = await Exam.findById(id)
      .populate("created_by", "first_name last_name")
      .populate("course_id", "name")
      .populate("sections", "title")
      .lean();

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json(exam);
  } catch (error) {
    console.error("❌ Error fetching exam:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update exam
router.put("/exams/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;
  const { title, description, date, duration, total_marks, course_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  // Validate date if provided
  let parsedDate = undefined;
  if (date) {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
  }

  try {
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { title, description, date: parsedDate, duration, total_marks, course_id },
      { new: true, runValidators: true }
    ).populate("sections", "title");

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json(updatedExam.toObject());
  } catch (error) {
    console.error("❌ Error updating exam:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete exam and its sections
router.delete("/exams/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const deletedExam = await Exam.findByIdAndDelete(id).session(session);

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Also delete associated sections
    await Section.deleteMany({ exam_id: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Exam and related sections deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting exam:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//Questions CRUD
router.post("/questions", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { section_id, question_text, question_img, type, marks } = req.body;

  if (!section_id || !question_text || !type || !marks) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Create base question
    const newQuestion = new Question({
      section_id,
      question_text,
      question_img,
      type,
      marks,
    });

    await newQuestion.save({ session });

    // Step 2: Handle type-specific data
    if (type === "MCQ") {
      const options = req.body.options || [];

      if (!Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ message: "Options are required for MCQs" });
      }

      const mcqOptions = options.map((option) =>
        new MCQOption({
          question_id: newQuestion._id,
          option_text: option.text,
          is_correct: option.isCorrect,
          option_img: option.img,
        })
      );

      await MCQOption.insertMany(mcqOptions, { session });
    } else if (type === "Numerical") {
      const { answer_value } = req.body;

      if (typeof answer_value !== "number") {
        return res.status(400).json({ message: "Answer value is required for Numerical type and must be a number" });
      }

      await new NumericalQuestion({
        question_id: newQuestion._id,
        answer_value,
      }).save({ session });
    }

    // Step 3: Update the section with the new question's _id
    await Section.findByIdAndUpdate(
      section_id,
      { $push: { questions: newQuestion._id } },
      { session, new: true }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Step 4: Populate response based on type
    let query = Question.findById(newQuestion._id);

    if (type === "MCQ") {
      query = query.populate("MCQOptions", "option_text is_correct option_img");
    } else if (type === "Numerical") {
      query = query.populate("NumericalAnswer", "answer_value");
    }

    const fullQuestion = await query.lean();

    res.status(201).json(fullQuestion);
  } catch (error) {
    console.error("❌ Error creating question:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ Get single question with options or numerical info
router.get("/questions/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const question = await Question.findById(id)
      .populate("section_id", "title")
      .lean();

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Load type-specific data
    if (question.type === "MCQ") {
      const options = await MCQOption.find({ question_id: id }).lean();
      question.options = options;
    } else if (question.type === "Numerical") {
      const numericalData = await NumericalQuestion.findOne({ question_id: id }).lean();
      question.numericalData = numericalData;
    }

    res.json(question);
  } catch (error) {
    console.error("❌ Error fetching question:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update question + type-specific data
router.put("/questions/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;
  const { question_text, question_img, marks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { question_text, question_img, marks },
      { new: true, runValidators: true }
    ).lean();

    // If it's an MCQ, update options
    if (updatedQuestion.type === "MCQ" && Array.isArray(req.body.options)) {
      await MCQOption.deleteMany({ question_id: id });
      const options = req.body.options.map((opt) =>
        new MCQOption({
          question_id: id,
          option_text: opt.text,
          is_correct: opt.isCorrect,
          option_img: opt.img,
        })
      );
      await MCQOption.insertMany(options);
    }

    // If it's a numerical question, update numerical data
    if (updatedQuestion.type === "Numerical" && req.body.numericalData) {
      await NumericalQuestion.findOneAndUpdate(
        { question_id: id },
        req.body.numericalData,
        { upsert: true }
      );
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error("❌ Error updating question:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete question and related data
router.delete("/questions/:id", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const deletedQuestion = await Question.findByIdAndDelete(id).session(session);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete related data
    if (deletedQuestion.type === "MCQ") {
      await MCQOption.deleteMany({ question_id: id }).session(session);
    } else if (deletedQuestion.type === "Numerical") {
      await NumericalQuestion.findOneAndDelete({ question_id: id }).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error deleting question:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Sections
router.get("/sections", authMiddleware(["admin", "teacher"]), async (req, res) => {
  try {
    const sections = await Section.find()
      .populate("exam_id", "title")
      .lean();

    res.json({ sections });
  } catch (error) {
    console.error("❌ Error fetching sections:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/sections", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { exam_id, title, description } = req.body;

  if (!exam_id || !title || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create a new section
    const newSection = new Section({
      exam_id,
      title,
      description,
    });

    // Save the new section
    await newSection.save();

    // Update the Exam document to add the new section's _id to the sections array
    await Exam.findByIdAndUpdate(exam_id, { $push: { sections: newSection._id } }, { new: true });

    res.status(201).json({ section: newSection });
  } catch (error) {
    console.error("❌ Error creating section:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Get Sections by Exam ID
router.get("/sections/subject/:subjectId", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { subjectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject ID" });
  }

  try {
    const sections = await Section.find({ subject_id: subjectId }).lean();
    res.json({ sections });
  } catch (error) {
    console.error("❌ Error fetching sections by subject:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Subjects by Exam ID
router.get("/subjects/exam/:examId", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { examId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(examId)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
    // Step 1: Get exam by ID and populate course using correct field name
    const exam = await Exam.findById(examId).populate("course_id", "name _id");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!exam.course_id) {
      return res.status(404).json({ message: "No course linked to this exam" });
    }

    // Step 2: Fetch subjects linked to the course
    const subjects = await Subject.find({ course_id: exam.course_id._id }).lean();

    // Optional: Send back course info too
    res.json({
      subjects,
      course: exam.course_id.name,
    });
  } catch (error) {
    console.error("❌ Error fetching subjects via course:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/exams/:examId/questions", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { examId } = req.params;
  const { section_id, question_text, marks, type, options, correctAnswer, answer } = req.body;

  if (!section_id || !question_text || !marks || !type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Step 1: Validate section belongs to this exam
    const section = await Section.findOne({ _id: section_id, exam_id: examId });
    if (!section) {
      return res.status(400).json({ message: "Invalid section or doesn't belong to this exam" });
    }

    // Step 2: Save base question
    const newQuestion = new Question({
      section_id,
      question_text,
      marks,
      type
    });

    await newQuestion.save();

    // Step 3: Handle extended data based on question type
    if (type === "MCQ") {
      const mcqOptions = options.map((text, index) => ({
        question_id: newQuestion._id,
        option_text: text,
        is_correct: index === correctAnswer,
      }));
      await MCQOption.insertMany(mcqOptions);
    } else if (type === "Numerical") {
      await new NumericalQuestion({
        question_id: newQuestion._id,
        answer_value: parseFloat(answer),
      }).save();
    }

    // Step 4: Push question ID into section's questions array
    await Section.findByIdAndUpdate(
      section_id,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    res.status(201).json({ message: "Question saved successfully", questionId: newQuestion._id });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/exams/:examId/subjects", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { examId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(examId)) {
    return res.status(400).json({ message: "Invalid exam ID" });
  }

  try {
    const exam = await Exam.findById(examId)
      .populate({
        path: "subjects",
        populate: {
          path: "sections",
          model: "Section",
          populate: {
            path: "questions",
            model: "Question"
          }
        }
      })
      .lean();

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ subjects: exam.subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/questions/section/:sectionId", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { sectionId } = req.params;

  try {
    const questions = await Question.find({ section_id: sectionId })
      .lean();

    res.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/mcq-options/question/:questionId", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { questionId } = req.params;

  try {
    const options = await MCQOption.find({ question_id: questionId }).lean();
    res.json({ options });
  } catch (error) {
    console.error("❌ Error fetching MCQ options:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/numerical-question/question/:questionId", authMiddleware(["admin", "teacher"]), async (req, res) => {
  const { questionId } = req.params;

  try {
    const data = await NumericalQuestion.findOne({ question_id: questionId }).lean();
    if (!data) {
      return res.status(404).json({ message: "No numerical data found" });
    }
    res.json({ numericalData: data });
  } catch (error) {
    console.error("❌ Error fetching numerical question:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router