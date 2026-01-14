const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sample Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to NADEA Burger Backend API',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// --- User & Auth ---
app.post('/api/v1/auth/signup', (req, res) => {
    res.json({ success: true, message: 'Signup successful' });
});

app.post('/api/v1/auth/login', (req, res) => {
    res.json({
        success: true,
        token: 'mock-jwt-token-12345',
        user: { id: 1, email: req.body.email, name: 'Test User' }
    });
});

app.post('/api/v1/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

app.get('/api/v1/users/me', (req, res) => {
    res.json({ id: 1, email: 'test@example.com', name: 'Test User', phone: '010-1234-5678' });
});

app.patch('/api/v1/users/me', (req, res) => {
    res.json({ success: true, message: 'Profile updated' });
});

app.delete('/api/v1/users/me', (req, res) => {
    res.json({ success: true, message: 'Account deleted' });
});

// --- Products ---
app.get('/api/v1/categories', (req, res) => {
    res.json([
        { id: 1, name: 'Burger' },
        { id: 2, name: 'Sides' },
        { id: 3, name: 'Drinks' }
    ]);
});

app.get('/api/v1/products', (req, res) => {
    res.json([
        { id: 1, name: 'Classic Burger', price: 5500, categoryId: 1 },
        { id: 2, name: 'Cheese Burger', price: 6500, categoryId: 1 }
    ]);
});

app.get('/api/v1/products/recommendations', (req, res) => {
    res.json([
        { id: 1, name: 'Best Seller Burger', price: 7500 }
    ]);
});

app.get('/api/v1/products/:id', (req, res) => {
    res.json({ id: req.params.id, name: 'Detailed Burger', price: 6000, description: 'Yummy burger with special sauce' });
});

// --- Cart ---
app.get('/api/v1/carts', (req, res) => {
    res.json({ items: [], totalPrice: 0 });
});

app.post('/api/v1/carts/items', (req, res) => {
    res.json({ success: true, message: 'Item added to cart' });
});

app.patch('/api/v1/carts/items/:itemId', (req, res) => {
    res.json({ success: true, message: 'Quantity updated' });
});

app.delete('/api/v1/carts/items/:itemId', (req, res) => {
    res.json({ success: true, message: 'Item removed from cart' });
});

app.delete('/api/v1/carts', (req, res) => {
    res.json({ success: true, message: 'Cart cleared' });
});

// --- Orders ---
app.post('/api/v1/orders', (req, res) => {
    res.json({ success: true, orderId: 'ORD-12345', message: 'Order created' });
});

app.get('/api/v1/orders', (req, res) => {
    res.json([
        { id: 'ORD-12345', date: '2026-01-14', total: 12000, status: 'Completed' }
    ]);
});

app.get('/api/v1/orders/:id', (req, res) => {
    res.json({ id: req.params.id, date: '2026-01-14', total: 12000, items: [], status: 'Completed' });
});

app.patch('/api/v1/orders/:id', (req, res) => {
    res.json({ success: true, message: 'Order status updated/cancelled' });
});

app.post('/api/v1/carts/reorder', (req, res) => {
    res.json({ success: true, message: 'Reordered items added to cart' });
});

// --- Address ---
app.get('/api/v1/addresses', (req, res) => {
    res.json([
        { id: 1, address: 'Seoul, Korea', isDefault: true }
    ]);
});

app.post('/api/v1/addresses', (req, res) => {
    res.json({ success: true, addressId: 2, message: 'Address added' });
});

app.put('/api/v1/addresses/:id', (req, res) => {
    res.json({ success: true, message: 'Address updated' });
});

app.delete('/api/v1/addresses/:id', (req, res) => {
    res.json({ success: true, message: 'Address deleted' });
});

app.patch('/api/v1/addresses/:id/default', (req, res) => {
    res.json({ success: true, message: 'Default address set' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
