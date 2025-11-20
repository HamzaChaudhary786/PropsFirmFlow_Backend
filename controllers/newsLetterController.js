// controllers/newsLetterController.js

import NewsLetter from "../models/newsLetter.js";

export const createNewsLetter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if already exists
    const existing = await NewsLetter.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    // Save new subscriber
    const newSubscriber = await NewsLetter.create({ email });

    res.status(201).json({
      message: "Subscribed successfully",
      data: newSubscriber,
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
