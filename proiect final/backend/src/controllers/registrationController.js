import { registerForEvent } from '../services/registrationService.js';

export const registerToEventController = async (req, res, next) => {
  try {
    const result = await registerForEvent({ userId: req.user.id, eventId: req.body.eventId });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
