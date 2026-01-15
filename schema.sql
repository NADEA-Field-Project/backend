-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS nadea_burger_db;
USE nadea_burger_db;

-- 2. 기존 테이블 삭제 (초기화용)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. 사용자 테이블 (Users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 카테고리 테이블 (Categories)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 상품 테이블 (Products)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image_url VARCHAR(255),
    is_recommended BOOLEAN DEFAULT FALSE,
    nutrition_info JSON, -- 칼로리, 단백질 등 정보 저장
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 장바구니 테이블 (Cart Items)
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    options JSON, -- 예: {"no_onion": true, "extra_cheese": 1}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 주문 테이블 (Orders)
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY, -- 예: ORD-20260114-001
    user_id INT NOT NULL,
    total_price INT NOT NULL,
    status ENUM('Pending', 'Preparing', 'Delivering', 'Completed', 'Cancelled') DEFAULT 'Pending',
    address_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 주문 상세 품목 테이블 (Order Items)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    options JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. 배송지 테이블 (Addresses)
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    receiver_name VARCHAR(100),
    phone VARCHAR(20),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. 결제 수단 테이블 (Payment Methods)
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_name VARCHAR(50) NOT NULL, -- 예: 국민카드, 현대카드
    card_number VARCHAR(20) NOT NULL, -- 마스킹된 번호 예: **** **** **** 1234
    card_type VARCHAR(20), -- 예: Credit, Debit
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. 초기 샘플 데이터 삽입 (Seed Data)
-- 카테고리
INSERT INTO categories (id, name, image_url) VALUES
(1, 'Burger', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add'),
(2, 'Sides', 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec'),
(3, 'Drinks', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a'),
(4, 'Dessert', 'https://images.unsplash.com/photo-1551024601-bec78aea704b');

-- 상품
INSERT INTO products (category_id, name, description, price, image_url, is_recommended, nutrition_info) VALUES
(1, 'NADEA Classic Burger', 'NADEA의 시그니처 오리지널 버거입니다.', 5500, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 1, '{"calories": 450, "protein": "20g"}'),
(1, 'Double Cheese Burger', '더블 패티와 진한 치즈의 풍미를 느껴보세요.', 7500, 'https://images.unsplash.com/photo-1512152272829-e3139592d56f', 1, '{"calories": 680, "protein": "35g"}'),
(2, 'French Fries', '겉바속촉 골든 감자튀김입니다.', 2000, 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec', 0, '{"calories": 320, "protein": "3g"}'),
(3, 'Coca Cola', '시원하고 청량한 코카콜라.', 1500, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', 0, '{"calories": 140, "protein": "0g"}'),
(4, 'Vanilla Ice Cream', '부드러운 바닐라 아이스크림입니다.', 1500, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371', 0, '{"calories": 210, "protein": "4g"}');

-- 테스트 유저 (비밀번호: test1234)
INSERT INTO users (email, username, password, phone) VALUES
('test@example.com', '테스트유저', '$2b$10$pjCpibXdf3BawPMyP8PemeeKsfN1GRw77XebzaIjCALQWmj.cqM29K', '010-1234-5678');
