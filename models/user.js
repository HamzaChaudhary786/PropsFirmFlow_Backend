// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true }, // From Auth0 sub claim
  email: { type: String, unique: true },
  name: { type: String },
  picture: { type: String },
  userType: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  }, // Role: user or admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent model overwrite upon hot-reload in dev
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
