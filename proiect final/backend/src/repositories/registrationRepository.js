import { eventsPool } from '../db/eventsPool.js';

const getExecutor = (db) => (sql, params) => db.query(sql, params);

export const countRegistrationsByEvent = async (eventId, db = eventsPool) => {
  const exec = getExecutor(db);
  const [rows] = await exec('SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [eventId]);
  return rows[0]?.count || 0;
};

export const findRegistrationByUserAndEvent = async (userId, eventId, db = eventsPool) => {
  const exec = getExecutor(db);
  const [rows] = await exec(
    'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
    [userId, eventId],
  );
  return rows[0];
};

export const insertRegistration = async ({ userId, eventId, status }, db = eventsPool) => {
  const exec = getExecutor(db);
  const [result] = await exec(
    'INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, ?)',
    [userId, eventId, status],
  );
  return result.insertId;
};
