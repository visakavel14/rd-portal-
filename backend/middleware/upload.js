import multer from "multer";
import path from "path";
import fs from "fs";

/* ------------------ Ensure folders exist ------------------ */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const baseUploadPath = "uploads";

const folders = {
  publications: `${baseUploadPath}/publications`,
  proposals: `${baseUploadPath}/proposals`,
  ipr: `${baseUploadPath}/ipr`,
  phdscholars: `${baseUploadPath}/phdscholars`,
};

Object.values(folders).forEach(ensureDir);

/* ------------------ Storage ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const url = req.baseUrl;

    if (url.includes("publications")) {
      cb(null, folders.publications);
    } else if (url.includes("proposals")) {
      cb(null, folders.proposals);
    } else if (url.includes("ipr")) {
      cb(null, folders.ipr);
    } else if (url.includes("phdScholars")) {
      cb(null, folders.phdscholars);
    } else {
      cb(null, baseUploadPath);
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

/* ------------------ File Filter ------------------ */
const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"), false);
  }
};

/* ------------------ Multer Instance ------------------ */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
