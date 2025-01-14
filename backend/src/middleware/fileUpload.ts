import multer from 'multer'
import path from 'path';
import {promises as fs} from 'fs'

// Multer configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { conference_id } = req.body;
      if (!conference_id) {
        cb(new Error('Chýba ID konferencie'), '');
        return;
      }

      const uploadPath = `uploads/docs/${conference_id}`;

      // Ensure the directory exists
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error instanceof Error ? error : new Error(String(error)), '');
    }
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  },
});

// File filter to allow only specific file types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (fileTypes.includes(ext)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Neplatný typ súboru. Povolené sú iba PDF, DOC a DOCX.')); // Reject the file
  }
};

// Multer instance
const paperUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
});

export default paperUpload;