import { eventsPool } from '../db/eventsPool.js';

const getExecutor = (db) => (sql, params) => db.query(sql, params);

export const insertEvent = async (event, db = eventsPool) => {
  const exec = getExecutor(db);
  const [result] = await exec(
    'INSERT INTO events (title, description, location, date, organizer_id) VALUES (?, ?, ?, ?, ?)',
    [event.title, event.description, event.location, event.date, event.organizer_id],
  );
  return result.insertId;
};

export const insertTicket = async (ticket, db = eventsPool) => {
  const exec = getExecutor(db);
  const [result] = await exec(
    'INSERT INTO tickets (event_id, price, max_quantity) VALUES (?, ?, ?)',
    [ticket.event_id, ticket.price, ticket.max_quantity],
  );
  return result.insertId;
};

export const listEvents = async () => {
  const [rows] = await eventsPool.query(
    `SELECT e.id, e.title, e.description, e.location, e.date, e.organizer_id,
            t.price, t.max_quantity,
            COALESCE(reg_counts.count, 0) AS registrations_count
     FROM events e
     LEFT JOIN tickets t ON t.event_id = e.id
     LEFT JOIN (
        SELECT event_id, COUNT(*) AS count FROM registrations GROUP BY event_id
     ) reg_counts ON reg_counts.event_id = e.id
     ORDER BY e.date ASC`,
  );
  return rows;
};

export const findEventWithTicket = async (eventId) => {
  const [rows] = await eventsPool.query(
    `SELECT e.id, e.title, e.description, e.location, e.date, e.organizer_id,
            t.id AS ticket_id, t.price, t.max_quantity
     FROM events e
     LEFT JOIN tickets t ON t.event_id = e.id
     WHERE e.id = ?`,
    [eventId],
  );
  return rows[0];
};
