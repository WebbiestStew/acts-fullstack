const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'diegovillarreal',
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='adpr_db'"
    );
    
    if (result.rows.length === 0) {
      await client.query('CREATE DATABASE adpr_db');
      console.log('✅ Database "adpr_db" created successfully!');
    } else {
      console.log('✅ Database "adpr_db" already exists');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
