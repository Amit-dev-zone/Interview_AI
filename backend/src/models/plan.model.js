const mongoose = require("mongoose");

const dayItemSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  keyTopics: [{ type: String }],
  tasks: [{ type: String }],
  milestone: { type: String },
  isCompleted: { type: Boolean, default: false }
});

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index: true
  },
  targetRole: { type: String, required: true },
  durationDays: { type: Number, required: true, default: 7 },
  companyTier: { type: String, default: "Tech Product" },
  candidateSummary: { type: String },
  extractedSkills: [{ type: String }],
  skillGaps: [{ type: String }],
  dailyRoadmap: [dayItemSchema],
  resumeSnippet: { type: String }
}, {
  timestamps: true
});

const PlanModel = mongoose.model("Plan", planSchema);
module.exports = PlanModel;
