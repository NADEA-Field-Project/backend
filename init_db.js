const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDB() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'passwd',
        multipleStatements: true
    });

    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        console.log('Executing schema.sql...');
        await connection.query(schema);
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error during database initialization:', error);
    } finally {
        await connection.end();
    }
}

initDB();
