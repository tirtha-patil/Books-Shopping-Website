const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/Book");
const auth = require("../middleware/auth");

const router = express.Router();

const fallbackBooks = [
  { _id: "b1", title: "Introduction to Algorithms", author: "Cormen et al.", category: "Computer Science", price: 799, mrp: 1299, rating: 4.7, coverColor: "#4f46e5" },
  { _id: "b2", title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", price: 499, mrp: 899, rating: 4.6, coverColor: "#0891b2" },
  { _id: "b3", title: "Concepts of Physics Vol 1", author: "H.C. Verma", category: "Physics", price: 320, mrp: 450, rating: 4.8, coverColor: "#059669" },
  { _id: "b4", title: "Calculus: Early Transcendentals", author: "James Stewart", category: "Mathematics", price: 550, mrp: 950, rating: 4.3, coverColor: "#dc2626" },
  { _id: "b5", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Literature", price: 199, mrp: 299, rating: 4.6, coverColor: "#9333ea" },
  { _id: "b6", title: "Atomic Habits", author: "James Clear", category: "General", price: 349, mrp: 599, rating: 4.9, coverColor: "#10b981" },
];

// @route  GET /api/books
// @desc   Get all books (supports ?search= & ?category=)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const filter = {};
      if (category && category !== "All") {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ];
      }
      const books = await Book.find(filter).sort({ createdAt: -1 });
      return res.json(books);
    } else {
      let filtered = fallbackBooks;
      if (category && category !== "All") {
        filtered = filtered.filter((b) => b.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
        );
      }
      return res.json(filtered);
    }
  } catch (err) {
    console.error("Error fetching books:", err);
    res.json(fallbackBooks);
  }
});

// @route  GET /api/books/:id
router.get("/:id", async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const book = await Book.findById(req.params.id);
      if (book) return res.json(book);
    }
    const fallback = fallbackBooks.find((b) => b._id === req.params.id);
    if (!fallback) return res.status(404).json({ message: "Book not found" });
    res.json(fallback);
  } catch (err) {
    const fallback = fallbackBooks.find((b) => b._id === req.params.id);
    if (!fallback) return res.status(404).json({ message: "Book not found" });
    res.json(fallback);
  }
});

// @route  POST /api/books (protected)
router.post("/", auth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const book = await Book.create(req.body);
      return res.status(201).json(book);
    }
    const newBook = { _id: `b_${Date.now()}`, ...req.body };
    fallbackBooks.unshift(newBook);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error creating book" });
  }
});

module.exports = router;
