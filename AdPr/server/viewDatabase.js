// View Database Contents
// Run this with: node server/viewDatabase.js

const { query } = require('./db');

async function viewDatabase() {
  console.log('\n========================================');
  console.log('   DATABASE CONTENTS');
  console.log('========================================\n');

  try {
    // View all users
    console.log('📋 USERS TABLE:');
    console.log('─────────────────────────────────────');
    const users = await query('SELECT id, email, created_at FROM users ORDER BY id');
    
    if (users.rows.length === 0) {
      console.log('  (No users found)');
    } else {
      users.rows.forEach(user => {
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log('  ─────────────────────────────────────');
      });
    }
    console.log(`  Total Users: ${users.rows.length}\n`);

    // View all items
    console.log('📝 ITEMS TABLE:');
    console.log('─────────────────────────────────────');
    const items = await query(
      `SELECT items.id, items.title, items.description, 
              items.owner_id, users.email as owner_email, 
              items.created_at 
       FROM items 
       JOIN users ON items.owner_id = users.id 
       ORDER BY items.id`
    );
    
    if (items.rows.length === 0) {
      console.log('  (No items found)');
    } else {
      items.rows.forEach(item => {
        console.log(`  ID: ${item.id}`);
        console.log(`  Title: ${item.title}`);
        console.log(`  Description: ${item.description || '(none)'}`);
        console.log(`  Owner: ${item.owner_email} (ID: ${item.owner_id})`);
        console.log(`  Created: ${new Date(item.created_at).toLocaleString()}`);
        console.log('  ─────────────────────────────────────');
      });
    }
    console.log(`  Total Items: ${items.rows.length}\n`);

    // Show table structures
    console.log('\n📊 DATABASE STATISTICS:');
    console.log('─────────────────────────────────────');
    console.log(`  Total Users: ${users.rows.length}`);
    console.log(`  Total Tasks: ${items.rows.length}`);
    
    if (users.rows.length > 0) {
      const avgItems = (items.rows.length / users.rows.length).toFixed(2);
      console.log(`  Average Tasks per User: ${avgItems}`);
    }
    
    console.log('\n========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing database:', error.message);
    process.exit(1);
  }
}

viewDatabase();
