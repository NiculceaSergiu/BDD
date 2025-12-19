import { logError } from './logger.js';

export const errorHandler = (err, req, res, next) => {
  logError(err, req);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};
