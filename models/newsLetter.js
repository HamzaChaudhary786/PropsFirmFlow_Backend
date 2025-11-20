// models/User.js
import mongoose from "mongoose";

const newaLetterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
});

const NewsLetter = mongoose.models.NewsLetter || mongoose.model("NewsLetter", newaLetterSchema);
export default NewsLetter;
