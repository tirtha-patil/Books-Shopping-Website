const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI_QR" },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Successful", "Failed", "Cancelled"],
      default: "Pending",
    },
    items: [
      {
        book: { type: mongoose.Schema.Types.Mixed },
        title: { type: String },
        author: { type: String },
        coverColor: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    upiId: { type: String, default: "bookstore@upi" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
