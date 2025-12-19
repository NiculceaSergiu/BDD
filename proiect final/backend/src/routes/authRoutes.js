import { Router } from 'express';
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '../validations/authValidation.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Inregistrare utilizator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Utilizator creat
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login utilizator
 *     responses:
 *       200:
 *         description: Tokenuri generate
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reemite token de acces
 * /api/auth/logout:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Auth
 *     summary: Logout si sterge refresh token
 */
router.post('/register', validateBody(registerSchema), registerController);
router.post('/login', loginRateLimiter, validateBody(loginSchema), loginController);
router.post('/refresh', validateBody(refreshSchema), refreshController);
router.post('/logout', authenticate, logoutController);

export default router;
