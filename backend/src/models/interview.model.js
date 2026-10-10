const mongoose = require("mongoose");

const questionItemSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  question: { type: String, required: true },
  category: { type: String, default: "Technical" },
  contextHint: { type: String },
  candidateAnswer: { type: String, default: "" },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: "" },
  idealAnswer: { type: String, default: "" },
  keyStrengths: [{ type: String }],
  keyImprovements: [{ type: String }],
  answeredAt: { type: Date }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true
  },
  targetRole: { type: String, required: true },
  difficulty: { type: String, default: "Intermediate" },
  totalQuestions: { type: Number, default: 5 },
  currentQuestionIndex: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["in-progress", "completed", "abandoned"],
    default: "in-progress"
  },
  questions: [questionItemSchema],
  overallScore: { type: Number, default: 0 },
  recommendation: { type: String, default: "" },
  summary: { type: String, default: "" },
  topStrengths: [{ type: String }],
  areasToImprove: [{ type: String }],
  nextStepsPlan: [{ type: String }],
  resumeContext: { type: String, default: "" }
}, {
  timestamps: true
});

const InterviewModel = mongoose.model("Interview", interviewSchema);
module.exports = InterviewModel;
