-- ============================================
-- Student Online Book Store - MySQL Schema
-- Use this if you prefer MySQL/Oracle instead of MongoDB.
-- ============================================

CREATE DATABASE IF NOT EXISTS bookstore;
USE bookstore;

-- Users / Students table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    college VARCHAR(150),
    course VARCHAR(100),
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Books / Catalogue table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2),
    stock INT DEFAULT 10,
    rating DECIMAL(2,1) DEFAULT 4.0,
    cover_color VARCHAR(20) DEFAULT '#4f46e5',
    description TEXT,
    isbn VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (optional extension)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Sample seed data
INSERT INTO books (title, author, category, price, mrp, stock, rating, cover_color, description) VALUES
('Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', 'Computer Science', 799, 1299, 15, 4.7, '#4f46e5', 'The classic, comprehensive guide to algorithms used in top CS courses worldwide.'),
('Clean Code', 'Robert C. Martin', 'Computer Science', 499, 899, 20, 4.6, '#0891b2', 'A handbook of agile software craftsmanship for writing maintainable code.'),
('Concepts of Physics Vol 1', 'H.C. Verma', 'Physics', 320, 450, 25, 4.8, '#059669', 'A staple physics textbook for engineering and science entrance prep.'),
('Calculus: Early Transcendentals', 'James Stewart', 'Mathematics', 550, 950, 18, 4.3, '#dc2626', 'A widely used textbook covering single and multivariable calculus.'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Literature', 199, 299, 30, 4.6, '#9333ea', 'A classic novel of the Jazz Age, a staple in literature courses.'),
('Atomic Habits', 'James Clear', 'General', 349, 599, 35, 4.9, '#10b981', 'A practical guide to building good habits and breaking bad ones.');
