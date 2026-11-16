const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Uploaded flyer images are saved here and served by the /static route in app.js,
// so a file saved as public/uploads/abc.png is reachable at /static/uploads/abc.png.
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
const UPLOAD_URL_PREFIX = "/static/uploads";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Give every file a unique name so two clubs uploading "flyer.png" don't overwrite each other.
function makeFilename(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `flyer-${unique}${extension}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, makeFilename(file.originalname)),
});

// Only accept image types the front-end can display.
function imageFileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  const error = new Error("Only JPEG, PNG, GIF, or WebP images can be uploaded.");
  error.code = "INVALID_FILE_TYPE";
  cb(error);
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Public URL the front-end can put in an <img src>.
function fileUrl(file) {
  return `${UPLOAD_URL_PREFIX}/${file.filename}`;
}

module.exports = {
  upload,
  imageFileFilter,
  makeFilename,
  fileUrl,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
};
