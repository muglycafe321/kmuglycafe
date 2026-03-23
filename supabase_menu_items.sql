-- Mugly Cafe Menu Items - Insert all items into Supabase
-- Run this in your Supabase SQL Editor

INSERT INTO menu_items (name, category, price, available) VALUES
-- ROLLS
('Paneer Roll', 'ROLLS', 75, true),
('Fried Roll', 'ROLLS', 70, true),
('Falafell Roll', 'ROLLS', 60, true),
('Sp. Falafel Roll', 'ROLLS', 80, true),
('Zinger Wrap', 'ROLLS', 115, true),
('Porotta Roll', 'ROLLS', 70, true),

-- LOADED FRIES
('Loaded Fries', 'LOADED FRIES', 190, true),
('Peri Peri Loaded', 'LOADED FRIES', 210, true),
('Special Loaded', 'LOADED FRIES', 230, true),

-- BURGER
('Chicken Burger', 'BURGER', 90, true),
('Crispy Double Burger', 'BURGER', 179, true),
('Veg Burger', 'BURGER', 80, true),
('Zinger Burger', 'BURGER', 110, true),
('Kids Burger', 'BURGER', 60, true),
('Aloo Tikka Burger', 'BURGER', 100, true),
('Falafel Burger', 'BURGER', 70, true),

-- MOMOS
('CH Steam Momos', 'MOMOS', 160, true),
('Shezwan Momos', 'MOMOS', 180, true),
('Thandoori Momos', 'MOMOS', 190, true),

-- PIZZA
('Normal Pizza', 'PIZZA', 220, true),
('Periperi Pizza', 'PIZZA', 240, true),
('BBQ Pizza', 'PIZZA', 249, true),
('Paneer Pizza', 'PIZZA', 220, true),
('Mashroom Pizza', 'PIZZA', 230, true),

-- SANDWICH
('Normal Sand Wich', 'SANDWICH', 99, true),
('Club Special Sand Wich', 'SANDWICH', 220, true),

-- PASTA
('Pasta', 'PASTA', 210, true),
('Pasta Special', 'PASTA', 260, true),

-- SHAKE
('Chickoo', 'SHAKE', 60, true),
('Sharjah', 'SHAKE', 60, true),
('Apple', 'SHAKE', 80, true),
('Anar', 'SHAKE', 80, true),
('Coctail', 'SHAKE', 60, true),
('Butter', 'SHAKE', 80, true),
('Tender Coconut', 'SHAKE', 70, true),
('Ice Cream Shake', 'SHAKE', 80, true),
('Mango', 'SHAKE', 70, true),
('Dry Fruits', 'SHAKE', 90, true),
('Dates & Rosted Cashew', 'SHAKE', 120, true),
('Custerd Apple', 'SHAKE', 70, true),
('Blueberry', 'SHAKE', 100, true),
('Strawberry', 'SHAKE', 90, true),
('Berry Mix', 'SHAKE', 120, true),
('Galaxy Shake', 'SHAKE', 80, true),
('Orio', 'SHAKE', 70, true),
('Kitkat', 'SHAKE', 80, true),
('Gems', 'SHAKE', 80, true),
('Dragon Fruitf', 'SHAKE', 90, true),

-- FRESH CREAM
('Custerd Cream', 'FRESH CREAM', 190, true),
('Apple Craem', 'FRESH CREAM', 190, true),
('Dry Fruit Cream', 'FRESH CREAM', 210, true),
('Mango Cream', 'FRESH CREAM', 190, true),
('Berry Mix Cream', 'FRESH CREAM', 240, true),
('Mixed Fruit Cream', 'FRESH CREAM', 220, true),
('Fruit With Choco', 'FRESH CREAM', 135, true),

-- FALOODA
('Dry Fruit Falooda', 'FALOODA', 180, true),
('Normal Falooda', 'FALOODA', 120, true),
('Royal Falooda', 'FALOODA', 140, true),
('Special Falooda', 'FALOODA', 180, true),
('Chocolate Falooda', 'FALOODA', 180, true),

-- ICE CREAM
('Scoop', 'ICE CREAM', 40, true),
('Special Scoop', 'ICE CREAM', 90, true),
('Cake With Icecream', 'ICE CREAM', 160, true),

-- MOJITTO
('Blueberry', 'MOJITTO', 80, true),
('Strawberry', 'MOJITTO', 80, true),
('Green Apple', 'MOJITTO', 80, true),
('Passion Fruit', 'MOJITTO', 80, true),
('Blue Curago', 'MOJITTO', 80, true),
('Mint', 'MOJITTO', 80, true),
('Watermelon', 'MOJITTO', 80, true),
('Mango', 'MOJITTO', 80, true),

-- LEMON
('Fresh Lime', 'LEMON', 20, true),
('Mint Lemon', 'LEMON', 25, true),
('Passion Fruit Lime', 'LEMON', 30, true),
('Green Apple Lime', 'LEMON', 30, true),
('Flavors Lime', 'LEMON', 30, true),

-- AVIL MILK
('Avil Milk', 'AVIL MILK', 70, true),
('Avil Milk With Dry Fruits', 'AVIL MILK', 90, true),
('Avil Milk Special', 'AVIL MILK', 110, true),

-- JUICE
('Orange', 'JUICE', 60, true),
('Musambi', 'JUICE', 60, true),
('Pappaya', 'JUICE', 60, true),
('Grape', 'JUICE', 60, true),
('Anar', 'JUICE', 60, true),
('Watermilon', 'JUICE', 60, true),
('Pineapple', 'JUICE', 60, true),
('Mango', 'JUICE', 60, true),

-- HOT
('Coffee', 'HOT', 15, true),
('SP Coffee', 'HOT', 30, true),
('Tea', 'HOT', 15, true),
('Lemon Tea', 'HOT', 15, true),
('Boost', 'HOT', 20, true),
('Horlics', 'HOT', 20, true),
('Badam Milk', 'HOT', 25, true),

-- SHAKE & TENDER COCONUT
('Cashew With Tender', 'SHAKE & TENDER COCONUT', 90, true),
('Dry Fruits With Tender', 'SHAKE & TENDER COCONUT', 100, true),
('Boost With Tender', 'SHAKE & TENDER COCONUT', 80, true),
('Dates With Tender', 'SHAKE & TENDER COCONUT', 90, true),
('Badam With Tender', 'SHAKE & TENDER COCONUT', 90, true),

-- CHICKEN ITEMS
('Special Fried 1pcs', 'CHICKEN ITEMS', 140, true),
('Chicken Lolly Pop', 'CHICKEN ITEMS', 160, true),
('Periperi Dianamic', 'CHICKEN ITEMS', 180, true),
('Shezwan Wings', 'CHICKEN ITEMS', 160, true),
('CH Nugets', 'CHICKEN ITEMS', 140, true),
('Chicken Strip', 'CHICKEN ITEMS', 160, true),
('Pop Chick', 'CHICKEN ITEMS', 130, true),
('Chicken Wings Normal', 'CHICKEN ITEMS', 140, true),

-- MAGGI
('Maggi', 'MAGGI', 60, true),
('Maaggi Special', 'MAGGI', 90, true),
('Chees Maggi', 'MAGGI', 140, true);
