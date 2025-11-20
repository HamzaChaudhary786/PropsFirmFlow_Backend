import express from "express";
import { checkJwt, getUserFromToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/sync", checkJwt, getUserFromToken, (req, res) => {
  res.json({
    success: true,
    message: "User synced",
    user: {
      id: req.user._id,
      email: req.user.email,
      userType: req.user.userType,
    },
  });
});

export default router;
