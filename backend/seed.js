require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

const sampleBooks = [
  { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", price: 799, mrp: 1299, stock: 15, rating: 4.7, coverColor: "#4f46e5", description: "The classic, comprehensive guide to algorithms used in top CS courses worldwide." },
  { title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", price: 499, mrp: 899, stock: 20, rating: 4.6, coverColor: "#0891b2", description: "A handbook of agile software craftsmanship for writing maintainable code." },
  { title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Computer Science", price: 650, mrp: 1050, stock: 12, rating: 4.4, coverColor: "#7c3aed", description: "Comprehensive coverage of database design and management systems." },
  { title: "Calculus: Early Transcendentals", author: "James Stewart", category: "Mathematics", price: 550, mrp: 950, stock: 18, rating: 4.3, coverColor: "#dc2626", description: "A widely used textbook covering single and multivariable calculus." },
  { title: "Linear Algebra Done Right", author: "Sheldon Axler", category: "Mathematics", price: 420, mrp: 700, stock: 10, rating: 4.5, coverColor: "#ea580c", description: "A theorem-driven approach to linear algebra for undergraduates." },
  { title: "Concepts of Physics Vol 1", author: "H.C. Verma", category: "Physics", price: 320, mrp: 450, stock: 25, rating: 4.8, coverColor: "#059669", description: "A staple physics textbook for engineering and science entrance prep." },
  { title: "University Physics", author: "Young & Freedman", category: "Physics", price: 890, mrp: 1450, stock: 8, rating: 4.5, coverColor: "#0d9488", description: "Comprehensive physics text covering mechanics, thermodynamics, and more." },
  { title: "Organic Chemistry", author: "Paula Yurkanis Bruice", category: "Chemistry", price: 710, mrp: 1150, stock: 9, rating: 4.2, coverColor: "#ca8a04", description: "In-depth exploration of organic chemistry reactions and mechanisms." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Literature", price: 199, mrp: 299, stock: 30, rating: 4.6, coverColor: "#9333ea", description: "A classic novel of the Jazz Age, a staple in literature courses." },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Literature", price: 180, mrp: 260, stock: 22, rating: 4.7, coverColor: "#db2777", description: "Austen's beloved novel of manners, marriage, and social class." },
  { title: "Principles of Marketing", author: "Philip Kotler", category: "Business", price: 599, mrp: 999, stock: 14, rating: 4.3, coverColor: "#2563eb", description: "The definitive guide to marketing principles used in business schools." },
  { title: "The Intelligent Investor", author: "Benjamin Graham", category: "Business", price: 349, mrp: 599, stock: 16, rating: 4.6, coverColor: "#16a34a", description: "A timeless guide to value investing and financial literacy." },
  { title: "GRE Prep Plus 2024", author: "Kaplan Test Prep", category: "Test Prep", price: 899, mrp: 1499, stock: 11, rating: 4.1, coverColor: "#c026d3", description: "Comprehensive strategies and practice tests for the GRE exam." },
  { title: "Barron's GMAT", author: "Barron's Educational Series", category: "Test Prep", price: 750, mrp: 1250, stock: 13, rating: 4.0, coverColor: "#e11d48", description: "In-depth GMAT preparation with practice questions and strategies." },
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "General", price: 399, mrp: 699, stock: 27, rating: 4.8, coverColor: "#f59e0b", description: "A sweeping narrative of human history recommended across disciplines." },
  { title: "Atomic Habits", author: "James Clear", category: "General", price: 349, mrp: 599, stock: 35, rating: 4.9, coverColor: "#10b981", description: "A practical guide to building good habits and breaking bad ones." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookstore");
    console.log("Connected to MongoDB for seeding...");

    await Book.deleteMany({});
    await Book.insertMany(sampleBooks);

    console.log(`Seeded ${sampleBooks.length} books successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
