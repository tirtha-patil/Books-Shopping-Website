import React, { useEffect, useState, useCallback } from "react";
import { getBooks } from "../api/api.js";
import BookCard from "../components/BookCard.jsx";

const categories = [
  "All",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Literature",
  "Business",
  "Test Prep",
  "General",
];

// Fallback sample data so the page still demos nicely before the backend
// is connected / seeded.
const fallbackBooks = [
  { _id: "f1", title: "Introduction to Algorithms", author: "Cormen et al.", category: "Computer Science", price: 799, mrp: 1299, rating: 4.7, coverColor: "#4f46e5" },
  { _id: "f2", title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", price: 499, mrp: 899, rating: 4.6, coverColor: "#0891b2" },
  { _id: "f3", title: "Concepts of Physics Vol 1", author: "H.C. Verma", category: "Physics", price: 320, mrp: 450, rating: 4.8, coverColor: "#059669" },
  { _id: "f4", title: "Calculus: Early Transcendentals", author: "James Stewart", category: "Mathematics", price: 550, mrp: 950, rating: 4.3, coverColor: "#dc2626" },
  { _id: "f5", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Literature", price: 199, mrp: 299, rating: 4.6, coverColor: "#9333ea" },
  { _id: "f6", title: "Atomic Habits", author: "James Clear", category: "General", price: 349, mrp: 599, rating: 4.9, coverColor: "#10b981" },
];

export default function Catalogue() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      const { data } = await getBooks(params);
      setBooks(data);
      setUsingFallback(false);
    } catch (err) {
      // Backend not reachable yet — show fallback sample data so the UI
      // still demonstrates the full catalogue experience.
      const filtered = fallbackBooks.filter((b) => {
        const matchesCategory = category === "All" || b.category === category;
        const matchesSearch =
          !search ||
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      setBooks(filtered);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  return (
    <>
      <div className="catalogue-header">
        <div className="container">
          <span className="eyebrow">Full Catalogue</span>
          <h1>Find the exact edition your syllabus needs.</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
            <button className="btn btn-primary" onClick={fetchBooks}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container catalogue-body">
        <aside className="filter-panel">
          <h3>Subjects</h3>
          <ul className="filter-list">
            {categories.map((c) => (
              <li key={c}>
                <button
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          {usingFallback && (
            <div className="form-msg error" style={{ marginBottom: 20 }}>
              Showing sample data — connect the Express/MongoDB backend
              (see /backend) to load the live catalogue.
            </div>
          )}

          {loading ? (
            <div className="loading-state">Loading catalogue…</div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <h3>No books match your search</h3>
              <p>Try a different title, author, or subject filter.</p>
            </div>
          ) : (
            <>
              <div className="result-count">{books.length} titles found</div>
              <div className="book-grid">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
