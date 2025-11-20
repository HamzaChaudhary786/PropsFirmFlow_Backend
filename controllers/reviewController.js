import Review from "../models/reviews.js";
import Firm from "../models/firm.js";


export const createReview = async (req, res) => {
    try {
        const { firmId } = req.params;

        const review = await Review.create({
            ...req.body,
            firmId,
            userId: req.user.id, // assuming user is authenticated
        });

        // Add review reference inside firm
        await Firm.findByIdAndUpdate(firmId, {
            $push: { reviews: review._id },
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// -----------------------------
// GET ALL REVIEWS FOR A FIRM
// -----------------------------
export const getReviewsByFirm = async (req, res) => {
    try {
        const { firmId } = req.params;

        const reviews = await Review.find({
            firmId,
            isAccepted: false        // ⬅ Only pending reviews
        })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// -----------------------------
// DELETE REVIEW
// -----------------------------
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Remove reference from Firm
        await Firm.findByIdAndUpdate(review.firmId, {
            $pull: { reviews: reviewId },
        });

        await Review.findByIdAndDelete(reviewId);

        res.json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


