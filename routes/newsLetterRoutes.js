// routes/newsLetterRoute.js

import express from "express";
import { createNewsLetter } from "../controllers/newsLetterController.js";

const router = express.Router();

// POST → subscribe to newsletter
router.post("/subscribe", createNewsLetter);

export default router;
