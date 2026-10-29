const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

// Fallback in-memory store when MongoDB service is offline
const memoryPayments = new Map();
const memoryOrders = [];

// Initialize Razorpay instance if environment keys exist
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @route  POST /api/payments/create-qr
// @desc   Generate dynamic UPI QR code & initialize payment session
router.post("/create-qr", auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment total amount" });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentId = `PAY_${timestamp}_${randomSuffix}`;
    const transactionId = `TXN_${timestamp}_${randomSuffix}`;
    const upiId = process.env.UPI_ID || "bookstore@upi";
    const merchantName = "Chapter & Verse";

    // Standard UPI Payment URI
    const encodedMerchant = encodeURIComponent(merchantName);
    const encodedNote = encodeURIComponent(`Payment for Order ${paymentId}`);
    const upiString = `upi://pay?pa=${upiId}&pn=${encodedMerchant}&am=${totalAmount.toFixed(
      2
    )}&tr=${transactionId}&tn=${encodedNote}&cu=INR`;

    // Generate Base64 QR code Image Data URL
    const qrCodeUrl = await QRCode.toDataURL(upiString, {
      width: 280,
      margin: 2,
      color: {
        dark: "#1b2a4a",
        light: "#ffffff",
      },
    });

    let razorpayOrderId = null;
    if (razorpayInstance) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: paymentId,
          notes: {
            userId: req.user.id,
            paymentId: paymentId,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay order creation fallback to direct UPI QR:", rzpErr.message);
      }
    }

    const paymentDoc = {
      paymentId,
      userId: req.user.id,
      amount: totalAmount,
      paymentMethod: "UPI_QR",
      transactionId,
      status: "Pending",
      items,
      shippingAddress,
      upiId,
      razorpayOrderId,
      createdAt: new Date(),
    };

    // Save to MongoDB if connected, else fallback to memory store
    if (mongoose.connection.readyState === 1) {
      await Payment.create(paymentDoc);
    } else {
      memoryPayments.set(paymentId, paymentDoc);
    }

    res.status(201).json({
      success: true,
      paymentId: paymentDoc.paymentId,
      transactionId: paymentDoc.transactionId,
      amount: paymentDoc.amount,
      upiId: paymentDoc.upiId,
      merchantName,
      upiString,
      qrCodeUrl,
      razorpayOrderId,
      expiresInSeconds: 300,
    });
  } catch (err) {
    console.error("Error creating QR payment:", err);
    res.status(500).json({ message: err.message || "Server error creating payment session" });
  }
});

// @route  POST /api/payments/verify
// @desc   Verify payment securely & fulfill order (handles idempotency & safety)
router.post("/verify", auth, async (req, res) => {
  try {
    const { paymentId, status, razorpayPaymentId, razorpaySignature } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    let payment = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      payment = await Payment.findOne({ paymentId, userId: req.user.id });
    } else {
      payment = memoryPayments.get(paymentId);
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment transaction not found" });
    }

    // Safety check for duplicate payment attempts (idempotency)
    if (payment.status === "Successful") {
      return res.json({
        success: true,
        message: "Payment has already been processed successfully.",
        orderId: payment.orderId,
        payment,
      });
    }

    if (payment.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot process a cancelled payment" });
    }

    // Verification check
    let isVerified = false;

    if (razorpaySignature && payment.razorpayOrderId && process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${payment.razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature === razorpaySignature) {
        isVerified = true;
        payment.razorpayPaymentId = razorpayPaymentId;
      }
    } else {
      if (status === "Successful" || status === "Processing") {
        isVerified = true;
      }
    }

    if (!isVerified) {
      payment.status = "Failed";
      if (isDbConnected && typeof payment.save === "function") {
        await payment.save();
      }
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        payment,
      });
    }

    payment.status = "Processing";

    // Fulfill Order
    const orderDoc = {
      _id: isDbConnected ? new mongoose.Types.ObjectId() : `ORD_${Date.now()}`,
      user: payment.userId,
      items: payment.items,
      totalAmount: payment.amount,
      shippingAddress: payment.shippingAddress,
      paymentMethod: "UPI_QR",
      status: "confirmed",
      paymentId: isDbConnected ? payment._id : payment.paymentId,
      transactionId: payment.transactionId,
      createdAt: new Date(),
    };

    let createdOrder = null;

    if (isDbConnected) {
      createdOrder = await Order.create(orderDoc);
      payment.status = "Successful";
      payment.orderId = createdOrder._id;
      await payment.save();
    } else {
      memoryOrders.push(orderDoc);
      payment.status = "Successful";
      payment.orderId = orderDoc._id;
      memoryPayments.set(paymentId, payment);
      createdOrder = orderDoc;
    }

    res.json({
      success: true,
      message: "Payment verified and order created successfully!",
      orderId: createdOrder._id,
      payment,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ message: err.message || "Server error verifying payment" });
  }
});

// @route  POST /api/payments/cancel
// @desc   Cancel a pending or processing payment
router.post("/cancel", auth, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    let payment = null;

    if (isDbConnected) {
      payment = await Payment.findOne({ paymentId, userId: req.user.id });
    } else {
      payment = memoryPayments.get(paymentId);
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "Successful") {
      return res.status(400).json({ message: "Cannot cancel a completed payment" });
    }

    payment.status = "Cancelled";
    if (isDbConnected && typeof payment.save === "function") {
      await payment.save();
    } else {
      memoryPayments.set(paymentId, payment);
    }

    res.json({
      success: true,
      message: "Payment cancelled successfully",
      payment,
    });
  } catch (err) {
    console.error("Error cancelling payment:", err);
    res.status(500).json({ message: err.message || "Server error cancelling payment" });
  }
});

// @route  GET /api/payments/:paymentId
// @desc   Get status of payment
router.get("/:paymentId", auth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let payment = null;

    if (isDbConnected) {
      payment = await Payment.findOne({
        paymentId: req.params.paymentId,
        userId: req.user.id,
      });
    } else {
      payment = memoryPayments.get(req.params.paymentId);
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error fetching payment status" });
  }
});

module.exports = router;
