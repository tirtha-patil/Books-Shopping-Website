const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, required: true },
  author: { type: String },
  coverColor: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.Mixed, required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "confirmed",
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },
    paymentMethod: { type: String, default: "COD" },
    paymentId: { type: mongoose.Schema.Types.Mixed },
    transactionId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
