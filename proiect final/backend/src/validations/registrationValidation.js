import Joi from 'joi';

export const registrationSchema = Joi.object({
  eventId: Joi.number().integer().positive().required(),
});
