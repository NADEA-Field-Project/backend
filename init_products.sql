-- 1. 데이터베이스 선택
USE nadea_burger_db;

-- 2. 외래 키 체크 비활성화 (테이블 삭제 및 생성을 위해)
SET FOREIGN_KEY_CHECKS = 0;

-- 3. 기존 테이블 삭제 (필요한 경우만 실행하도록 주석 처리하거나 IF EXISTS 사용)
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS categories;

-- 4. 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 상품 테이블 생성
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image_url VARCHAR(255),
    is_recommended BOOLEAN DEFAULT FALSE,
    nutrition_info JSON,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- 6. 카테고리 초기 데이터 (이미 존재하면 무시)
INSERT IGNORE INTO categories (id, name, image_url) VALUES
(1, 'Burger', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add'),
(2, 'Sides', 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec'),
(3, 'Drinks', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a'),
(4, 'Dessert', 'https://images.unsplash.com/photo-1551024601-bec78aea704b');

-- 7. 상품 초기 데이터 (이미 존재하면 무시)
-- 주의: image_url은 최신 로컬 경로를 반영했습니다.
INSERT IGNORE INTO products (id, category_id, name, description, price, image_url, is_recommended, nutrition_info) VALUES
(1, 1, 'NADEA Classic Burger', 'NADEA의 시그니처 오리지널 버거입니다.', 5500, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 1, '{"calories": 450, "protein": "20g"}'),
(2, 1, 'Double Cheese Burger', '더블 패티와 진한 치즈의 풍미를 느껴보세요.', 7500, 'https://images.unsplash.com/photo-1512152272829-e3139592d56f', 1, '{"calories": 680, "protein": "35g"}'),
(3, 2, 'French Fries', '겉바속촉 골든 감자튀김입니다.', 2000, '/uploads/products/french_fries.png', 0, '{"calories": 320, "protein": "3g"}'),
(4, 3, 'Coca Cola', '시원하고 청량한 코카콜라.', 1500, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', 0, '{"calories": 140, "protein": "0g"}'),
(5, 1, 'Bacon Avocado Burger', '훈제 베이컨과 부드러운 아보카도의 환상적인 조화.', 8500, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5', 1, '{"calories": 720, "protein": "28g"}'),
(6, 1, 'Spicy Chicken Burger', '매콤한 시즈닝의 치킨 패티가 일품인 버거.', 6500, '/uploads/products/spicy_chicken_burger.png', 0, '{"calories": 550, "protein": "25g"}'),
(7, 1, 'Mushroom Swiss Burger', '풍미 가득한 버섯과 스위스 치즈의 만남.', 7000, '/uploads/products/mushroom_swiss_burger.png', 0, '{"calories": 610, "protein": "22g"}'),
(8, 2, 'Onion Rings', '바삭하게 튀겨낸 달콤한 양파링.', 3000, 'https://images.unsplash.com/photo-1639024471283-03518883512d', 0, '{"calories": 410, "protein": "5g"}'),
(9, 2, 'Cheese Sticks', '쭉쭉 늘어나는 고소한 모짜렐라 치즈스틱.', 2500, '/uploads/products/cheese_sticks.png', 0, '{"calories": 380, "protein": "12g"}'),
(10, 3, 'Sprite', '상쾌한 레몬라임 향의 스프라이트.', 1500, '/uploads/products/sprite.png', 0, '{"calories": 130, "protein": "0g"}'),
(11, 4, 'Vanilla Shake', '진하고 부드러운 바닐라 쉐이크.', 3500, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', 0, '{"calories": 480, "protein": "8g"}');

-- 8. 확인
SELECT p.id, c.name AS category, p.name, p.price, p.image_url 
FROM products p 
JOIN categories c ON p.category_id = c.id;
