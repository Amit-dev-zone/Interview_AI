const express = require("express");
const multer = require("multer");
const planController = require("../controllers/plan.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB limit
});

const planRouter = express.Router();

// All plan routes require authentication
planRouter.use(authMiddleware.authUser);

planRouter.post("/generate", upload.single("resumeFile"), planController.generatePlanController);
planRouter.get("/user", planController.getUserPlansController);
planRouter.get("/:planId", planController.getPlanByIdController);
planRouter.patch("/:planId/day/:dayNumber/toggle", planController.toggleDayCompletionController);

module.exports = planRouter;
