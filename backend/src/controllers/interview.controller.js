const InterviewModel = require("../models/interview.model");
const PlanModel = require("../models/plan.model");
const aiService = require("../services/ai.service");
const { PDFParse } = require("pdf-parse");

async function extractTextFromBuffer(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    await parser.destroy();
    return typeof result === "string" ? result : (result?.text || "");
  } catch (err) {
    return buffer.toString("utf-8");
  }
}

/**
 * POST /api/interview/start
 * Starts a new interactive AI mock interview session
 */
async function startInterviewController(req, res) {
  try {
    const userId = req.user.id;
    let { targetRole = "Software Engineer", difficulty = "Intermediate", totalQuestions = 5, resumeText = "", planId } = req.body;

    // Handle resume file upload if provided
    if (req.file && req.file.buffer) {
      const extracted = await extractTextFromBuffer(req.file.buffer);
      if (extracted && extracted.trim().length > 30) {
        resumeText = extracted;
      }
    }

    // If planId provided and resumeText empty, grab context from the plan
    if (planId && !resumeText) {
      const plan = await PlanModel.findOne({ _id: planId, userId });
      if (plan) {
        resumeText = `Target: ${plan.targetRole}. Skills: ${plan.extractedSkills.join(", ")}. Gaps: ${plan.skillGaps.join(", ")}`;
      }
    }

    const questionCount = Math.min(Math.max(parseInt(totalQuestions, 10) || 5, 3), 10);

    // Generate Question #1
    const firstQuestion = await aiService.generateInterviewQuestion(
      resumeText,
      targetRole,
      difficulty,
      1,
      questionCount,
      []
    );

    const interview = await InterviewModel.create({
      userId,
      targetRole,
      difficulty,
      totalQuestions: questionCount,
      currentQuestionIndex: 0,
      status: "in-progress",
      resumeContext: resumeText.slice(0, 3000),
      questions: [
        {
          questionIndex: 1,
          question: firstQuestion.question,
          category: firstQuestion.category,
          contextHint: firstQuestion.contextHint
        }
      ]
    });

    return res.status(201).json({
      message: "Mock interview session started!",
      interview
    });
  } catch (error) {
    console.error("Start Interview Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to initiate interview session."
    });
  }
}

/**
 * POST /api/interview/:interviewId/answer
 * Submits answer for current question, gets instant AI grading, and returns next question
 */
async function submitAnswerController(req, res) {
  try {
    const userId = req.user.id;
    const { interviewId } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length < 5) {
      return res.status(400).json({
        message: "Please provide a detailed answer before submitting."
      });
    }

    const interview = await InterviewModel.findOne({ _id: interviewId, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ message: "This interview session is already completed." });
    }

    const currentIndex = interview.currentQuestionIndex;
    const currentQ = interview.questions[currentIndex];

    if (!currentQ) {
      return res.status(400).json({ message: "Invalid question index." });
    }

    // 1. Evaluate answer with AI
    const evaluation = await aiService.evaluateInterviewAnswer(
      currentQ.question,
      answer,
      interview.resumeContext
    );

    currentQ.candidateAnswer = answer;
    currentQ.score = evaluation.score;
    currentQ.feedback = evaluation.feedback;
    currentQ.idealAnswer = evaluation.idealAnswer;
    currentQ.keyStrengths = evaluation.keyStrengths || [];
    currentQ.keyImprovements = evaluation.keyImprovements || [];
    currentQ.answeredAt = new Date();

    const isLastQuestion = (currentIndex + 1) >= interview.totalQuestions;

    if (!isLastQuestion) {
      // 2. Generate Next Question
      const nextIndex = currentIndex + 1;
      const nextQuestion = await aiService.generateInterviewQuestion(
        interview.resumeContext,
        interview.targetRole,
        interview.difficulty,
        nextIndex + 1,
        interview.totalQuestions,
        interview.questions
      );

      interview.questions.push({
        questionIndex: nextIndex + 1,
        question: nextQuestion.question,
        category: nextQuestion.category,
        contextHint: nextQuestion.contextHint
      });

      interview.currentQuestionIndex = nextIndex;
      await interview.save();

      return res.status(200).json({
        message: "Answer evaluated! Moving to next question.",
        evaluation,
        isCompleted: false,
        interview
      });
    } else {
      // 3. Finalize Interview & Generate Assessment Report
      const scores = interview.questions.map(q => q.score || 0);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      const report = await aiService.generateInterviewReport(interview);

      interview.status = "completed";
      interview.overallScore = report.overallScore || avgScore;
      interview.recommendation = report.recommendation;
      interview.summary = report.summary;
      interview.topStrengths = report.topStrengths || [];
      interview.areasToImprove = report.areasToImprove || [];
      interview.nextStepsPlan = report.nextStepsPlan || [];

      await interview.save();

      return res.status(200).json({
        message: "Interview completed successfully! Assessment report generated.",
        evaluation,
        isCompleted: true,
        report,
        interview
      });
    }
  } catch (error) {
    console.error("Submit Answer Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to evaluate answer."
    });
  }
}

/**
 * GET /api/interview/history
 * Fetches user's interview history
 */
async function getInterviewHistoryController(req, res) {
  try {
    const userId = req.user.id;
    const history = await InterviewModel.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Get Interview History Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch interview history."
    });
  }
}

/**
 * GET /api/interview/:interviewId
 * Fetches single interview details
 */
async function getInterviewByIdController(req, res) {
  try {
    const userId = req.user.id;
    const { interviewId } = req.params;

    const interview = await InterviewModel.findOne({ _id: interviewId, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    return res.status(200).json({ interview });
  } catch (error) {
    console.error("Get Interview By ID Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch interview session."
    });
  }
}

module.exports = {
  startInterviewController,
  submitAnswerController,
  getInterviewHistoryController,
  getInterviewByIdController
};
