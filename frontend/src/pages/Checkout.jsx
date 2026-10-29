import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createOrder, createQRPayment } from "../api/api.js";
import QRPaymentModal from "../components/QRPaymentModal.jsx";

export default function Checkout() {
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("UPI_QR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSession, setPaymentSession] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    }
    if (cart.length === 0 && !paymentSession) {
      navigate("/cart");
    }
  }, [user, cart, paymentSession, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (paymentMethod === "UPI_QR") {
        // Generate UPI QR payment session
        const { data } = await createQRPayment({
          items: cart,
          totalAmount,
          shippingAddress: address,
        });

        if (data && data.success) {
          setPaymentSession(data);
        } else {
          setError(data.message || "Failed to initialize QR Payment.");
        }
      } else {
        // Cash on Delivery (COD)
        const orderData = {
          items: cart,
          totalAmount,
          shippingAddress: address,
          paymentMethod: "COD",
        };
        await createOrder(orderData);
        clearCart();
        navigate("/orders");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to proceed with order.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId) => {
    setPaymentSession(null);
    clearCart();
    navigate("/orders", { state: { newOrderId: orderId } });
  };

  const handlePaymentClose = () => {
    setPaymentSession(null);
  };

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  return (
    <div className="container section">
      <h2>Checkout</h2>
      <div className="checkout-grid">
        <div className="auth-card" style={{ maxWidth: "100%", margin: 0 }}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input type="text" name="name" value={address.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={address.phone} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Street Address</label>
              <textarea
                name="address"
                value={address.address}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "3px",
                  border: "1.5px solid var(--line)",
                  background: "var(--parchment)",
                }}
              ></textarea>
            </div>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input type="text" name="city" value={address.city} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Pincode</label>
                <input type="text" name="pincode" value={address.pincode} onChange={handleChange} required />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-method-section">
              <label className="field-label-heading">Select Payment Method</label>
              <div className="payment-options">
                <label className={`payment-option-card ${paymentMethod === "UPI_QR" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI_QR"
                    checked={paymentMethod === "UPI_QR"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-details">
                    <span className="payment-option-title">UPI QR Payment <span className="badge-recommended">Recommended</span></span>
                    <span className="payment-option-sub">Pay instantly via Google Pay, PhonePe, Paytm, or BHIM</span>
                  </div>
                </label>

                <label className={`payment-option-card ${paymentMethod === "COD" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-details">
                    <span className="payment-option-title">Cash on Delivery (COD)</span>
                    <span className="payment-option-sub">Pay in cash when your books arrive</span>
                  </div>
                </label>
              </div>
            </div>

            {error && <div className="form-msg error" style={{ marginTop: "16px" }}>{error}</div>}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: "20px" }}>
              {loading
                ? "Processing..."
                : paymentMethod === "UPI_QR"
                ? `Proceed to QR Payment (₹${totalAmount})`
                : `Place Order (₹${totalAmount})`}
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic QR Payment Modal */}
      {paymentSession && (
        <QRPaymentModal
          paymentData={paymentSession}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
