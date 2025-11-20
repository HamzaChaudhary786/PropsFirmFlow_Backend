// routes/firmRoutes.js
import { Router } from "express";
import {
  createFirm,
  getFirms,
  getFirmById,
  updateFirm,
  deleteFirm,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeById,
} from "../controllers/firmController.js";
import upload from "../middleware/upload.js";

const router = Router();

// ==================== FIRM LEVEL ====================
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createFirm
);
// Create firm
router.get("/", getFirms);                       // Get all
router.get("/:id", getFirmById);                 // Get one
router.patch("/:id", updateFirm);                // Update firm
router.delete("/:id", deleteFirm);               // Delete firm
router.get("/challenge/:id", getChallengeById);
// ==================== CHALLENGE LEVEL (nested) ====================
router.post("/:id/challenges", addChallenge);                    // Add challenge
router.patch("/:firmId/challenges/:challengeId", updateChallenge); // Update challenge
router.delete("/:firmId/challenges/:challengeId", deleteChallenge); // Delete challenge

export default router;