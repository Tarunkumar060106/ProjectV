const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const User = require("../models/User");
const Exam = require("../models/Exam")
const Course = require("../models/Course")

const router = express.Router();

// 🟢 Get All Pending Users (Students & Teachers)
router.get("/pending-users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: "pending" }).populate("role_id", "role_name");
        res.json({ users: pendingUsers });
    } catch (error) {
        console.error("❌ Error fetching pending users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Approve a User (Student or Teacher)
router.put("/approve-user/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("role_id", "role_name");
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.status !== "pending") {
            return res.status(400).json({ message: `User is already ${user.status}` });
        }

        user.status = "approved";
        await user.save();

        res.json({
            message: `${user.role_id.role_name} approved successfully.`,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role_id.role_name,
                status: user.status
            }
        });
    } catch (error) {
        console.error("❌ Error approving user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Reject a User (Student or Teacher)
router.put("/reject-user/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("role_id", "role_name");
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.status !== "pending") {
            return res.status(400).json({ message: `User is already ${user.status}` });
        }

        user.status = "rejected";
        await user.save();

        res.json({
            message: `${user.role_id.role_name} rejected successfully.`,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role_id.role_name,
                status: user.status
            }
        });
    } catch (error) {
        console.error("❌ Error rejecting user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Get All Approved Users (For Admin)
router.get("/approved-users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const approvedUsers = await User.find({ status: "approved" }).populate("role_id", "role_name");
        res.json({ users: approvedUsers });
    } catch (error) {
        console.error("❌ Error fetching approved users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/dashboard", authMiddleware(["admin"]), async (req, res) => {
    try {
        const users = await User.find().populate("role_id", "role_name").exec();

        const totalStudents = users.filter(user => user.role_id.role_name === "student").length
        const totalTeachers =  users.filter(user => user.role_id.role_name === "teacher").length
        const totalAdmins =  users.filter(user => user.role_id.role_name === "admin").length

        // const totalCourses = await Course.countDocuments()
        // const totalExams = await Exam.countDocuments()

        const pendingUsers = await User.find({ status: "pending"}).populate("role_id", "role_name")

        res.json({
            totalUsers: totalStudents + totalTeachers + totalAdmins,
            totalStudents,
            totalTeachers,
            totalAdmins,
            // totalCourses,
            // totalExams,
            pendingUsers

        })

    } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error)
        res.status(500).json({ message: "Server error", error: error.message})
    }
})

module.exports = router;
