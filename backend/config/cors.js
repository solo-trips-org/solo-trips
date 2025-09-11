import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const allowAllInDev = process.env.APP_ENV === 'dev';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow no-origin requests (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowAllInDev) {
      return callback(null, true);
    }

    // ✅ allow all localhost ports
    if (localhostRegex.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
