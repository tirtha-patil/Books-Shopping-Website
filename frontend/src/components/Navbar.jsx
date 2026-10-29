import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          Chapter<span className="brand-mark">&</span>Verse
        </NavLink>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/catalogue" onClick={() => setOpen(false)}>
            Catalogue
          </NavLink>
          <NavLink to="/cart" onClick={() => setOpen(false)}>
            Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>
          {!user && (
            <NavLink to="/login" onClick={() => setOpen(false)}>
              Login
            </NavLink>
          )}
          {!user && (
            <NavLink to="/register" onClick={() => setOpen(false)}>
              Register
            </NavLink>
          )}
          {user && (
            <NavLink to="/orders" onClick={() => setOpen(false)}>
              Orders
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span style={{ fontSize: "0.88rem", color: "var(--ink)" }}>
                Hi, {user.name.split(" ")[0]}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">
              Sign In
            </NavLink>
          )}
          <button
            className="hamburger"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
