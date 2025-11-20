// models/Firm.js
import mongoose from "mongoose";

/* -------------------------------------------------
   CHALLENGE SUB-DOCUMENT
   ------------------------------------------------- */
const ChallengeSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // ── Required ──
    name: { type: String, required: true, trim: true },

    // ── Challenge type (multiple allowed) ──
    type: {
      type: [String],
      enum: ["1-Step", "2-Step", "Instant", "Evaluation", "Verification"],
      default: [],
    },
    accountSize: { type: String, required: true },         // e.g. "$100K"
    price: { type: String, required: true },               // e.g. "299.99"
    discountCode: { type: String, trim: true },
    discountPercent: { type: String, default: "0" },       // e.g. "20"
    priceAfterDiscount: { type: String, default: "0" },    // auto-calculated on client

    // ── Draw-down ──
    maxDrawdownType: {
      type: String,
      enum: ["Trailing", "Locking", "Static"],
      required: true,
    },
    drawdownValue: { type: String, required: true },       // e.g. "5"

    // ── Targets & Split ──
    profitTarget: { type: String, required: true },        // e.g. "10"
    profitSplit: { type: String, required: true },         // e.g. "80"

    // ── Misc ──
    leverage: { type: String },                            // e.g. "1:100"
    rulesUrl: { type: String, trim: true },
    tags: { type: String, trim: true },                    // comma-separated
    affiliateLink: { type: String, trim: true },
  },
  { _id: false }   // we don't need an extra _id for each challenge
);

/* -------------------------------------------------
   MAIN FIRM DOCUMENT
   ------------------------------------------------- */
const FirmSchema = new mongoose.Schema(
  {
    firmName: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },

    // Store uploaded file URLs (or Cloudinary public_id + url)
    logo: { type: mongoose.Schema.Types.Mixed, default: {} },
    coverImage: { type: mongoose.Schema.Types.Mixed, default: {} },

    website: { type: String, required: true, trim: true },
    ceoName: { type: String, trim: true },
    broker: { type: String, trim: true },
    country: { type: String, trim: true },
    founded: { type: String, trim: true },          // keep as string for "2024"
    description: { type: String, trim: true },
    restrictedCountries: { type: String, trim: true },

    platforms: [{ type: String }],
    assets: [{ type: String }],

    supportEmail: { type: String, trim: true },
    termsUrl: { type: String, trim: true },
    refundPolicy: { type: String, trim: true },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      }
    ],


    // ── Challenges array ──
    challenges: [ChallengeSchema],
  },
  {
    timestamps: true,               // createdAt & updatedAt
  }
);

/* -------------------------------------------------
   INDEXES (optional but recommended)
   ------------------------------------------------- */
FirmSchema.index({ firmName: 1 }, { unique: true });   // one firm per name
FirmSchema.index({ "challenges.name": 1 });            // fast lookup by challenge name

const Firm = mongoose.model("Firm", FirmSchema);

export default Firm;