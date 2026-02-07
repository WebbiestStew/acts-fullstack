const { Pool } = require('pg');
const { config } = require('./config');

// Use DATABASE_URL if available (production), otherwise use individual settings (local)
const poolConfig = config.databaseUrl 
  ? { 
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false }
    }
  : config.db;

const pool = new Pool(poolConfig);

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
