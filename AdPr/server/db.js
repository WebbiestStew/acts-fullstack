const { Pool } = require('pg');
const { config } = require('./config');

const pool = new Pool(config.db);

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
