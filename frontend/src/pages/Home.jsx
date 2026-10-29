import React from "react";
import { Link } from "react-router-dom";

const spineBooks = [
  { title: "Algorithms", color: "#4f46e5" },
  { title: "Calculus II", color: "#dc2626" },
  { title: "Organic Chem", color: "#ca8a04" },
  { title: "Gatsby", color: "#9333ea" },
  { title: "Physics I", color: "#059669" },
  { title: "Marketing 101", color: "#2563eb" },
  { title: "Atomic Habits", color: "#10b981" },
];

const categories = [
  { icon: "💻", name: "Computer Science", desc: "Algorithms, systems, and code" },
  { icon: "∑", name: "Mathematics", desc: "Calculus, algebra & statistics" },
  { icon: "⚛", name: "Physics & Chemistry", desc: "Lab manuals & core texts" },
  { icon: "📖", name: "Literature", desc: "Novels, poetry & classics" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Student Book Store</span>
            <h1>
              Textbooks that don't <em>break the bank</em>, delivered to campus.
            </h1>
            <p className="lead">
              Chapter & Verse stocks the exact editions your syllabus asks for —
              new and used — alongside the novels and prep guides you actually
              want to read. Built by students, priced for students.
            </p>
            <div className="hero-actions">
              <Link to="/catalogue" className="btn btn-primary">
                Browse the Catalogue
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Create Student Account
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">1,200+</div>
                <div className="label">Titles in stock</div>
              </div>
              <div className="hero-stat">
                <div className="num">40%</div>
                <div className="label">Avg. student savings</div>
              </div>
              <div className="hero-stat">
                <div className="num">30+</div>
                <div className="label">Campuses served</div>
              </div>
            </div>
          </div>

          <div className="shelf" aria-hidden="true">
            {spineBooks.map((b, i) => (
              <div
                key={b.title}
                className="spine"
                style={{
                  background: b.color,
                  height: `${58 + ((i * 37) % 40)}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {b.title}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Shop by subject</h2>
              <p>Jump straight to the shelf you need this semester.</p>
            </div>
            <Link to="/catalogue" className="btn btn-ghost">
              View full catalogue
            </Link>
          </div>
          <div className="category-band">
            {categories.map((c) => (
              <Link to="/catalogue" className="category-card" key={c.name}>
                <span className="icon">{c.icon}</span>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2>How it works</h2>
              <p>From registration to your reading list, in three steps.</p>
            </div>
          </div>
          <div className="steps">
            <div className="step-card">
              <span className="step-num">STEP 01</span>
              <h4>Register with your student email</h4>
              <p>Set up your account and add your college and course, so we can surface the right editions.</p>
            </div>
            <div className="step-card">
              <span className="step-num">STEP 02</span>
              <h4>Search the catalogue</h4>
              <p>Filter by subject, search by title or author, and compare prices against the cover MRP.</p>
            </div>
            <div className="step-card">
              <span className="step-num">STEP 03</span>
              <h4>Check out and study</h4>
              <p>Add books to your order and get them delivered to your hostel or campus pickup point.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Got a stack of last semester's books?</h2>
              <p>Sell them back to fellow students and fund this semester's list.</p>
            </div>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
