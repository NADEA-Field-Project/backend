const pool = require('./db');

async function migrate() {
    try {
        console.log('Starting migration: Adding image_url column to users table...');

        // Check if column already exists
        const [columns] = await pool.execute('SHOW COLUMNS FROM users LIKE "image_url"');

        if (columns.length === 0) {
            await pool.execute('ALTER TABLE users ADD COLUMN image_url VARCHAR(255) DEFAULT "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"');
            console.log('Migration successful: Column image_url added.');
        } else {
            console.log('Migration skipped: Column image_url already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
