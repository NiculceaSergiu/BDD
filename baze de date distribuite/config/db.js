const mysql = require('mysql2/promise');

const databaseNames = {
  bd1: process.env.DB1_NAME || 'BD1',
  bd2: process.env.DB2_NAME || 'BD2',
  bd3: process.env.DB3_NAME || 'BD3',
};

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
};

async function initPools() {
  const adminPool = mysql.createPool(baseConfig);
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS numbers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      value INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const pools = {};
  for (const [key, dbName] of Object.entries(databaseNames)) {
    await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    const pool = mysql.createPool({ ...baseConfig, database: dbName });
    await pool.query(createTableSQL);
    pools[key] = pool;
  }

  await adminPool.end();
  return pools;
}

module.exports = {
  baseConfig,
  databaseNames,
  initPools,
};
