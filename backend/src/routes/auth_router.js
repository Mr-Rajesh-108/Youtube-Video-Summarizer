import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  refreshAccessToken,
  allUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth_controller.js";
import authMiddleware from "../middleware/auth_middleware.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/verify-email", verifyEmail);           // GET /api/auth/verify-email?token=...
authRouter.post("/refresh-token", refreshAccessToken);  // POST /api/auth/refresh-token

// Protected routes
authRouter.post("/logout", authMiddleware, logout);
authRouter.put("/update", authMiddleware, updateUser);
authRouter.delete("/delete", authMiddleware, deleteUser);
authRouter.get("/all-users", authMiddleware, allUsers); // For testing/admin use

export default authRouter;
