USE nadea_burger_db;

-- 카테고리
INSERT INTO categories (id, name, image_url) VALUES
(1, 'Burger', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add'),
(2, 'Sides', 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec'),
(3, 'Drinks', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a'),
(4, 'Dessert', 'https://images.unsplash.com/photo-1551024601-bec78aea704b');

-- 상품
INSERT INTO products (category_id, name, description, price, image_url, is_recommended, nutrition_info) VALUES
(1, 'NADEA Classic Burger', 'NADEA의 시그니처 오리지널 버거입니다.', 5500, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true, '{"calories": 450, "protein": "20g"}'),
(1, 'Double Cheese Burger', '더블 패티와 진한 치즈의 풍미를 느껴보세요.', 7500, 'https://images.unsplash.com/photo-1512152272829-e3139592d56f', true, '{"calories": 680, "protein": "35g"}'),
(2, 'French Fries', '겉바속촉 골든 감자튀김입니다.', 2000, 'https://images.unsplash.com/photo-1573016608244-7d5e271367ec', false, '{"calories": 320, "protein": "3g"}'),
(3, 'Coca Cola', '시원하고 청량한 코카콜라.', 1500, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', false, '{"calories": 140, "protein": "0g"}');
