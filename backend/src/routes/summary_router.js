import express from "express";
import {
  createSummary,
  getUserSummaries,
  getVideoSummary,
  deleteOneSummary,
  deleteVideoSummary,
  getSummaryStats,
} from "../controllers/summary_controller.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

// Create a summary (or append prompt to existing video)
router.post("/create", authMiddleware, createSummary);

// Get all summaries for the logged-in user
router.post("/user-history", authMiddleware, getUserSummaries);

// Get summaries for a specific video — videoUrl passed in request body
// Fixed: was "/video/videoUrl?" which created no actual route param,
//        causing req.params.videoUrl to always be undefined.
router.post("/video", authMiddleware, getVideoSummary);

// Delete a single summary entry within a video
router.delete("/:videoId/:summaryId", authMiddleware, deleteOneSummary);

// Delete entire video history
router.delete("/:videoId", authMiddleware, deleteVideoSummary);

// Get dashboard statistics
router.get("/stats", authMiddleware, getSummaryStats);

export default router;
