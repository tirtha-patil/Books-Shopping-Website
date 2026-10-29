import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              Chapter<span className="brand-mark" style={{ color: "var(--gold)" }}>&</span>Verse
            </div>
            <p>
              A campus-first book store built for students — secondhand and new
              textbooks, novels, and exam prep, priced for student budgets.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catalogue">Catalogue</Link></li>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Track an order</a></li>
              <li><a href="#">Return policy</a></li>
              <li><a href="#">Sell your textbooks</a></li>
              <li><a href="#">Contact the desk</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Chapter & Verse Student Book Store</span>
          <span>Built with React · Node.js · MongoDB</span>
        </div>
      </div>
    </footer>
  );
}
