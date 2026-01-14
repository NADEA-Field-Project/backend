const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'nadea_burger_secret_key_2026'; // In production, use environment variables

app.use(cors());
app.use(express.json());

// --- Middleware: Auth ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// --- User & Auth ---
app.post('/api/v1/auth/signup', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
            [email, username, hashedPassword]
        );
        res.status(201).json({ success: true, userId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token: token,
            user: { id: user.id, email: user.email, name: user.username }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mock Logout (Client should just delete the token)
app.post('/api/v1/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// Protected Profile Route
app.get('/api/v1/users/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, email, username, phone FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Products (Public) ---
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

// --- Cart (Protected) ---
app.get('/api/v1/carts', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT ci.*, p.name, p.price, p.image_url FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?',
            [req.user.id]
        );
        const total = rows.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        res.json({ items: rows, totalPrice: total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/carts/items', authenticateToken, async (req, res) => {
    const { productId, quantity, options } = req.body;
    try {
        const [existing] = await pool.execute(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, productId]
        );

        if (existing.length > 0) {
            await pool.execute(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity || 1, existing[0].id]
            );
        } else {
            await pool.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity, options) VALUES (?, ?, ?, ?)',
                [req.user.id, productId, quantity || 1, JSON.stringify(options || {})]
            );
        }
        res.status(201).json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Orders (Protected) ---
app.post('/api/v1/orders', authenticateToken, async (req, res) => {
    const { addressId } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [cartItems] = await connection.execute(
            'SELECT ci.*, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?',
            [req.user.id]
        );

        if (cartItems.length === 0) throw new Error('Cart is empty');

        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const orderId = 'ORD-' + Date.now();

        await connection.execute(
            'INSERT INTO orders (id, user_id, total_price, status, address_id) VALUES (?, ?, ?, ?, ?)',
            [orderId, req.user.id, totalPrice, 'Pending', addressId]
        );

        for (const item of cartItems) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, options) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, JSON.stringify(item.options)]
            );
        }

        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

        await connection.commit();
        res.status(201).json({ success: true, orderId: orderId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/v1/orders', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/carts/reorder', authenticateToken, async (req, res) => {
    const { orderId } = req.body;
    try {
        const [orderItems] = await pool.execute(
            'SELECT product_id, quantity, options FROM order_items WHERE order_id = ?',
            [orderId]
        );

        if (orderItems.length === 0) return res.status(404).json({ message: 'Order items not found' });

        for (const item of orderItems) {
            await pool.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity, options) VALUES (?, ?, ?, ?)',
                [req.user.id, item.product_id, item.quantity, JSON.stringify(item.options)]
            );
        }
        res.status(201).json({ success: true, message: 'Items added back to cart' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
