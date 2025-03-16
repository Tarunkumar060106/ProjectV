const express = require("express")
const User = require("../models/User")
const Exam = require("../models/Exam")
const Course = require("../models/Course")

const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/dashboard", authMiddleware(["teacher"]), async (req, res) => {
    try {

        const totalCourse = await Course.countDocuments()
        const allCourse = await Course.find().select("name")

        const totalExam = await Exam.countDocuments()
        const allExam = await Exam.find().select("title")
        const recentExam = await Exam.find()
            .sort({createdAt: -1})
            .limit(5)
            .select("title date total_marks created_by")
            .populate("created_by", "first_name last_name")

        const exams = await Exam.find().populate("assigned_students")
        const assigned_students = exams.reduce((acc, exam) => acc + exam.assigned_students.length, 0)

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

module.exports = router