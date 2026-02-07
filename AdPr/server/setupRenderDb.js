const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Render PostgreSQL External Database URL
const DATABASE_URL = 'postgresql://taskmanager_db_rk0w_user:gJb61vJvvicJLVw4uFB9DaEVQYtTZxsC@dpg-d63om4p4tr6s73a14l20-a.oregon-postgres.render.com/taskmanager_db_rk0w';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to Render PostgreSQL database...');
        
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📝 Running schema.sql...');
        await pool.query(schema);
        
        console.log('✅ Database tables created successfully!');
        console.log('\nTables created:');
        console.log('  - users (id, email, password_hash, created_at)');
        console.log('  - items (id, title, description, owner_id, created_at)');
        
        // Verify tables exist
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\n📊 Available tables:');
        result.rows.forEach(row => console.log(`  - ${row.table_name}`));
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('\n✨ Done!');
    }
}

setupDatabase();
