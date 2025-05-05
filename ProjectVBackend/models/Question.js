const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    question_text: { type: String, required: true },
    question_img: String,
    type: { type: String, enum: ["MCQ", "Numerical"], required: true },
    marks: { type: Number, required: true },
  },
  { timestamps: true }
);

// Virtual for MCQOptions
QuestionSchema.virtual("MCQOptions", {
  ref: "MCQOption",
  localField: "_id",
  foreignField: "question_id",
});

QuestionSchema.virtual("NumericalAnswer", {
    ref: "NumericalQuestion",
    localField: "_id",
    foreignField: "question_id",
    justOne: true, // only one numerical answer per question
  });

// ✅ Enable virtuals when sending as JSON or object
QuestionSchema.set("toObject", { virtuals: true });
QuestionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Question", QuestionSchema);
