const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true }, // ✅ Changed from exam_id
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
  }, { timestamps: true }); 

module.exports = mongoose.model("Section", SectionSchema);
