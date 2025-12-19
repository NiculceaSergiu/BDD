import { addDays } from '../utils/date.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import {
  createUser,
  deleteRefreshToken,
  deleteUserTokens,
  findRefreshToken,
  findUserByEmail,
  findUserById,
  saveRefreshToken,
} from '../repositories/authRepository.js';
import { config } from '../config/env.js';

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const buildAuthResponse = async (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = addDays(new Date(), config.jwt.refreshTokenTtlDays);
  await saveRefreshToken({ userId: user.id, token: refreshToken, expiresAt });
  return { user: payload, accessToken, refreshToken };
};

export const register = async ({ name, email, password, role }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throwError('Email already registered', 409);
  }
  const password_hash = await hashPassword(password);
  const user = await createUser({ name, email, password_hash, role });
  return buildAuthResponse(user);
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throwError('Invalid credentials', 401);
  }
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throwError('Invalid credentials', 401);
  }
  return buildAuthResponse(user);
};

export const refreshTokens = async ({ refreshToken }) => {
  const stored = await findRefreshToken(refreshToken);
  if (!stored) {
    throwError('Refresh token not found', 401);
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch (error) {
    throwError('Refresh token invalid or expired', 401);
  }

  await deleteRefreshToken(refreshToken);
  const user = await findUserById(payload.id);
  if (!user) {
    throwError('User not found', 404);
  }
  return buildAuthResponse(user);
};

export const logout = async ({ refreshToken, userId }) => {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  } else if (userId) {
    await deleteUserTokens(userId);
  }
};
