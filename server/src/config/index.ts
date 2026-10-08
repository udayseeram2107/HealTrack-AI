import dotenv from 'dotenv';
import path from 'path';

// Attempt to load from current working directory or server subdirectory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://nkjldavltbmpbslxbcsd.supabase.co',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || ''
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash'
  },
  googleMaps: {
    serverApiKey: process.env.GOOGLE_MAPS_SERVER_API_KEY || ''
  },
  uploadDir: path.resolve(process.cwd(), 'uploads')
};
