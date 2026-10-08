import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config/index.js';
import woundRoutes from './routes/wound.routes.js';
import shareRoutes from './routes/share.routes.js';
import mapRoutes from './routes/map.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();

// Ensure upload & sample directories exist (safe for local & /tmp in serverless)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsDir = isServerless
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (_) {}

const samplesDir = isServerless
  ? path.resolve('/tmp', 'samples')
  : path.resolve(process.cwd(), 'samples');
try {
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }
} catch (_) {}

// Sample SVGs for fallback clinical previews
const sampleSvg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <radialGradient id="skin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#eec5a8"/>
      <stop offset="100%" stop-color="#cca085"/>
    </radialGradient>
    <radialGradient id="erythema" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#d9534f" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#e27c79" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#cca085" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="woundBed" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#991b1b"/>
      <stop offset="50%" stop-color="#b91c1c"/>
      <stop offset="85%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#skin)"/>
  <ellipse cx="300" cy="225" rx="140" ry="85" fill="url(#erythema)"/>
  <path d="M 190 220 C 240 210, 320 205, 410 225 C 390 245, 270 250, 190 220 Z" fill="url(#woundBed)"/>
  <line x1="220" y1="205" x2="220" y2="235" stroke="#374151" stroke-width="3" stroke-dasharray="2,2"/>
  <line x1="260" y1="200" x2="260" y2="238" stroke="#374151" stroke-width="3" stroke-dasharray="2,2"/>
  <line x1="300" y1="198" x2="300" y2="240" stroke="#374151" stroke-width="3" stroke-dasharray="2,2"/>
  <line x1="340" y1="200" x2="340" y2="242" stroke="#374151" stroke-width="3" stroke-dasharray="2,2"/>
  <line x1="380" y1="205" x2="380" y2="240" stroke="#374151" stroke-width="3" stroke-dasharray="2,2"/>
  <rect x="20" y="20" width="220" height="40" rx="8" fill="#111827" fill-opacity="0.75"/>
  <text x="35" y="45" fill="#f9fafb" font-family="sans-serif" font-size="14" font-weight="600">Day 1: Baseline Post-ORIF</text>
</svg>`;

const sampleSvg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <radialGradient id="skin2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#eed0bb"/>
      <stop offset="100%" stop-color="#d4aa8f"/>
    </radialGradient>
    <radialGradient id="erythema2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#d9534f" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#cca085" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="450" fill="url(#skin2)"/>
  <ellipse cx="300" cy="225" rx="80" ry="40" fill="url(#erythema2)"/>
  <path d="M 200 223 C 250 219, 310 218, 400 224" stroke="#c2410c" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M 210 223 C 260 220, 320 219, 390 224" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" fill="none"/>
  <ellipse cx="300" cy="222" rx="45" ry="12" fill="#fda4af" fill-opacity="0.6"/>
  <rect x="20" y="20" width="220" height="40" rx="8" fill="#065f46" fill-opacity="0.85"/>
  <text x="35" y="45" fill="#f9fafb" font-family="sans-serif" font-size="14" font-weight="600">Day 7: Epithelial Closure</text>
</svg>`;

try {
  if (!fs.existsSync(path.join(samplesDir, 'ankle_wound_day1.svg'))) {
    fs.writeFileSync(path.join(samplesDir, 'ankle_wound_day1.svg'), sampleSvg1);
  }
  if (!fs.existsSync(path.join(samplesDir, 'ankle_wound_day7.svg'))) {
    fs.writeFileSync(path.join(samplesDir, 'ankle_wound_day7.svg'), sampleSvg2);
  }
} catch (_) {}

// CORS setup allowing all web origins (Vercel, local dev, mobile)
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static assets
app.use('/uploads', express.static(uploadsDir));
app.use('/samples', express.static(samplesDir));

// Normalize incoming request path from Vercel / serverless reverse proxies
app.use((req: Request, _res: Response, next: NextFunction) => {
  const matchedPath = (req.headers['x-matched-path'] || req.headers['x-vercel-matched-path']) as string | undefined;
  if (matchedPath && (req.url === '/api' || req.url === '/api/') && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }
  next();
});

// Fallback image routes for sample clinical demos
app.get([
  '/samples/ankle_wound_day1.webp',
  '/samples/ankle_wound_day1.svg',
  '/api/samples/ankle_wound_day1.webp',
  '/api/samples/ankle_wound_day1.svg'
], (_req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(sampleSvg1);
});

app.get([
  '/samples/ankle_wound_day7.webp',
  '/samples/ankle_wound_day7.svg',
  '/api/samples/ankle_wound_day7.webp',
  '/api/samples/ankle_wound_day7.svg'
], (_req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(sampleSvg2);
});

// Health check endpoints
const healthHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HealTrack AI Clinical Decision-Support Backend',
    version: '1.0.0'
  });
};

app.get(['/', '/api', '/health', '/api/health', '/api/v1/health'], healthHandler);

// API Routes mounted on both /api/v1 and /v1 for Vercel Serverless Function & standard proxies
app.use('/api/v1/profile', profileRoutes);
app.use('/v1/profile', profileRoutes);

app.use('/api/v1/wounds', woundRoutes);
app.use('/v1/wounds', woundRoutes);

app.use('/api/v1', shareRoutes);
app.use('/v1', shareRoutes);

app.use('/api/v1/maps', mapRoutes);
app.use('/v1/maps', mapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal clinical server error'
  });
});

export default app;
export { app };
