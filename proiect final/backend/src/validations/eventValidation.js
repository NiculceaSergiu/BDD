import Joi from 'joi';

export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow('').optional(),
  location: Joi.string().max(255).required(),
  date: Joi.date().iso().required(),
  ticket: Joi.object({
    price: Joi.number().precision(2).min(0).required(),
    max_quantity: Joi.number().integer().positive().required(),
  }).required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
