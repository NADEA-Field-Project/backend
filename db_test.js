const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nadea_burger_db'
});

connection.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        return;
    }
    console.log('Successfully connected to the database.');

    connection.query('SELECT name FROM categories', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Categories in DB:', results);
        }
        connection.end();
    });
});
