import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});
