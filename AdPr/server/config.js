const dotenv = require('dotenv');

dotenv.config();

function validateEnv() {
  // Check if we have DATABASE_URL (production) or individual DB vars (local)
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasIndividualVars = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;
  
  if (!hasDatabaseUrl && !hasIndividualVars) {
    throw new Error('Missing database configuration. Need either DATABASE_URL or DB_HOST, DB_USER, DB_NAME');
  }
  
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required env var: JWT_SECRET');
  }
}

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  // Support both DATABASE_URL (production) and individual vars (local)
  databaseUrl: process.env.DATABASE_URL,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
};

module.exports = { config, validateEnv };
