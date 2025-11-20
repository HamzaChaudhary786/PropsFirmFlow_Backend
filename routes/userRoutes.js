// routes/auth.js
import express from "express";
import { checkJwt, getUserFromToken } from "../middleware/auth.js";
import { getAllUsers, getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", checkJwt, getUserFromToken, getProfile);
router.get('/all', checkJwt, getUserFromToken, getAllUsers);
export default router;
