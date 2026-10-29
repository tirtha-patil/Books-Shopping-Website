import React from "react";
import { useCart } from "../context/CartContext.jsx";

export default function BookCard({ book }) {
  const { addToCart } = useCart();

  return (
    <article className="book-card">
      <div className="book-cover" style={{ background: book.coverColor || "#4f46e5" }}>
        <span className="cat-tag">{book.category}</span>
        {book.title}
      </div>
      <div className="book-info">
        <div className="title">{book.title}</div>
        <div className="author">by {book.author}</div>
        <div className="rating">★ {book.rating?.toFixed(1) ?? "4.0"} rating</div>
        <div className="price-row">
          <div>
            <span className="price">₹{book.price}</span>
            {book.mrp && <span className="mrp">₹{book.mrp}</span>}
          </div>
          <button className="btn btn-primary" onClick={() => addToCart(book)}>Add</button>
        </div>
      </div>
    </article>
  );
}
