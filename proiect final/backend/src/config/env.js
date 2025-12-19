import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  authDb: {
    host: process.env.AUTH_DB_HOST || 'localhost',
    user: process.env.AUTH_DB_USER || 'root',
    password: process.env.AUTH_DB_PASSWORD || '',
    database: process.env.AUTH_DB_DATABASE || 'auth_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.AUTH_DB_POOL_LIMIT || '10', 10),
  },
  eventsDb: {
    host: process.env.EVENTS_DB_HOST || 'localhost',
    user: process.env.EVENTS_DB_USER || 'root',
    password: process.env.EVENTS_DB_PASSWORD || '',
    database: process.env.EVENTS_DB_DATABASE || 'events_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.EVENTS_DB_POOL_LIMIT || '10', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    accessTokenTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTokenTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS || '7', 10),
  },
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  },
};
