const mongoose = require("mongoose");

const MCQOptionSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    option_text: { type: String, required: true },
    option_img: { type: String },
    is_correct: { type: Boolean, required: true }
});

module.exports = mongoose.model("MCQOption", MCQOptionSchema);
