// server.js
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
import { errorHandler } from "./middleware/errorMiddleware.js";
import { checkJwt, getUserFromToken } from "./middleware/auth.js";
import newsLetterRoute from "./routes/newsLetterRoutes.js"

connectDB();

const app = express();

// Security
app.use(helmet());
// server.js
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5000", "https://propsfirmflow.onrender.com/" // Add this
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("PropFirms API Running");
});

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});