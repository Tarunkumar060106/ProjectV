const mongoose = require("mongoose");

const NumericalQuestionSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    answer_value: { type: Number, required: true },
    tolerance: { type: Number, default: 0 }, // Allow small errors in numerical answers
    range_lower_bound: { type: Number },
    range_upper_bound: { type: Number }
});

module.exports = mongoose.model("NumericalQuestion", NumericalQuestionSchema);
