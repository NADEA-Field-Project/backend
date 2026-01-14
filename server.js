const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Initial Data (Mock DB) ---
let users = [];
let carts = [];
let orders = [];
let addresses = [];

// --- User & Auth ---
app.post('/api/v1/auth/signup', (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const newUser = { id: Date.now(), email, username, password };
    users.push(newUser);
    res.status(201).json({ success: true, message: 'Signup successful', data: { id: newUser.id, email: newUser.email } });
});

app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
        success: true,
        token: 'mock-jwt-token-' + user.id,
        user: { id: user.id, email: user.email, name: user.username }
    });
});

app.post('/api/v1/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

app.get('/api/v1/users/me', (req, res) => {
    // In a real app, this would use the JWT token to identify the user
    res.json({ id: 1, email: 'test@example.com', name: 'Test User', phone: '010-1234-5678' });
});

app.patch('/api/v1/users/me', (req, res) => {
    const { name, phone } = req.body;
    res.json({ success: true, message: 'Profile updated', data: { name, phone } });
});

// --- Products ---
app.get('/api/v1/categories', (req, res) => {
    res.json([
        { id: 1, name: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add' },
        { id: 2, name: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec' },
        { id: 3, name: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a' }
    ]);
});

app.get('/api/v1/products', (req, res) => {
    const { category_id } = req.query;
    let products = [
        { id: 1, categoryId: 1, name: 'NADEA Classic Burger', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
        { id: 2, categoryId: 1, name: 'Double Cheese Burger', price: 7500, imageUrl: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f' },
        { id: 3, categoryId: 2, name: 'French Fries', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec' }
    ];
    if (category_id) {
        products = products.filter(p => p.categoryId == category_id);
    }
    res.json(products);
});

app.get('/api/v1/products/recommendations', (req, res) => {
    res.json([
        { id: 1, name: 'NADEA Classic Burger', price: 5500, description: 'Our best seller!' }
    ]);
});

app.get('/api/v1/products/:id', (req, res) => {
    res.json({
        id: req.params.id,
        name: 'Detailed Burger',
        price: 6000,
        description: 'Premium beef patty with fresh vegetables.',
        nutrition: { calories: 550, protein: '25g', fat: '30g', sodium: '800mg' }
    });
});

// --- Cart ---
app.get('/api/v1/carts', (req, res) => {
    res.json({ items: carts, totalPrice: carts.reduce((acc, item) => acc + (item.price * item.quantity), 0) });
});

app.post('/api/v1/carts/items', (req, res) => {
    const { productId, quantity, options } = req.body;
    const newItem = { id: Date.now(), productId, quantity, options, price: 5000 }; // price should ideally come from products table
    carts.push(newItem);
    res.status(201).json({ success: true, message: 'Item added to cart', item: newItem });
});

app.patch('/api/v1/carts/items/:itemId', (req, res) => {
    const { quantity } = req.body;
    const item = carts.find(c => c.id == req.params.itemId);
    if (item) item.quantity = quantity;
    res.json({ success: true, message: 'Quantity updated' });
});

app.delete('/api/v1/carts/items/:itemId', (req, res) => {
    carts = carts.filter(c => c.id != req.params.itemId);
    res.json({ success: true, message: 'Item removed from cart' });
});

app.delete('/api/v1/carts', (req, res) => {
    carts = [];
    res.json({ success: true, message: 'Cart cleared' });
});

// --- Orders ---
app.post('/api/v1/orders', (req, res) => {
    const { addressId, items, totalPrice } = req.body;
    const newOrder = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        addressId,
        items,
        totalPrice,
        status: 'Pending'
    };
    orders.push(newOrder);
    carts = []; // Clear cart on successful order
    res.status(201).json({ success: true, orderId: newOrder.id, message: 'Order created' });
});

app.get('/api/v1/orders', (req, res) => {
    res.json(orders);
});

app.get('/api/v1/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    res.json(order || { message: 'Order not found' });
});

app.patch('/api/v1/orders/:id', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (order) order.status = status;
    res.json({ success: true, message: 'Order status updated' });
});

// --- Address ---
app.get('/api/v1/addresses', (req, res) => {
    res.json(addresses);
});

app.post('/api/v1/addresses', (req, res) => {
    const { receiverName, phone, addressLine1, addressLine2, isDefault } = req.body;
    const newAddress = { id: Date.now(), receiverName, phone, addressLine1, addressLine2, isDefault };
    if (isDefault) addresses.forEach(a => a.isDefault = false);
    addresses.push(newAddress);
    res.status(201).json({ success: true, data: newAddress });
});

app.put('/api/v1/addresses/:id', (req, res) => {
    const index = addresses.findIndex(a => a.id == req.params.id);
    if (index !== -1) {
        addresses[index] = { ...addresses[index], ...req.body };
    }
    res.json({ success: true, message: 'Address updated' });
});

app.delete('/api/v1/addresses/:id', (req, res) => {
    addresses = addresses.filter(a => a.id != req.params.id);
    res.json({ success: true, message: 'Address deleted' });
});

app.patch('/api/v1/addresses/:id/default', (req, res) => {
    addresses.forEach(a => a.isDefault = (a.id == req.params.id));
    res.json({ success: true, message: 'Default address set' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
