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

// Mock Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    // For prototype purposes, just success
    res.json({
        success: true,
        token: 'mock-jwt-token-12345',
        user: {
            id: 1,
            email: email,
            name: 'Test user'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
