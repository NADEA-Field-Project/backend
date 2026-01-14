const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sample Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to NADEA Burger Backend API (DB Linked)',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// --- User & Auth ---
app.post('/api/v1/auth/signup', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
            [email, username, password]
        );
        res.status(201).json({ success: true, userId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute(
            'SELECT id, email, username FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        res.json({ success: true, user: rows[0], token: 'mock-jwt-token-' + rows[0].id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Products ---
app.get('/api/v1/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/v1/products', async (req, res) => {
    const { category_id } = req.query;
    try {
        let query = 'SELECT * FROM products';
        let params = [];
        if (category_id) {
            query += ' WHERE category_id = ?';
            params.push(category_id);
        }
        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/v1/products/recommendations', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products WHERE is_recommended = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/v1/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Cart ---
app.get('/api/v1/carts', async (req, res) => {
    const { userId } = req.query; // In real app, get from token
    try {
        const [rows] = await pool.execute(
            'SELECT ci.*, p.name, p.price, p.image_url FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?',
            [userId]
        );
        const total = rows.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        res.json({ items: rows, totalPrice: total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/carts/items', async (req, res) => {
    const { userId, productId, quantity, options } = req.body;
    try {
        // Check if item already in cart
        const [existing] = await pool.execute(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            await pool.execute(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity || 1, existing[0].id]
            );
        } else {
            await pool.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity, options) VALUES (?, ?, ?, ?)',
                [userId, productId, quantity || 1, JSON.stringify(options || {})]
            );
        }
        res.status(201).json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.patch('/api/v1/carts/items/:itemId', async (req, res) => {
    const { quantity } = req.body;
    try {
        await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.itemId]);
        res.json({ success: true, message: 'Quantity updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/v1/carts/items/:itemId', async (req, res) => {
    try {
        await pool.execute('DELETE FROM cart_items WHERE id = ?', [req.params.itemId]);
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Orders ---
app.post('/api/v1/orders', async (req, res) => {
    const { userId, addressId } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get Cart Items
        const [cartItems] = await connection.execute(
            'SELECT ci.*, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?',
            [userId]
        );

        if (cartItems.length === 0) throw new Error('Cart is empty');

        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const orderId = 'ORD-' + Date.now();

        // 2. Create Order
        await connection.execute(
            'INSERT INTO orders (id, user_id, total_price, status, address_id) VALUES (?, ?, ?, ?, ?)',
            [orderId, userId, totalPrice, 'Pending', addressId]
        );

        // 3. Create Order Items
        for (const item of cartItems) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, options) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, JSON.stringify(item.options)]
            );
        }

        // 4. Clear Cart
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit();
        res.status(201).json({ success: true, orderId: orderId, message: 'Order created successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/v1/orders', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await pool.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Reorder Logic ---
app.post('/api/v1/carts/reorder', async (req, res) => {
    const { userId, orderId } = req.body;
    try {
        // 1. Get previous order items
        const [orderItems] = await pool.execute(
            'SELECT product_id, quantity, options FROM order_items WHERE order_id = ?',
            [orderId]
        );

        if (orderItems.length === 0) return res.status(404).json({ message: 'Order items not found' });

        // 2. Add them back to cart
        for (const item of orderItems) {
            // Logic to handle potentially existing items in cart (simplified)
            await pool.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity, options) VALUES (?, ?, ?, ?)',
                [userId, item.product_id, item.quantity, JSON.stringify(item.options)]
            );
        }

        res.status(201).json({ success: true, message: 'Historical items added back to cart' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
