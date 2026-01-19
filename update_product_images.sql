-- Update product image URLs to use local images
-- Run this SQL script after copying the product images to uploads/products/ folder

-- French Fries
UPDATE products 
SET image_url = '/uploads/products/french_fries.png' 
WHERE id = 3;

-- Spicy Chicken Burger
UPDATE products 
SET image_url = '/uploads/products/spicy_chicken_burger.png' 
WHERE id = 6;

-- Mushroom Swiss Burger
UPDATE products 
SET image_url = '/uploads/products/mushroom_swiss_burger.png' 
WHERE id = 7;

-- Cheese Sticks
UPDATE products 
SET image_url = '/uploads/products/cheese_sticks.png' 
WHERE id = 9;

-- Sprite
UPDATE products 
SET image_url = '/uploads/products/sprite.png' 
WHERE id = 10;

-- Verify the updates
SELECT id, name, image_url 
FROM products 
WHERE id IN (3, 6, 7, 9, 10)
ORDER BY id;
