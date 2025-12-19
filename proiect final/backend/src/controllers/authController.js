import { login, logout, refreshTokens, register } from '../services/authService.js';

export const registerController = async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (req, res, next) => {
  try {
    const result = await refreshTokens(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    await logout({ refreshToken: req.body.refreshToken, userId: req.user?.id });
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};
