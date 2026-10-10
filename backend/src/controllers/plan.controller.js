const PlanModel = require("../models/plan.model");
const aiService = require("../services/ai.service");
const { PDFParse } = require("pdf-parse");

/**
 * Helper to extract text from a PDF Buffer
 */
async function extractTextFromBuffer(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    await parser.destroy();
    return typeof result === "string" ? result : (result?.text || "");
  } catch (err) {
    console.warn("PDF extraction fallback error:", err.message);
    // Fallback simple string conversion if binary plain text
    return buffer.toString("utf-8");
  }
}

/**
 * POST /api/plan/generate
 * Generates an AI-powered day-wise preparation plan from Resume text or PDF upload
 */
async function generatePlanController(req, res) {
  try {
    const userId = req.user.id;
    let { resumeText = "", targetRole = "Software Engineer", durationDays = 7, companyTier = "Product Tech" } = req.body;

    // Handle file upload if present
    if (req.file && req.file.buffer) {
      const extractedText = await extractTextFromBuffer(req.file.buffer);
      if (extractedText && extractedText.trim().length > 30) {
        resumeText = extractedText;
      }
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({
        message: "Please upload a valid resume PDF or provide your resume details in text."
      });
    }

    const durationNum = Math.min(Math.max(parseInt(durationDays, 10) || 7, 3), 30);

    // Call Gemini AI
    const aiResult = await aiService.generateDaywisePlan(
      resumeText,
      targetRole,
      durationNum,
      companyTier
    );

    // Persist in DB
    const newPlan = await PlanModel.create({
      userId,
      targetRole,
      durationDays: durationNum,
      companyTier,
      candidateSummary: aiResult.candidateSummary,
      extractedSkills: aiResult.extractedSkills || [],
      skillGaps: aiResult.skillGaps || [],
      dailyRoadmap: (aiResult.dailyRoadmap || []).map(day => ({
        dayNumber: day.dayNumber,
        title: day.title,
        keyTopics: day.keyTopics || [],
        tasks: day.tasks || [],
        milestone: day.milestone || "",
        isCompleted: false
      })),
      resumeSnippet: resumeText.slice(0, 1000)
    });

    return res.status(201).json({
      message: "Day-wise study plan generated successfully!",
      plan: newPlan
    });
  } catch (error) {
    console.error("Generate Plan Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate study plan. Please try again."
    });
  }
}

/**
 * GET /api/plan/user
 * Fetches all study plans for the logged-in user
 */
async function getUserPlansController(req, res) {
  try {
    const userId = req.user.id;
    const plans = await PlanModel.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      plans
    });
  } catch (error) {
    console.error("Get User Plans Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch study plans."
    });
  }
}

/**
 * GET /api/plan/:planId
 * Fetches a single study plan by ID
 */
async function getPlanByIdController(req, res) {
  try {
    const userId = req.user.id;
    const { planId } = req.params;

    const plan = await PlanModel.findOne({ _id: planId, userId });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("Get Plan By ID Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch plan."
    });
  }
}

/**
 * PATCH /api/plan/:planId/day/:dayNumber/toggle
 * Toggles a day's completion milestone
 */
async function toggleDayCompletionController(req, res) {
  try {
    const userId = req.user.id;
    const { planId, dayNumber } = req.params;

    const plan = await PlanModel.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    const dayItem = plan.dailyRoadmap.find(d => d.dayNumber === parseInt(dayNumber, 10));
    if (!dayItem) {
      return res.status(404).json({ message: "Day item not found in plan." });
    }

    dayItem.isCompleted = !dayItem.isCompleted;
    await plan.save();

    return res.status(200).json({
      message: `Day ${dayNumber} status updated.`,
      plan
    });
  } catch (error) {
    console.error("Toggle Day Completion Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update day milestone."
    });
  }
}

module.exports = {
  generatePlanController,
  getUserPlansController,
  getPlanByIdController,
  toggleDayCompletionController
};
