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

function getMimeType(ext: string, prefix: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.webm': 'audio/webm',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4'
  };
  return map[ext.toLowerCase()] || (prefix === 'audio' ? 'audio/webm' : 'image/jpeg');
}

export function saveBufferToUploads(buffer: Buffer, originalname: string, prefix: string = 'img'): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const ext = path.extname(originalname) || (prefix === 'audio' ? '.webm' : '.jpg');
  const mime = getMimeType(ext, prefix);

  // In serverless cloud deployment (or files under 4MB), store directly as persistent Data URI in Supabase
  if (isServerless || buffer.length <= 4 * 1024 * 1024) {
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  const filename = `${prefix}_${uuidv4()}${ext}`;
  try {
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }
}
