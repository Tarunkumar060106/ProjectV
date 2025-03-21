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
Router.post("/register/student", [
    body("first_name", "First Name is required").not().isEmpty(),
    body("last_name", "Last Name is required").not().isEmpty(),
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").isLength({ min: 6 })
], async (req, res) => registerUser(req, res, "student"));

// 🟢 Teacher Registration (requires approval)
Router.post("/register/teacher", [
    body("first_name", "First Name is required").not().isEmpty(),
    body("last_name", "Last Name is required").not().isEmpty(),
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").isLength({ min: 6 })
], async (req, res) => {
    registerUser(req, res, "teacher");
});

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (existingToken) return res.status(400).json({ message: "Token already blacklisted"})
        
        await BlackList.create({ token })

        return res.json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
})

module.exports = Router;
