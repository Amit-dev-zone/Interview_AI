const express = require("express");
const multer = require("multer");
const interviewController = require("../controllers/interview.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const interviewRouter = express.Router();

interviewRouter.use(authMiddleware.authUser);

interviewRouter.post("/start", upload.single("resumeFile"), interviewController.startInterviewController);
interviewRouter.post("/:interviewId/answer", interviewController.submitAnswerController);
interviewRouter.get("/history", interviewController.getInterviewHistoryController);
interviewRouter.get("/:interviewId", interviewController.getInterviewByIdController);

module.exports = interviewRouter;
