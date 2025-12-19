import { eventsPool } from '../db/eventsPool.js';
import { findEventWithTicket, insertEvent, insertTicket, listEvents } from '../repositories/eventRepository.js';

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

export const createEventWithTicket = async ({ title, description, location, date, ticket, organizerId }) => {
  const connection = await eventsPool.getConnection();
  try {
    await connection.beginTransaction();
    const eventId = await insertEvent(
      { title, description, location, date, organizer_id: organizerId },
      connection,
    );
    await insertTicket(
      {
        event_id: eventId,
        price: ticket.price,
        max_quantity: ticket.max_quantity,
      },
      connection,
    );
    await connection.commit();
    return findEventWithTicket(eventId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getEvents = async () => listEvents();

export const getEventById = async (id) => {
  const event = await findEventWithTicket(id);
  if (!event) {
    throwError('Event not found', 404);
  }
  return event;
};
