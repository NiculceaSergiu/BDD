function logInfo(message, data = {}) {
  const timestamp = new Date().toISOString();
  const extra = Object.keys(data).length ? ` | ${JSON.stringify(data)}` : '';
  console.log(`[INFO] ${timestamp} - ${message}${extra}`);
}

function logError(message, error = {}) {
  const timestamp = new Date().toISOString();
  const details = error instanceof Error ? { message: error.message, stack: error.stack } : error;
  const extra = Object.keys(details || {}).length ? ` | ${JSON.stringify(details)}` : '';
  console.error(`[ERROR] ${timestamp} - ${message}${extra}`);
}

module.exports = {
  logInfo,
  logError,
};
