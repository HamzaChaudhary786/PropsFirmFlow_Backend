// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import firmRoutes from "./routes/firmRoutes.js";
import authRoutes from "./routes/auth.js";
import newsLetterRoute from "./routes/newsLetterRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";
import { checkJwt, getUserFromToken } from "./middleware/auth.js";

const app = express();

// Connect DB
connectDB();

// Security
app.use(helmet());

// Allowed CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5000",
  "https://propsfirmflow.onrender.com",
];

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use("/api/", limiter);

// Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", checkJwt, getUserFromToken, userRoutes);
app.use("/api/firm", firmRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/newsletter", newsLetterRoute);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString(),
    pid: process.pid,
  });
});

// Root
app.get("/", (req, res) => {
  res.send("PropFirms API Running");
});

// Error handler
app.use(errorHandler);

// PORT logic
let PORT;

// If in local dev mode
if (process.env.NODE_ENV === "Client") {
  PORT = 5000;
}

// If production
else if (process.env.NODE_ENV === "Production") {
  PORT = process.env.PORT || 10000;
}

// Default fallback
else {
  PORT = process.env.PORT || 10000;
}

const HOST = "0.0.0.0";

app.listen(PORT, HOST, () =>
  console.log(`🚀 Server running on http://${HOST}:${PORT} | Mode: ${process.env.NODE_ENV}`)
);

export default app;
