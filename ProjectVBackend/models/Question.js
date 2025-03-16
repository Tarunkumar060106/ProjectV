const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    question_text: { type: String, required: true },
    question_img: { type: String }, // Optional image for question
    type: { type: String, enum: ["MCQ", "Numerical"], required: true },
    marks: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Question", QuestionSchema);
