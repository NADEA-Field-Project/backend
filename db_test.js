const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'passwd',
    database: 'nadea_burger_db'
});

connection.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
        return;
    }
    console.log('--- Successfully connected to the database ---\n');

    // 카테고리 조회
    connection.query('SELECT id, name FROM categories', (err, catResults) => {
        if (err) {
            console.error('Error fetching categories:', err);
        } else {
            console.log('[Categories]');
            console.table(catResults);
        }

        // 상품 조회
        connection.query('SELECT id, name, category_id, price FROM products', (err, prodResults) => {
            if (err) {
                console.error('Error fetching products:', err);
            } else {
                console.log('\n[Products]');
                console.table(prodResults);
            }
            console.log('\n--- Test Completed ---');
            connection.end();
        });
    });
});
