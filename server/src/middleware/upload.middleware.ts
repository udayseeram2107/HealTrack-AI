import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage so we have immediate access to buffers for Gemini inference,
// and can safely persist images while scrubbing audio from memory immediately after
const storage = multer.memoryStorage();

export const uploadWoundEntryFiles = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'image') {
      const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      if (allowedImageMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        return cb(null, true);
      }
      return cb(new Error('Invalid image format. Allowed formats: JPEG, PNG, WebP.'));
    }

    if (file.fieldname === 'audio') {
      const allowedAudioMimes = [
        'audio/webm',
        'audio/wav',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg',
        'audio/x-m4a'
      ];
      if (allowedAudioMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
        return cb(null, true);
      }
      return cb(new Error('Invalid audio format. Allowed formats: WebM, WAV, MP4, MP3, OGG.'));
    }

    cb(null, true);
  }
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

export function saveBufferToUploads(buffer: Buffer, originalname: string, prefix: string = 'img'): string {
  const ext = path.extname(originalname) || '.jpg';
  const filename = `${prefix}_${uuidv4()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}
