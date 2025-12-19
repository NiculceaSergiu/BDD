const SENSITIVE_KEYS = ['password', 'oldPassword', 'newPassword', 'confirmPassword', 'refreshToken'];

const redact = (input) => {
  if (!input || typeof input !== 'object') return input;
  const clone = Array.isArray(input) ? [...input] : { ...input };
  SENSITIVE_KEYS.forEach((key) => {
    if (key in clone) {
      clone[key] = '***';
    }
  });
  return clone;
};

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();
  const { method, originalUrl, ip } = req;
  const body = redact(req.body);

  console.log('[REQ]', { method, url: originalUrl, ip, body });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log('[RES]', {
      method,
      url: originalUrl,
      status: res.statusCode,
      duration_ms: durationMs.toFixed(1),
    });
  });

  next();
};

export const logError = (err, req) => {
  const { method, originalUrl } = req || {};
  console.error('[ERR]', {
    method,
    url: originalUrl,
    message: err?.message,
    stack: err?.stack,
  });
};
