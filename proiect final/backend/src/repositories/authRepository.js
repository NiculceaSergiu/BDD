import { authPool } from '../db/authPool.js';

export const findUserByEmail = async (email) => {
  const [rows] = await authPool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await authPool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const createUser = async ({ name, email, password_hash, role }) => {
  const [result] = await authPool.query(
    'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
    [name, email, password_hash, role],
  );
  return { id: result.insertId, name, email, role };
};

export const saveRefreshToken = async ({ userId, token, expiresAt }) => {
  await authPool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt],
  );
};

export const findRefreshToken = async (token) => {
  const [rows] = await authPool.query('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
  return rows[0];
};

export const deleteRefreshToken = async (token) => {
  await authPool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

export const deleteUserTokens = async (userId) => {
  await authPool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
};
