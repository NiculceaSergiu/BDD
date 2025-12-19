import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

export const authPool = mysql.createPool({
  ...config.authDb,
  timezone: 'Z',
});
