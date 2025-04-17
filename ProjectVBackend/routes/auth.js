const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");
const Blacklist = require("../models/Blacklist");
require("dotenv").config();

const Router = express.Router();

// ✅ Reusable function to register a user
const registerUser = async (req, res, role_name) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { first_name, middle_name, last_name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const role = await Role.findOne({ role_name });
        if (!role) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            first_name,
            middle_name,
            last_name,
            email,
            password: hashedPassword,
            role_id: role._id,
            status: role_name === "teacher" ? "pending" : "approved"
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully. Awaiting approval." });

    } catch (error) {
        console.error("❌ Error in Registration:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 🟢 Student Registration
Router.post(
    "/register/student",
    [
      body("first_name", "First Name is required").not().isEmpty(),
      body("last_name", "Last Name is required").not().isEmpty(),
      body("email", "Email is required").isEmail(),
      body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
      body("teacher_id", "Teacher ID is required").not().isEmpty(),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const { first_name, last_name, email, password, teacher_id } = req.body;
  
        // Check if student already exists
        let student = await User.findOne({ email });
        if (student) {
          return res.status(400).json({ message: "Student already exists" });
        }
  
        // Check if the teacher exists
        const teacher = await User.findById(teacher_id);
        if (!teacher || teacher.role_id.toString() !== (await Role.findOne({ name: "teacher" }))._id.toString()) {
          return res.status(400).json({ message: "Invalid teacher ID" });
        }
  
        // Find the student role
        const role = await Role.findOne({ name: "student" });
        if (!role) {
          return res.status(400).json({ message: "Student role not found" });
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create the student
        student = new User({
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role_id: role._id,
          teacher_id: teacher._id, // Link the student to the teacher
          status: "approved", // Students are approved automatically
        });
  
        // Save the student
        await student.save();
  
        return res.status(201).json({
          message: "Student registered successfully",
          student: {
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            role: "student",
            teacher_id: student.teacher_id,
            status: student.status,
          },
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );

// 🟢 Teacher Registration (requires approval)
Router.post(
    "/register/teacher",
    [
      body("first_name", "First Name is required").not().isEmpty(),
      body("last_name", "Last Name is required").not().isEmpty(),
      body("email", "Email is required").isEmail(),
      body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const { first_name, last_name, email, password } = req.body;
  
        // Check if teacher already exists
        let teacher = await User.findOne({ email });
        if (teacher) {
          return res.status(400).json({ message: "Teacher already exists" });
        }
  
        // Find the teacher role
        const role = await Role.findOne({ name: "teacher" });
        if (!role) {
          return res.status(400).json({ message: "Teacher role not found" });
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create the teacher
        teacher = new User({
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role_id: role._id,
          status: "pending", // Teachers require approval
        });
  
        // Save the teacher
        await teacher.save();
  
        return res.status(201).json({
          message: "Teacher registered successfully. Awaiting approval.",
          teacher: {
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            email: teacher.email,
            role: "teacher",
            status: teacher.status,
          },
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );

// 🟢 Admin Registration (only admin can register another admin)
Router.post("/register/admin", [
    body("first_name", "First Name is required").not().isEmpty(),
    body("last_name", "Last Name is required").not().isEmpty(),
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").isLength({ min: 6 })
], async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
    }
    registerUser(req, res, "admin");
});

// 🟢 User Login
Router.post("/login", [
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate("role_id");

        if (!user) return res.status(400).json({ message: "User not found" });

        // ❌ If user is a teacher but not approved, block login
        if (["student", "teacher"].includes(user.role_id.role_name) && user.status !== "approved") {
            return res.status(403).json({ message: "Account not approved. Please wait for admin approval." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role_id.role_name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role_id.role_name
            }
        });

    } catch (error) {
        console.error("❌ Error in User Login:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

Router.post("/logout", async (req, res) => {
    let token = req.header("Authorization")

    if(!token) return res.status(400).json({ message: "Token not found" })

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }
    
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        const existingToken = await Blacklist.findOne({ token })
        
        if (existingToken) return res.status(400).json({ message: "Token already blacklisted"})
        
        await Blacklist.create({ token })

        return res.json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
})

module.exports = Router;
