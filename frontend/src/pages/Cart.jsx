import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container section">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any books yet.</p>
        <Link to="/catalogue" className="btn btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-head">
        <h2>Your Cart</h2>
        <button className="btn btn-ghost" onClick={clearCart}>Clear Cart</button>
      </div>

      <div className="cart-grid">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.book} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.title}</h4>
                <p>by {item.author}</p>
                <div className="price">₹{item.price}</div>
              </div>
              <div className="cart-actions">
                <button onClick={() => updateQuantity(item.book, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.book, item.quantity + 1)}>+</button>
                <button className="remove-btn" onClick={() => removeFromCart(item.book)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
