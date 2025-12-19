import { eventsPool } from '../db/eventsPool.js';
import { findUserById } from '../repositories/authRepository.js';
import { findEventWithTicket } from '../repositories/eventRepository.js';
import {
  countRegistrationsByEvent,
  findRegistrationByUserAndEvent,
  insertRegistration,
} from '../repositories/registrationRepository.js';

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

export const registerForEvent = async ({ userId, eventId }) => {
  const user = await findUserById(userId);
  if (!user) {
    throwError('User not found', 404);
  }
  const event = await findEventWithTicket(eventId);
  if (!event) {
    throwError('Event not found', 404);
  }
  if (!event.ticket_id) {
    throwError('Event has no tickets configured', 400);
  }

  const existing = await findRegistrationByUserAndEvent(userId, eventId);
  if (existing) {
    throwError('Already registered for this event', 409);
  }

  const connection = await eventsPool.getConnection();
  try {
    await connection.beginTransaction();
    const currentRegistrations = await countRegistrationsByEvent(eventId, connection);
    if (currentRegistrations >= event.max_quantity) {
      throwError('No more tickets available', 400);
    }
    const registrationId = await insertRegistration(
      { userId, eventId, status: 'confirmed' },
      connection,
    );
    await connection.commit();
    return {
      id: registrationId,
      status: 'confirmed',
      eventId,
      userId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
