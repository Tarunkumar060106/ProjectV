// models/UserAttempt.js
const mongoose = require("mongoose");

const UserAttemptSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    answers: [
        {
            question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
            selected_option: { type: String }, // MCQ answers
            numerical_answer: { type: Number }  // Numerical answers
        }
    ],
    total_score: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ["incomplete", "submitted", "graded"], 
        default: "incomplete" 
    },
    auto_graded: { type: Boolean, default: false },
    started_at: { type: Date },
    finished_at: { type: Date },
    time_spent_seconds: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model("UserAttempt", UserAttemptSchema);