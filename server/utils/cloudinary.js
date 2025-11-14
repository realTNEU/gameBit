import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split(".").pop());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed"));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

export const uploadMultiple = upload.array("images", 10);
export const uploadSingle = upload.single("image");

export const uploadToCloudinary = async (file, folder = "gamebit") => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("image/") ? "image" : "raw";
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      transformation: resourceType === "image" ? [
        { width: 1000, height: 1000, crop: "limit", quality: "auto" }
      ] : []
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (url) => {
  try {
    const publicId = extractPublicId(url);
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];
    const publicIdWithExt = filename.split(".")[0];
    const folderParts = urlParts.slice(-3, -1);
    return `${folderParts.join("/")}/${publicIdWithExt}`;
  } catch (error) {
    return null;
  }
};

export default cloudinary;

