import { createEventWithTicket, getEventById, getEvents } from '../services/eventService.js';

export const listEventsController = async (req, res, next) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventController = async (req, res, next) => {
  try {
    const event = await getEventById(Number(req.params.id));
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEventController = async (req, res, next) => {
  try {
    const event = await createEventWithTicket({
      ...req.body,
      organizerId: req.user.id,
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};
