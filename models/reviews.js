import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    displayName: { type: String, required: true },
    title: { type: String },
    review: { type: String, required: true },
    isAccepted: { type: Boolean, default: false },
    ratings: {
      payoutSpeed: { type: Number, required: true },
      transparency: { type: Number, required: true },
      price: { type: Number, required: true },
      customerSupport: { type: Number, required: true },
      platforms: { type: Number, required: true },
      tradingConditions: { type: Number, required: true },
    },

    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto calculate average rating
reviewSchema.pre("save", function (next) {
  const r = this.ratings;
  this.averageRating =
    (r.payoutSpeed +
      r.transparency +
      r.price +
      r.customerSupport +
      r.platforms +
      r.tradingConditions) /
    6;

  next();
});

export default mongoose.model("Review", reviewSchema);
