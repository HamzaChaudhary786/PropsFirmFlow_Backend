// controllers/firmController.js
import Firm from "../models/firm.js";
import mongoose from "mongoose";
/* -------------------------------------------------
   CREATE – Save a new Firm
   ------------------------------------------------- */
// controllers/firmController.js
export const createFirm = async (req, res) => {
    try {
        const firmData = { ...req.body };

        // Parse challenges if sent as JSON string
        if (typeof firmData.challenges === "string") {
            firmData.challenges = JSON.parse(firmData.challenges);
        }

        // Handle Cloudinary URLs
        if (req.files?.logo) {
            firmData.logo = { url: req.files.logo[0].path }; // Cloudinary URL
        }
        if (req.files?.coverImage) {
            firmData.coverImage = { url: req.files.coverImage[0].path };
        }

        if (!firmData.firmName || !firmData.website) {
            return res
                .status(400)
                .json({ message: "Firm name and website are required" });
        }

        const firm = new Firm(firmData);
        await firm.save();

        res.status(201).json({
            message: "Firm created successfully",
            data: firm,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Firm name already exists" });
        }
        console.error("createFirm:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


/* -------------------------------------------------
   READ – Get all firms
   ------------------------------------------------- */
export const getFirms = async (req, res) => {
    try {
        // Get page and limit from query params, default to page 1 and limit 10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate how many documents to skip
        const skip = (page - 1) * limit;

        // Fetch firms with pagination and sorting
        const firms = await Firm.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination info
        const total = await Firm.countDocuments();

        res.status(200).json({
            total,
            page,
            pages: Math.ceil(total / limit),
            firms
        });
    } catch (error) {
        console.error("getFirms:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/* -------------------------------------------------
   READ – Get single firm by ID
   ------------------------------------------------- */
export const getFirmById = async (req, res) => {
    try {
        const { id } = req.params;
        const firm = await Firm.findById(id);

        if (!firm) return res.status(404).json({ message: "Firm not found" });

        res.status(200).json(firm);
    } catch (error) {
        console.error("getFirmById:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* -------------------------------------------------
   UPDATE – Full or partial firm update
   ------------------------------------------------- */
export const updateFirm = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent duplicate firmName
        if (updates.firmName) {
            const exists = await Firm.findOne({ firmName: updates.firmName, _id: { $ne: id } });
            if (exists) return res.status(409).json({ message: "Firm name already in use" });
        }

        const firm = await Firm.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!firm) return res.status(404).json({ message: "Firm not found" });

        res.status(200).json({
            message: "Firm updated",
            data: firm,
        });
    } catch (error) {
        console.error("updateFirm:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* -------------------------------------------------
   DELETE – Remove firm
   ------------------------------------------------- */
export const deleteFirm = async (req, res) => {
    try {
        const { id } = req.params;
        const firm = await Firm.findByIdAndDelete(id);

        if (!firm) return res.status(404).json({ message: "Firm not found" });

        res.status(200).json({ message: "Firm deleted", deletedId: id });
    } catch (error) {
        console.error("deleteFirm:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* -------------------------------------------------
   CHALLENGE: Add new challenge to a firm
   POST /api/firms/:id/challenges
   ------------------------------------------------- */
export const addChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const challengeData = req.body;

        // Basic validation
        if (!challengeData.name || !challengeData.price || !challengeData.maxDrawdownType) {
            return res.status(400).json({ message: "Challenge name, price, and drawdown type are required" });
        }

        const firm = await Firm.findById(id);
        if (!firm) return res.status(404).json({ message: "Firm not found" });

        firm.challenges.push(challengeData);
        await firm.save();

        const newChallenge = firm.challenges[firm.challenges.length - 1];

        res.status(201).json({
            message: "Challenge added",
            challenge: newChallenge,
        });
    } catch (error) {
        console.error("addChallenge:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* -------------------------------------------------
   CHALLENGE: Update a specific challenge
   PATCH /api/firms/:firmId/challenges/:challengeId
   ------------------------------------------------- */
export const updateChallenge = async (req, res) => {
    try {
        const { firmId, challengeId } = req.params;
        const updates = req.body;

        const firm = await Firm.findById(firmId);
        if (!firm) return res.status(404).json({ message: "Firm not found" });

        const challenge = firm.challenges.id(challengeId);
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });

        // Apply updates
        Object.keys(updates).forEach((key) => {
            if (key !== "_id") challenge[key] = updates[key];
        });

        await firm.save();

        res.status(200).json({
            message: "Challenge updated",
            challenge: challenge,
        });
    } catch (error) {
        console.error("updateChallenge:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* -------------------------------------------------
   CHALLENGE: Delete a challenge
   DELETE /api/firms/:firmId/challenges/:challengeId
   ------------------------------------------------- */
export const deleteChallenge = async (req, res) => {
    try {
        const { firmId, challengeId } = req.params;

        const firm = await Firm.findById(firmId);
        if (!firm) return res.status(404).json({ message: "Firm not found" });

        const challenge = firm.challenges.id(challengeId);
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });

        challenge.remove();
        await firm.save();

        res.status(200).json({ message: "Challenge deleted" });
    } catch (error) {
        console.error("deleteChallenge:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// controllers/firmController.js
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Requested challenge ID:", id);

    // Validate MongoDB ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid challenge ID" });
    }

    // Use positional projection $ to get only the matching challenge
    const firmData = await Firm.findOne(
      { "challenges._id": id }
    ).lean();

    if (!firmData || !firmData.challenges || firmData.challenges.length === 0) {
      return res.status(404).json({ success: false, message: "Challenge not found" });
    }

    const challenge = firmData.challenges; // Already the correct one thanks to $

    // Send clean response
    res.status(200).json({
      success: true,
      data: {
        firm: firmData,
        challenge,
      },
    });
  } catch (error) {
    console.error("getChallengeById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
