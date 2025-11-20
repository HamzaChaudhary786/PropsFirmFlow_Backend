// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // make sure you configured cloudinary

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "firms";
    let allowedFormats = ["jpg", "jpeg", "png", "webp"];
    return {
      folder,
      format: file.mimetype.split("/")[1], // keeps original extension
      allowed_formats: allowedFormats,
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
