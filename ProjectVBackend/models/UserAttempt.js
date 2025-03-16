const mongoose = require("mongoose");

const UserAttemptSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    answers: [
        {
            question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
            selected_option: { type: String } // MCQ answers
        }
    ],
    total_score: { type: Number, default: 0 },
    status: { type: String, enum: ["incomplete", "submitted", "graded"], default: "incomplete" }
}, { timestamps: true });

module.exports = mongoose.model("UserAttempt", UserAttemptSchema);
