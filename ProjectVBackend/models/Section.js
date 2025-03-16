const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
}, {timestamps: true});

module.exports = mongoose.model("Section", SectionSchema);
