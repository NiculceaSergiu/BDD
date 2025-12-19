import { Router } from 'express';
import { registerToEventController } from '../controllers/registrationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { registrationSchema } from '../validations/registrationValidation.js';

const router = Router();

/**
 * @openapi
 * /api/registrations:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Registrations]
 *     summary: Inscriere la un eveniment
 */
router.post('/', authenticate, validateBody(registrationSchema), registerToEventController);

export default router;
