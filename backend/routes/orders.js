const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

// Shared fallback memory orders array if MongoDB service is offline
const memoryOrders = [];

// @route  POST /api/orders
// @desc   Place a new order (auth required)
router.post("/", auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    const orderData = {
      _id: isDbConnected ? new mongoose.Types.ObjectId() : `ORD_${Date.now()}`,
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      status: "confirmed",
      createdAt: new Date(),
    };

    let order = null;
    if (isDbConnected) {
      order = await Order.create(orderData);
    } else {
      memoryOrders.unshift(orderData);
      order = orderData;
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error placing order" });
  }
});

// @route  GET /api/orders/my
// @desc   Get logged-in user's orders
router.get("/my", auth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let orders = [];

    if (isDbConnected) {
      orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    } else {
      orders = memoryOrders.filter((o) => String(o.user) === String(req.user.id));
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error fetching orders" });
  }
});

// @route  GET /api/orders/:id
// @desc   Get single order detail
router.get("/:id", auth, async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let order = null;

    if (isDbConnected) {
      order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    } else {
      order = memoryOrders.find(
        (o) => String(o._id) === String(req.params.id) && String(o.user) === String(req.user.id)
      );
    }

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error fetching order" });
  }
});

module.exports = router;
