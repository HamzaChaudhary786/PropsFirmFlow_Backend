// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js"; // your MongoDB connection
import userRoutes from "./routes/userRoutes.js";
import firmRoutes from "./routes/firmRoutes.js";
import authRoutes from "./routes/auth.js";
import newsLetterRoute from "./routes/newsLetterRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { checkJwt, getUserFromToken } from "./middleware/auth.js";

const app = express();

// Connect to MongoDB
connectDB();

// Security middlewares
app.use(helmet());

// Allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5000",
  "https://propsfirmflow.onrender.com" // your deployed frontend
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true, // allow cookies/auth headers
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: "Too many requests" },
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", checkJwt, getUserFromToken, userRoutes);
app.use("/api/firm", firmRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/newsletter", newsLetterRoute);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// Root route
app.get("/", (req, res) => {
  res.send("PropFirms API Running");
});

// Error handler (must be last)
app.use(errorHandler);

// Bind host and port for Render
const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
