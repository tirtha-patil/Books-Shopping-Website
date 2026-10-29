import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMyOrders } from "../api/api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="container section">Loading orders...</div>;

  return (
    <div className="container section">
      <h2>Your Orders</h2>

      {newOrderId && (
        <div className="form-msg success" style={{ marginBottom: "24px" }}>
          ✓ Payment confirmed! Order <strong>#{newOrderId}</strong> has been successfully placed.
        </div>
      )}

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className="order-card"
              style={{
                background: "var(--paper-white)",
                padding: "20px",
                borderRadius: "4px",
                border: "1px solid var(--line)",
                marginBottom: "20px",
              }}
            >
              <div
                className="order-header"
                style={{
                  display: "flex",
                  justify: "space-between",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: "12px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <span className="eyebrow" style={{ marginBottom: 0 }}>
                    Order #{order._id}
                  </span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#6b6659" }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {order.transactionId && (
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--sage)" }}>
                      Transaction ID: <strong>{order.transactionId}</strong>
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                    <span className="payment-badge">
                      {order.paymentMethod === "UPI_QR" ? "📱 UPI QR" : "💵 COD"}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--stamp)",
                        textTransform: "uppercase",
                        fontSize: "0.85rem",
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1.15rem", marginTop: "4px" }}>
                    ₹{order.totalAmount?.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="order-items" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                    <span>
                      {item.quantity}x <strong>{item.title}</strong>
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
