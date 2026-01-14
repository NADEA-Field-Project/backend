-- NADEA Burger Database Schema

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255)
);

-- 3. Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image_url VARCHAR(255),
    is_recommended BOOLEAN DEFAULT FALSE,
    nutrition_info JSON, -- Calories, Sodium, etc.
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Cart Items Table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    options JSON, -- e.g. {"no_onion": true, "extra_cheese": 1}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 5. Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g. ORD-20260114-001
    user_id INT NOT NULL,
    total_price INT NOT NULL,
    status ENUM('Pending', 'Preparing', 'Delivering', 'Completed', 'Cancelled') DEFAULT 'Pending',
    address_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    options JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 7. Addresses Table
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    receiver_name VARCHAR(100),
    phone VARCHAR(20),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Initial Seed Data
INSERT INTO categories (name) VALUES ('Burger'), ('Side'), ('Drink'), ('Dessert');

INSERT INTO products (category_id, name, description, price, is_recommended) VALUES 
(1, 'NADEA Classic Burger', 'The original taste of NADEA.', 5500, true),
(1, 'Double Cheese Burger', 'Deeper cheese flavor with double patties.', 7500, true),
(2, 'French Fries', 'Crispy Golden Fries.', 2000, false),
(3, 'Coca Cola', 'Classic refreshing drink.', 1500, false);
