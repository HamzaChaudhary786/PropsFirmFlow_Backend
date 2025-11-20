// controllers/authController.js
import User from "../models/user.js";

// ✅ Get current user profile (protected)
export const getProfile = async (req, res) => {
  try {
    res.json({
      message: "Profile fetched",
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        userType: req.user.userType,
        picture: req.user.picture,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Admin-only: Get all users
export const getAllUsers = async (req, res) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};
