const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    await pool.query(schemaSQL);
    console.log('✅ Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
