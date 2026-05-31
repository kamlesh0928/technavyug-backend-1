import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/apiError.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    let folder = "devfolio";

    if (file.fieldname === "profilePhoto") {
      folder += "/users";
    }

    if (file.fieldname === "badgeImage") {
      folder += "/achievements";
    }

    if (file.fieldname === "thumbnailImage") {
      folder += "/projects";
    }

    if (file.fieldname === "galleryImages") {
      folder += "/projects/gallery";
    }

    let resource_type = "auto";

    if (file.fieldname === "certificateFile") {
      folder += "/certificates";
      if (file.mimetype === "application/pdf") {
        resource_type = "raw";
      }
    }

    return {
      folder,
      resource_type,
    };
  },
});

const fileFilter = (_req, file, cb) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, "Only images (JPG/PNG) and PDF files are allowed"),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
