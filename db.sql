DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS product_category;
DROP TYPE IF EXISTS product_color;
DROP TYPE IF EXISTS product_brand;
DROP TYPE IF EXISTS roles;

CREATE TYPE product_category as ENUM ('laptop', 'smartphone', 'pc');
CREATE TYPE product_color as ENUM('white', 'black', 'grey');
CREATE TYPE product_brand as ENUM('apple', 'samsung', 'huawei');

CREATE TYPE roles AS ENUM('admin', 'common');

CREATE TABLE IF NOT EXISTS product 
(
    product_id serial PRIMARY KEY,
    product_name VARCHAR(50) NOT NULL,
    product_description TEXT,
    product_image TEXT,
    category product_category,
    brand product_brand,
    price NUMERIC(8, 2) NOT NULL CHECK (price >= 0),
    product_weight NUMERIC(8, 3) CHECK (product_weight >= 0),
    release_date DATE,
    color product_color,
    chipset TEXT,
    returnable BOOLEAN default TRUE
);

INSERT INTO product (product_name, product_description, product_image, price, category,
product_weight, color, release_date, brand, chipset, returnable) VALUES
('Iphone 8', 'Checkout a brand new smartphone from Apple.', 'apple-1.jpg', 3000, 'smartphone', 0.118, 'white', '2018-10-23', 'apple', 'A20 Octa-Core 3.5GHz, 256GB, 8GB RAM', TRUE),
('Iphone X', 'Hands up! Iphone X is here!!', 'apple-2.jpg', 3500, 'smartphone', 0.124, 'black', '2020-04-21', 'apple', 'A20 Quad-Core 2.7GHz, 128GB, 6GB RAM', TRUE),
('Iphone 7', 'Now ypu can be more active with the new Iphone', 'camera-1842202_640.jpg', 3900, 'smartphone', 0.110, 'white', '2019-10-23', 'apple', 'A18 Quad-Core 2.5GHz, 128GB, 4GB RAM', FALSE),
('Samsung Galaxy A20', 'Checkout the new Samsung Galaxy A20', 'hands-1851218_640.jpg', 2900, 'smartphone', 0.117, 'grey', '2017-07-14', 'samsung', 'Exynos Quad-Core 2.8GHz, 64GB, 6GB RAM', TRUE),
('Samsung Galaxy S10', 'What do you expect from tomorrow? A new Samsung, maybe? =)', 'samsung-1283938_640.jpg', 2100, 'smartphone', 0.115, 'white', '2018-09-10', 'samsung', 'Exynos Quad-Core 2.8GHz, 128GB, 8GB RAM', FALSE),
('Mackbook Pro', 'All you could ever need for daily work', 'office-1730939_640.jpg', 7400, 'laptop', 2.167, 'grey', '2020-11-23', 'apple', 'Intel i5 Octa-Core 2.2GHz, 512GB, 16GB RAM', FALSE),
('Apple Workstation', 'Get your job done with this powerful workstation.', 'apple-606761_640.jpg', 9500, 'pc', 15.250, 'white', '2018-05-29', 'apple', 'Intel i7 Octa-Core 3.7GHz, 2048GB, 32GB RAM', FALSE),
('Notebook Samsung Ideapad 320', 'You should have this laptop', 'instagram-1519537_640.jpg', 5500, 'laptop', 3.525, 'white', '2021-02-20', 'samsung', 'Intel i5 Quad-Core 2.8GHz, 512GB, 8GB RAM', TRUE),
('Iphone 6S', 'You can have one too!', 'iphone-410324_640.jpg', 4000, 'smartphone', 3.1, 'white', '2017-01-15', 'apple', 'A20 Quad-Core 2.9GHz, 128GB, 6GB RAM', TRUE);

CREATE TABLE IF NOT EXISTS users (
   id serial PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   first_name VARCHAR(100) NOT NULL,
   last_name VARCHAR(100) NOT NULL,
   passwd NCHAR(128) NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   user_role roles DEFAULT 'common',
   register_date TIMESTAMP DEFAULT current_timestamp,
   profile_picture VARCHAR(256) DEFAULT '/public/profiles/pictures/default.png'
);

-- GRANT USAGE, SELECT ON SEQUENCE product_id_seq to techaltar;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO techaltar;

GRANT ALL PRIVILEGES ON TABLE product to techaltar;
GRANT ALL PRIVILEGES ON TABLE users to techaltar;

-- CREATE TABLE IF NOT EXISTS accesari (
--    id serial PRIMARY KEY,
--    ip VARCHAR(100) NOT NULL,
--    user_id INT NULL REFERENCES utilizatori(id),
--    pagina VARCHAR(100) NOT NULL,
--    data_accesare TIMESTAMP DEFAULT current_timestamp
-- );