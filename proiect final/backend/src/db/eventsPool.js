import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

export const eventsPool = mysql.createPool({
  ...config.eventsDb,
  timezone: 'Z',
});
