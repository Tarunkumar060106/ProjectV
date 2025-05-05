const mongoose = require("mongoose")

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    total_marks: { type: Number, required: true },
    assigned_students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }], // ✅ Keep this
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }]
  }, { timestamps: true });

module.exports = mongoose.model("Exam", ExamSchema)