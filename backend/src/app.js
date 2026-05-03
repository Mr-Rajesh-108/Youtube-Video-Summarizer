import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import auth_router from "./routes/auth_router.js";
import summary_router from "./routes/summary_router.js";

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
// Fixed: was allow-all (cors()). Now restricts to the configured frontend URL.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean); // remove undefined/null entries

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
  }),
);

// ── RATE LIMITING ────────────────────────────────────────────────────────────
// Auth endpoints: stricter limit to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes" },
});

// General API limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes" },
});

// ── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("<h1>YouTube Summarizer API</h1><p>Server is running.</p>");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Test route working!" });
});

app.use("/api/auth", authLimiter, auth_router);
app.use("/api/summary", generalLimiter, summary_router);

// ── 404 HANDLER ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

export default app;