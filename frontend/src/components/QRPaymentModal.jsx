import React, { useState, useEffect } from "react";
import { verifyPayment, cancelPayment } from "../api/api";

export default function QRPaymentModal({ paymentData, onSuccess, onClose }) {
  const [timeLeft, setTimeLeft] = useState(paymentData?.expiresInSeconds || 300);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState("Pending"); // Pending, Processing, Successful, Failed, Cancelled
  const [errorMsg, setErrorMsg] = useState("");

  // Countdown timer effect
  useEffect(() => {
    if (status !== "Pending") return;

    if (timeLeft <= 0) {
      handleAutoExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const handleAutoExpire = async () => {
    setStatus("Cancelled");
    setErrorMsg("Payment session expired. Please try again.");
    try {
      await cancelPayment({ paymentId: paymentData.paymentId });
    } catch (e) {
      console.error("Auto-expire cancellation error:", e);
    }
  };

  const handleCopyUPI = () => {
    if (paymentData?.upiId) {
      navigator.clipboard.writeText(paymentData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleCompletePayment = async () => {
    setVerifying(true);
    setStatus("Processing");
    setErrorMsg("");

    try {
      const response = await verifyPayment({
        paymentId: paymentData.paymentId,
        status: "Successful",
      });

      if (response.data?.success) {
        setStatus("Successful");
        setTimeout(() => {
          onSuccess(response.data.orderId);
        }, 1200);
      } else {
        setStatus("Failed");
        setErrorMsg(response.data?.message || "Payment verification failed. Please check your transaction.");
      }
    } catch (err) {
      setStatus("Failed");
      setErrorMsg(err.response?.data?.message || "Server error verifying payment. Please retry.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelPayment({ paymentId: paymentData.paymentId });
      setStatus("Cancelled");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error("Cancel payment failed", err);
      onClose();
    } finally {
      setCancelling(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!paymentData) return null;

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        <div className="qr-modal-header">
          <div className="qr-brand-badge">
            <span className="brand-mark">C&V</span> Payment Gateway
          </div>
          <button className="qr-close-btn" onClick={handleCancel} disabled={verifying || cancelling}>
            &times;
          </button>
        </div>

        <div className="qr-modal-body">
          {/* Merchant & Amount Banner */}
          <div className="qr-amount-banner">
            <div className="qr-merchant-info">
              <span className="qr-label">Merchant</span>
              <span className="qr-merchant-name">{paymentData.merchantName || "Chapter & Verse"}</span>
            </div>
            <div className="qr-price-info">
              <span className="qr-label">Amount Payable</span>
              <span className="qr-price-val">₹{paymentData.amount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`qr-status-pill status-${status.toLowerCase()}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {status === "Pending" && `Payment Pending — Expires in ${formatTime(timeLeft)}`}
              {status === "Processing" && "Verifying Payment with Gateway..."}
              {status === "Successful" && "Payment Successful! Redirecting..."}
              {status === "Failed" && "Payment Verification Failed"}
              {status === "Cancelled" && "Payment Cancelled"}
            </span>
          </div>

          {errorMsg && <div className="form-msg error" style={{ margin: "12px 0" }}>{errorMsg}</div>}

          {/* QR Code Container */}
          {status !== "Successful" && (
            <div className="qr-code-frame">
              {paymentData.qrCodeUrl ? (
                <img src={paymentData.qrCodeUrl} alt="UPI Payment QR Code" className="qr-img" />
              ) : (
                <div className="qr-placeholder">Generating QR Code...</div>
              )}
              <p className="qr-scan-hint">Scan with Google Pay, PhonePe, Paytm, or any UPI App</p>
            </div>
          )}

          {/* UPI Copy Box */}
          <div className="qr-upi-box">
            <div className="qr-upi-details">
              <span className="qr-upi-label">UPI ID:</span>
              <span className="qr-upi-val">{paymentData.upiId}</span>
            </div>
            <button
              type="button"
              className={`qr-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopyUPI}
            >
              {copied ? "Copied ✓" : "Copy UPI ID"}
            </button>
          </div>

          <div className="qr-meta-info">
            <span>Transaction ID: <strong>{paymentData.transactionId}</strong></span>
            <span>Payment ID: <strong>{paymentData.paymentId}</strong></span>
          </div>

          {/* Actions */}
          <div className="qr-modal-actions">
            {status === "Successful" ? (
              <div className="qr-success-message">
                <span className="success-icon">✓</span>
                <p>Order Placed Successfully!</p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={handleCompletePayment}
                  disabled={verifying || cancelling || status === "Cancelled" || timeLeft <= 0}
                >
                  {verifying ? (
                    <span className="btn-spinner-wrap">
                      <span className="spinner"></span> Verifying Payment...
                    </span>
                  ) : (
                    "I've Completed Payment"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={handleCancel}
                  disabled={verifying || cancelling}
                  style={{ marginTop: "8px" }}
                >
                  {cancelling ? "Cancelling..." : "Cancel Payment"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
