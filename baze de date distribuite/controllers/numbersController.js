const { databaseNames } = require('../config/db');
const { logInfo, logError } = require('../utils/logger');

function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

const listAll = (pools) => async (req, res) => {
  try {
    const [bd1, bd2, bd3] = await Promise.all([
      pools.bd1.query('SELECT id, value, created_at FROM numbers ORDER BY id'),
      pools.bd2.query('SELECT id, value, created_at FROM numbers ORDER BY id'),
      pools.bd3.query('SELECT id, value, created_at FROM numbers ORDER BY id'),
    ]);

    const payload = [
      { database: databaseNames.bd1, rows: bd1[0] },
      { database: databaseNames.bd2, rows: bd2[0] },
      { database: databaseNames.bd3, rows: bd3[0] },
    ];

    logInfo('Ruta GET /numbers', { action: 'listAll', counts: payload.map((p) => ({ db: p.database, count: p.rows.length })) });
    res.json(payload);
  } catch (err) {
    logError('Eroare la citire GET /numbers', err);
    res.status(500).json({ error: 'Nu am putut citi datele.' });
  }
};

const listSingle = (pools) => async (req, res) => {
  const key = req.params.db.toLowerCase();
  const pool = pools[key];
  if (!pool) {
    logInfo('Ruta GET /numbers/:db', { action: 'listSingle', db: req.params.db, status: 'not-found' });
    return res.status(404).json({ error: 'Baza ceruta nu exista (foloseste bd1, bd2, bd3).' });
  }

  try {
    const [rows] = await pool.query('SELECT id, value, created_at FROM numbers ORDER BY id');
    logInfo('Ruta GET /numbers/:db', { action: 'listSingle', db: databaseNames[key], count: rows.length });
    res.json({ database: databaseNames[key], rows });
  } catch (err) {
    logError(`Eroare la citire ${key}`, err);
    res.status(500).json({ error: 'Nu am putut citi datele.' });
  }
};

const insertNumber = (pools) => async (req, res) => {
  const value = Number(req.body?.value);
  if (!Number.isInteger(value)) {
    return res.status(400).json({ error: 'Trimite un numar intreg in campul "value".' });
  }

  const prime = isPrime(value);
  const even = value % 2 === 0;
  const target = prime ? 'bd1' : even ? 'bd2' : 'bd3';
  const pool = pools[target];

  try {
    await pool.query('INSERT INTO numbers (value) VALUES (?)', [value]);
    logInfo('Ruta POST /numbers', { action: 'insert', value, prime, even, insertedInto: databaseNames[target] });
    res.json({
      insertedInto: databaseNames[target],
      prime,
      even,
      value,
    });
  } catch (err) {
    logError('Eroare la insert', err);
    res.status(500).json({ error: 'Nu am putut insera numarul.' });
  }
};

module.exports = {
  listAll,
  listSingle,
  insertNumber,
};
