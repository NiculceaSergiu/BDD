import { Router } from 'express';
import {
  createEventController,
  getEventController,
  listEventsController,
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createEventSchema, idParamSchema } from '../validations/eventValidation.js';

const router = Router();

/**
 * @openapi
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Listeaza evenimentele disponibile
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Events]
 *     summary: Creeaza un eveniment nou (organizator)
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Detalii eveniment
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/', listEventsController);
router.get('/:id', validateParams(idParamSchema), getEventController);
router.post(
  '/',
  authenticate,
  requireRole('admin', 'organizer'),
  validateBody(createEventSchema),
  createEventController,
);

export default router;
